import { FLRowData, FLRowRecord, FunclocModule } from '../types/flTypes';
import { findLovByCityName, findLovByCityId, fuzzyMatchCityName } from '../data/lovDatabase';
import { findSniByCityName, findSniByCityId, fuzzyMatchSniCityName } from '../data/sniDatabase';
import { extractDigit6to8, validateFLRow, lookupCityReference } from './validationService';

export interface RepairChange {
  field: keyof FLRowData;
  oldVal: string;
  newVal: string;
  reason: string;
}

export interface RepairResult {
  updatedRecord: FLRowRecord;
  changesMade: RepairChange[];
}

/**
 * BUTTON 1 ACTION:
 * Validate & Update Plan Section, Planning Plant, Maint Plant, Work Center, Cost Center
 * based on City ID generated from City Name (LOV/SNI based on active module).
 * Stores generated City ID in Column AH. Sets Column AE = "ID".
 * Column A is IMMUTABLE PRIMARY KEY and remains untouched!
 */
export function repairPlanSectionFromCityName(record: FLRowRecord, module: FunclocModule = 'ZFS04'): RepairResult {
  const current = { ...record.data };
  const changes: RepairChange[] = [];

  const cityName = current.city ? current.city.trim() : '';
  const { item: refItem, fuzzySuggestion } = lookupCityReference(cityName, module);

  // If exact match not found, check fuzzy match for typos
  if (!refItem && fuzzySuggestion && fuzzySuggestion.similarity >= 0.60) {
    changes.push({
      field: 'city',
      oldVal: current.city,
      newVal: fuzzySuggestion.cityHomepass,
      reason: `Koreksi typo nama kota '${cityName}' -> '${fuzzySuggestion.cityHomepass}' (${Math.round(fuzzySuggestion.similarity * 100)}% akurat referensi ${fuzzySuggestion.sourceTable})`
    });
    current.city = fuzzySuggestion.cityHomepass;
  }

  // Re-lookup with corrected or current city
  const activeRef = lookupCityReference(current.city, module).item || refItem;

  if (activeRef) {
    const { cityId, plant, workCenter, costCenter, cityName: refCityName, source } = activeRef;

    // 1. Generate City ID into Column AH (New Column)
    if (current.cityIdGenerated !== cityId) {
      changes.push({
        field: 'cityIdGenerated',
        oldVal: current.cityIdGenerated || '(kosong)',
        newVal: cityId,
        reason: `Generate City ID 3-digit ke Kolom AH dari '${refCityName}' (${source})`
      });
      current.cityIdGenerated = cityId;
    }

    // 2. Set Plan Section (Column H) = City ID (3 digits)
    if (current.plantSection !== cityId) {
      changes.push({
        field: 'plantSection',
        oldVal: current.plantSection || '(kosong)',
        newVal: cityId,
        reason: `Update Plan Section (Kolom H) mengikuti City ID '${cityId}'`
      });
      current.plantSection = cityId;
    }

    // 3. Set Planning Plant (Column F) & Maint Plant (Column I) = Reference Plant
    if (current.planningPlant !== plant) {
      changes.push({
        field: 'planningPlant',
        oldVal: current.planningPlant || '(kosong)',
        newVal: plant,
        reason: `Update Planning Plant (Kolom F) ke '${plant}' berdasarkan referensi ${source}`
      });
      current.planningPlant = plant;
    }

    if (current.maintPlant !== plant) {
      changes.push({
        field: 'maintPlant',
        oldVal: current.maintPlant || '(kosong)',
        newVal: plant,
        reason: `Update Maint. Plant (Kolom I) ke '${plant}' berdasarkan referensi ${source}`
      });
      current.maintPlant = plant;
    }

    // 4. Set Work Center (Column J)
    if (current.workCenter !== workCenter) {
      changes.push({
        field: 'workCenter',
        oldVal: current.workCenter || '(kosong)',
        newVal: workCenter,
        reason: `Update Work Center (Kolom J) ke '${workCenter}' berdasarkan referensi ${source}`
      });
      current.workCenter = workCenter;
    }

    // 5. Set Cost Center (Column K)
    if (current.costCenter !== costCenter) {
      changes.push({
        field: 'costCenter',
        oldVal: current.costCenter || '(kosong)',
        newVal: costCenter,
        reason: `Update Cost Center (Kolom K) ke '${costCenter}' berdasarkan referensi ${source}`
      });
      current.costCenter = costCenter;
    }

    // 6. Ensure Column AE (Country) is 'ID'
    if (current.country !== 'ID') {
      changes.push({
        field: 'country',
        oldVal: current.country || '(kosong)',
        newVal: 'ID',
        reason: 'Standarisasi Kolom AE (Country) = ID'
      });
      current.country = 'ID';
    }

    // 7. Ensure Structure indicator matches module blueprint (ZFS01 or ZFS04)
    const expectedStructure = module === 'ZFS01' ? 'ZFS01' : 'ZFS04';
    if (current.structureIndicator !== expectedStructure) {
      changes.push({
        field: 'structureIndicator',
        oldVal: current.structureIndicator || '(kosong)',
        newVal: expectedStructure,
        reason: `Standarisasi Structure Indicator = ${expectedStructure} (Modul ${module})`
      });
      current.structureIndicator = expectedStructure;
    }
  }

  const updatedRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData, module);
  updatedRecord.module = module;
  return { updatedRecord, changesMade: changes };
}

/**
 * BUTTON 2 ACTION:
 * Validate & Sync Plant Section (Column H) with 3 digits (digit 6-8) from Column A (FL Code).
 * If mismatched, Column H is updated to match Column A.
 * Also syncs Superior FL (Column D) to expected hierarchy parent (Level 2 for ZFS01, Level 3 for ZFS04).
 * Column A is IMMUTABLE PRIMARY KEY and is NEVER modified!
 */
export function syncPlantSectionWithFLCode(record: FLRowRecord, module: FunclocModule = 'ZFS04'): RepairResult {
  const current = { ...record.data };
  const changes: RepairChange[] = [];

  const digit6to8 = extractDigit6to8(current.functionalLocation);
  
  if (digit6to8 && current.plantSection !== digit6to8) {
    changes.push({
      field: 'plantSection',
      oldVal: current.plantSection || '(kosong)',
      newVal: digit6to8,
      reason: `Sinkronkan Plant Section (Kolom H) dengan 3-digit Kolom A ('${digit6to8}')`
    });
    current.plantSection = digit6to8;

    // Check if Reference has this city code, and if so, populate Column AH as well
    const refByCode = module === 'ZFS01' 
      ? (findSniByCityId(digit6to8) || findLovByCityId(digit6to8))
      : (findLovByCityId(digit6to8) || findSniByCityId(digit6to8));

    if (refByCode && current.cityIdGenerated !== refByCode.cityId) {
      changes.push({
        field: 'cityIdGenerated',
        oldVal: current.cityIdGenerated || '(kosong)',
        newVal: refByCode.cityId,
        reason: `Update Kolom AH ke '${refByCode.cityId}' sesuai referensi`
      });
      current.cityIdGenerated = refByCode.cityId;
    }
  }

  // Check Parent-Child Hierarchy Violation between Superior FL (Column D) vs Column A (Primary Key)
  // In ZFS01: Level 2 -> [Plant]-[CityID], e.g. 1011-ARS
  // In ZFS04: Level 3 -> [Plant]-[CityID]-[Pole], e.g. 1011-LBP-T00014433
  if (current.functionalLocation) {
    const flParts = current.functionalLocation.split('-');
    const lastHyphen = current.functionalLocation.lastIndexOf('-');
    let expectedSup = '';
    if (module === 'ZFS01') {
      expectedSup = flParts.length >= 2 ? `${flParts[0]}-${flParts[1]}` : current.functionalLocation;
    } else {
      expectedSup = lastHyphen > 0 
        ? (flParts.length > 3 ? flParts.slice(0, 3).join('-') : current.functionalLocation.substring(0, lastHyphen))
        : current.functionalLocation;
    }
    
    // Check if Column D violates parent-child prefix or mismatch
    const hasHierarchyViolation = !current.superiorFunctLoc || !current.functionalLocation.startsWith(`${current.superiorFunctLoc}-`);
    if (expectedSup && (hasHierarchyViolation || current.superiorFunctLoc !== expectedSup)) {
      changes.push({
        field: 'superiorFunctLoc',
        oldVal: current.superiorFunctLoc || '(kosong)',
        newVal: expectedSup,
        reason: `Perbaiki Hierarchy Violation: Sinkronkan Superior FL (Kolom D) dengan parent prefix Kolom A ('${expectedSup}') sesuai Modul ${module}`
      });
      current.superiorFunctLoc = expectedSup;
    }
  }

  const updatedRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData, module);
  updatedRecord.module = module;
  return { updatedRecord, changesMade: changes };
}

/**
 * Batch repair for Button 1 (Validate & Sync Plan Section from City Name)
 */
export function batchRepairPlanSection(records: FLRowRecord[], module: FunclocModule = 'ZFS04'): {
  repairedRecords: FLRowRecord[];
  totalRepairedCount: number;
  totalChanges: number;
} {
  let totalChanges = 0;
  let totalRepairedCount = 0;

  const repairedRecords = records.map(record => {
    const { updatedRecord, changesMade } = repairPlanSectionFromCityName(record, module);
    if (changesMade.length > 0) {
      totalChanges += changesMade.length;
      totalRepairedCount++;
    }
    return updatedRecord;
  });

  return { repairedRecords, totalRepairedCount, totalChanges };
}

/**
 * Batch sync for Button 2 (Validate FL 3-digit vs Plant Section)
 */
export function batchSyncFLVsPlantSection(records: FLRowRecord[], module: FunclocModule = 'ZFS04'): {
  repairedRecords: FLRowRecord[];
  totalRepairedCount: number;
  totalChanges: number;
  mismatchCountBefore: number;
} {
  let totalChanges = 0;
  let totalRepairedCount = 0;
  let mismatchCountBefore = 0;

  records.forEach(r => {
    const digit6to8 = extractDigit6to8(r.data.functionalLocation);
    if (digit6to8 && r.data.plantSection !== digit6to8) {
      mismatchCountBefore++;
    }
  });

  const repairedRecords = records.map(record => {
    const { updatedRecord, changesMade } = syncPlantSectionWithFLCode(record, module);
    if (changesMade.length > 0) {
      totalChanges += changesMade.length;
      totalRepairedCount++;
    }
    return updatedRecord;
  });

  return { repairedRecords, totalRepairedCount, totalChanges, mismatchCountBefore };
}

/**
 * Repairs coordinate field (Kolom N) if fixable (e.g. inverted coordinate or formatting)
 */
export function repairCoordinateField(record: FLRowRecord, module: FunclocModule = 'ZFS04'): RepairResult {
  const current = { ...record.data };
  const changes: RepairChange[] = [];
  const coordIssue = record.issues.find(i => i.rule === 'RULE_8_COORDINATES' && i.canAutoFix && i.suggestedFix);

  if (coordIssue && coordIssue.suggestedFix && current.latLong !== coordIssue.suggestedFix) {
    changes.push({
      field: 'latLong',
      oldVal: current.latLong,
      newVal: coordIssue.suggestedFix,
      reason: coordIssue.message
    });
    current.latLong = coordIssue.suggestedFix;
  }

  const updatedRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData, module);
  updatedRecord.module = module;
  return { updatedRecord, changesMade: changes };
}

/**
 * Full auto-repair for single row (combines Button 1, Button 2, and Coordinate fix, strictly keeping Column A untouched)
 */
export function autoRepairRow(record: FLRowRecord, module: FunclocModule = 'ZFS04'): RepairResult {
  // First sync plan section and hierarchy from city name
  const step1 = repairPlanSectionFromCityName(record, module);
  // Then check FL parent relationship (Superior FL sync)
  const step2 = syncPlantSectionWithFLCode(step1.updatedRecord, module);
  // Then check coordinate formatting / inversion
  const step3 = repairCoordinateField(step2.updatedRecord, module);
  
  const allChanges = [...step1.changesMade, ...step2.changesMade, ...step3.changesMade];
  return { updatedRecord: step3.updatedRecord, changesMade: allChanges };
}

/**
 * Batch repair all rows
 */
export function autoRepairAll(records: FLRowRecord[], module: FunclocModule = 'ZFS04'): {
  repairedRecords: FLRowRecord[];
  totalRepairedCount: number;
  totalChanges: number;
} {
  let totalChanges = 0;
  let totalRepairedCount = 0;

  const repairedRecords = records.map(record => {
    const { updatedRecord, changesMade } = autoRepairRow(record, module);
    if (changesMade.length > 0) {
      totalChanges += changesMade.length;
      totalRepairedCount++;
    }
    return updatedRecord;
  });

  return { repairedRecords, totalRepairedCount, totalChanges };
}

/**
 * Applies fuzzy suggestion for typo city name and immediately syncs hierarchy
 */
export function applyFuzzyCitySuggestion(record: FLRowRecord, module: FunclocModule = 'ZFS04'): RepairResult {
  const current = { ...record.data };
  const changes: RepairChange[] = [];

  if (record.fuzzyCitySuggestion) {
    const targetName = record.fuzzyCitySuggestion.cityHomepass;
    changes.push({
      field: 'city',
      oldVal: current.city,
      newVal: targetName,
      reason: `Koreksi penulisan nama kota '${current.city}' -> '${targetName}' (${Math.round(record.fuzzyCitySuggestion.similarity * 100)}% akurat referensi ${record.fuzzyCitySuggestion.sourceTable || module})`
    });
    current.city = targetName;
  }

  const tempRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData, module);
  const syncResult = repairPlanSectionFromCityName(tempRecord, module);
  return {
    updatedRecord: syncResult.updatedRecord,
    changesMade: [...changes, ...syncResult.changesMade]
  };
}

/**
 * Batch apply all fuzzy typo suggestions across all records
 */
export function batchApplyAllFuzzyTypoSuggestions(records: FLRowRecord[], module: FunclocModule = 'ZFS04'): {
  repairedRecords: FLRowRecord[];
  totalFixedCount: number;
} {
  let totalFixedCount = 0;
  const repairedRecords = records.map(record => {
    if (record.fuzzyCitySuggestion) {
      const { updatedRecord } = applyFuzzyCitySuggestion(record, module);
      totalFixedCount++;
      return updatedRecord;
    }
    return record;
  });
  return { repairedRecords, totalFixedCount };
}

/**
 * Batch repair all hierarchy violation issues across all records
 */
export function batchRepairHierarchy(records: FLRowRecord[], module: FunclocModule = 'ZFS04'): {
  repairedRecords: FLRowRecord[];
  totalFixedCount: number;
} {
  let totalFixedCount = 0;
  const repairedRecords = records.map(record => {
    const hasHierarchyIssue = record.issues.some(i => i.rule === 'RULE_HIERARCHY_VIOLATION');
    if (hasHierarchyIssue) {
      const { updatedRecord, changesMade } = autoRepairRow(record, module);
      if (changesMade.length > 0) {
        totalFixedCount++;
        return updatedRecord;
      }
    }
    return record;
  });
  return { repairedRecords, totalFixedCount };
}

/**
 * Resets record to original
 */
export function resetRecord(record: FLRowRecord, module: FunclocModule = 'ZFS04'): FLRowRecord {
  const reset = validateFLRow(record.originalData, record.rowIndex, record.id, record.originalData, module);
  reset.module = module;
  return reset;
}

export interface BatchRepairProgress {
  stage: string;
  current: number;
  total: number;
  percent: number;
  speedRowsPerSec?: number;
  elapsedSeconds?: number;
}

/**
 * Async chunked batch repair for Button 1 (Validate Plan Section)
 */
export async function batchRepairPlanSectionAsync(
  records: FLRowRecord[], 
  module: FunclocModule = 'ZFS04',
  onProgress?: (p: BatchRepairProgress) => void,
  batchSize = 5000
): Promise<{ repairedRecords: FLRowRecord[]; totalRepairedCount: number; totalChanges: number }> {
  const startTime = performance.now();
  const total = records.length;
  let totalChanges = 0;
  let totalRepairedCount = 0;
  const repairedRecords: FLRowRecord[] = new Array(total);

  for (let offset = 0; offset < total; offset += batchSize) {
    const end = Math.min(offset + batchSize, total);

    for (let idx = offset; idx < end; idx++) {
      const record = records[idx];
      const { updatedRecord, changesMade } = repairPlanSectionFromCityName(record, module);
      if (changesMade.length > 0) {
        totalChanges += changesMade.length;
        totalRepairedCount++;
      }
      repairedRecords[idx] = updatedRecord;
    }

    const elapsedMs = Math.max(1, performance.now() - startTime);
    const speed = Math.round(end / (elapsedMs / 1000));
    const percent = Math.min(100, Math.round((end / total) * 100));

    onProgress?.({
      stage: `Menyinkronkan City ID & Plan Section baris ${offset.toLocaleString()} - ${end.toLocaleString()}...`,
      current: end,
      total,
      percent,
      speedRowsPerSec: speed,
      elapsedSeconds: Math.round(elapsedMs / 100) / 10
    });

    await new Promise(r => setTimeout(r, 0));
  }

  return { repairedRecords, totalRepairedCount, totalChanges };
}

/**
 * Async chunked batch sync for Button 2 (Validate FL 3-Digit vs Plan Section)
 */
export async function batchSyncFLVsPlantSectionAsync(
  records: FLRowRecord[], 
  module: FunclocModule = 'ZFS04',
  onProgress?: (p: BatchRepairProgress) => void,
  batchSize = 5000
): Promise<{ repairedRecords: FLRowRecord[]; totalRepairedCount: number; totalChanges: number; mismatchCountBefore: number }> {
  const startTime = performance.now();
  const total = records.length;
  let totalChanges = 0;
  let totalRepairedCount = 0;
  let mismatchCountBefore = 0;

  records.forEach(r => {
    const digit6to8 = extractDigit6to8(r.data.functionalLocation);
    if (digit6to8 && r.data.plantSection !== digit6to8) {
      mismatchCountBefore++;
    }
  });

  const repairedRecords: FLRowRecord[] = new Array(total);

  for (let offset = 0; offset < total; offset += batchSize) {
    const end = Math.min(offset + batchSize, total);

    for (let idx = offset; idx < end; idx++) {
      const record = records[idx];
      const { updatedRecord, changesMade } = syncPlantSectionWithFLCode(record, module);
      if (changesMade.length > 0) {
        totalChanges += changesMade.length;
        totalRepairedCount++;
      }
      repairedRecords[idx] = updatedRecord;
    }

    const elapsedMs = Math.max(1, performance.now() - startTime);
    const speed = Math.round(end / (elapsedMs / 1000));
    const percent = Math.min(100, Math.round((end / total) * 100));

    onProgress?.({
      stage: `Mencocokkan 3-digit FL Kolom A dengan Plan Section baris ${offset.toLocaleString()} - ${end.toLocaleString()}...`,
      current: end,
      total,
      percent,
      speedRowsPerSec: speed,
      elapsedSeconds: Math.round(elapsedMs / 100) / 10
    });

    await new Promise(r => setTimeout(r, 0));
  }

  return { repairedRecords, totalRepairedCount, totalChanges, mismatchCountBefore };
}

/**
 * Async chunked batch fix for all typos
 */
export async function batchApplyAllFuzzyTypoSuggestionsAsync(
  records: FLRowRecord[], 
  module: FunclocModule = 'ZFS04',
  onProgress?: (p: BatchRepairProgress) => void,
  batchSize = 5000
): Promise<{ repairedRecords: FLRowRecord[]; totalFixedCount: number }> {
  const startTime = performance.now();
  const total = records.length;
  let totalFixedCount = 0;
  const repairedRecords: FLRowRecord[] = new Array(total);

  for (let offset = 0; offset < total; offset += batchSize) {
    const end = Math.min(offset + batchSize, total);

    for (let idx = offset; idx < end; idx++) {
      const record = records[idx];
      if (record.fuzzyCitySuggestion) {
        const { updatedRecord } = applyFuzzyCitySuggestion(record, module);
        totalFixedCount++;
        repairedRecords[idx] = updatedRecord;
      } else {
        repairedRecords[idx] = record;
      }
    }

    const elapsedMs = Math.max(1, performance.now() - startTime);
    const speed = Math.round(end / (elapsedMs / 1000));
    const percent = Math.min(100, Math.round((end / total) * 100));

    onProgress?.({
      stage: `Memperbaiki typo nama kota baris ${offset.toLocaleString()} - ${end.toLocaleString()}...`,
      current: end,
      total,
      percent,
      speedRowsPerSec: speed,
      elapsedSeconds: Math.round(elapsedMs / 100) / 10
    });

    await new Promise(r => setTimeout(r, 0));
  }

  return { repairedRecords, totalFixedCount };
}

/**
 * Async chunked batch fix for all hierarchy violations
 */
export async function batchRepairHierarchyAsync(
  records: FLRowRecord[], 
  module: FunclocModule = 'ZFS04',
  onProgress?: (p: BatchRepairProgress) => void,
  batchSize = 5000
): Promise<{ repairedRecords: FLRowRecord[]; totalFixedCount: number }> {
  const startTime = performance.now();
  const total = records.length;
  let totalFixedCount = 0;
  const repairedRecords: FLRowRecord[] = new Array(total);

  for (let offset = 0; offset < total; offset += batchSize) {
    const end = Math.min(offset + batchSize, total);

    for (let idx = offset; idx < end; idx++) {
      const record = records[idx];
      const hasHierarchyIssue = record.issues.some(i => i.rule === 'RULE_HIERARCHY_VIOLATION');
      if (hasHierarchyIssue) {
        const { updatedRecord, changesMade } = autoRepairRow(record, module);
        if (changesMade.length > 0) {
          totalFixedCount++;
          repairedRecords[idx] = updatedRecord;
          continue;
        }
      }
      repairedRecords[idx] = record;
    }

    const elapsedMs = Math.max(1, performance.now() - startTime);
    const speed = Math.round(end / (elapsedMs / 1000));
    const percent = Math.min(100, Math.round((end / total) * 100));

    onProgress?.({
      stage: `Menyelaraskan parent hierarchy Kolom D ↔ A baris ${offset.toLocaleString()} - ${end.toLocaleString()}...`,
      current: end,
      total,
      percent,
      speedRowsPerSec: speed,
      elapsedSeconds: Math.round(elapsedMs / 100) / 10
    });

    await new Promise(r => setTimeout(r, 0));
  }

  return { repairedRecords, totalFixedCount };
}


