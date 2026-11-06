import { FLRowData, FLRowRecord } from '../types/flTypes';
import { findLovByCityName, findLovByCityId, fuzzyMatchCityName } from '../data/lovDatabase';
import { extractDigit6to8, validateFLRow } from './validationService';

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
 * based on City ID generated from City Name (LOV).
 * Stores generated City ID in Column AH. Sets Column AE = "ID".
 * Column A is IMMUTABLE PRIMARY KEY and remains untouched!
 */
export function repairPlanSectionFromCityName(record: FLRowRecord): RepairResult {
  const current = { ...record.data };
  const changes: RepairChange[] = [];

  const cityName = current.city ? current.city.trim() : '';
  let lovByCity = findLovByCityName(cityName);

  // If exact match not found, check fuzzy match for typos
  if (!lovByCity && cityName) {
    const fuzzy = fuzzyMatchCityName(cityName);
    if (fuzzy && fuzzy.similarity >= 0.65) {
      lovByCity = fuzzy.lovItem;
      changes.push({
        field: 'city',
        oldVal: current.city,
        newVal: fuzzy.lovItem.cityHomepass,
        reason: `Koreksi typo nama kota '${cityName}' -> '${fuzzy.lovItem.cityHomepass}' (${Math.round(fuzzy.similarity * 100)}% akurat)`
      });
      current.city = fuzzy.lovItem.cityHomepass;
    }
  }

  if (lovByCity) {
    const { cityId, plant, workCenter, costCenter, cityHomepass } = lovByCity;

    // 1. Generate City ID into Column AH (New Column)
    if (current.cityIdGenerated !== cityId) {
      changes.push({
        field: 'cityIdGenerated',
        oldVal: current.cityIdGenerated || '(kosong)',
        newVal: cityId,
        reason: `Generate City ID 3-digit ke Kolom AH dari '${cityHomepass}' (LOV)`
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

    // 3. Set Planning Plant (Column F) & Maint Plant (Column I) = LOV Plant
    if (current.planningPlant !== plant) {
      changes.push({
        field: 'planningPlant',
        oldVal: current.planningPlant || '(kosong)',
        newVal: plant,
        reason: `Update Planning Plant (Kolom F) ke '${plant}' berdasarkan LOV`
      });
      current.planningPlant = plant;
    }

    if (current.maintPlant !== plant) {
      changes.push({
        field: 'maintPlant',
        oldVal: current.maintPlant || '(kosong)',
        newVal: plant,
        reason: `Update Maint. Plant (Kolom I) ke '${plant}' berdasarkan LOV`
      });
      current.maintPlant = plant;
    }

    // 4. Set Work Center (Column J)
    if (current.workCenter !== workCenter) {
      changes.push({
        field: 'workCenter',
        oldVal: current.workCenter || '(kosong)',
        newVal: workCenter,
        reason: `Update Work Center (Kolom J) ke '${workCenter}' berdasarkan LOV`
      });
      current.workCenter = workCenter;
    }

    // 5. Set Cost Center (Column K)
    if (current.costCenter !== costCenter) {
      changes.push({
        field: 'costCenter',
        oldVal: current.costCenter || '(kosong)',
        newVal: costCenter,
        reason: `Update Cost Center (Kolom K) ke '${costCenter}' berdasarkan LOV`
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

    // 7. Ensure Structure indicator is ZFS04
    if (current.structureIndicator !== 'ZFS04') {
      changes.push({
        field: 'structureIndicator',
        oldVal: current.structureIndicator || '(kosong)',
        newVal: 'ZFS04',
        reason: 'Standarisasi Structure Indicator = ZFS04'
      });
      current.structureIndicator = 'ZFS04';
    }
  }

  const updatedRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData);
  return { updatedRecord, changesMade: changes };
}

/**
 * BUTTON 2 ACTION:
 * Validate & Sync Plant Section (Column H) with 3 digits (digit 6-8) from Column A (FL Code).
 * If mismatched, Column H is updated to match Column A.
 * Column A is IMMUTABLE PRIMARY KEY and is NEVER modified!
 */
export function syncPlantSectionWithFLCode(record: FLRowRecord): RepairResult {
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

    // Check if LOV has this city code, and if so, populate Column AH as well
    const lovByCode = findLovByCityId(digit6to8);
    if (lovByCode && current.cityIdGenerated !== lovByCode.cityId) {
      changes.push({
        field: 'cityIdGenerated',
        oldVal: current.cityIdGenerated || '(kosong)',
        newVal: lovByCode.cityId,
        reason: `Update Kolom AH ke '${lovByCode.cityId}' sesuai LOV`
      });
      current.cityIdGenerated = lovByCode.cityId;
    }
  }

  // Also check Superior FL (Column D) vs Column A
  if (current.functionalLocation) {
    const flParts = current.functionalLocation.split('-');
    if (flParts.length >= 3) {
      const expectedSup = flParts.slice(0, 3).join('-');
      if (current.superiorFunctLoc !== expectedSup) {
        changes.push({
          field: 'superiorFunctLoc',
          oldVal: current.superiorFunctLoc || '(kosong)',
          newVal: expectedSup,
          reason: `Sinkronkan Superior FL (Kolom D) dengan hierarki parent Kolom A ('${expectedSup}')`
        });
        current.superiorFunctLoc = expectedSup;
      }
    }
  }

  const updatedRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData);
  return { updatedRecord, changesMade: changes };
}

/**
 * Batch repair for Button 1 (Validate & Sync Plan Section from City Name)
 */
export function batchRepairPlanSection(records: FLRowRecord[]): {
  repairedRecords: FLRowRecord[];
  totalRepairedCount: number;
  totalChanges: number;
} {
  let totalChanges = 0;
  let totalRepairedCount = 0;

  const repairedRecords = records.map(record => {
    const { updatedRecord, changesMade } = repairPlanSectionFromCityName(record);
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
export function batchSyncFLVsPlantSection(records: FLRowRecord[]): {
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
    const { updatedRecord, changesMade } = syncPlantSectionWithFLCode(record);
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
export function repairCoordinateField(record: FLRowRecord): RepairResult {
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

  const updatedRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData);
  return { updatedRecord, changesMade: changes };
}

/**
 * Full auto-repair for single row (combines Button 1, Button 2, and Coordinate fix, strictly keeping Column A untouched)
 */
export function autoRepairRow(record: FLRowRecord): RepairResult {
  // First sync plan section and hierarchy from city name
  const step1 = repairPlanSectionFromCityName(record);
  // Then check FL parent relationship (Superior FL sync)
  const step2 = syncPlantSectionWithFLCode(step1.updatedRecord);
  // Then check coordinate formatting / inversion
  const step3 = repairCoordinateField(step2.updatedRecord);
  
  const allChanges = [...step1.changesMade, ...step2.changesMade, ...step3.changesMade];
  return { updatedRecord: step3.updatedRecord, changesMade: allChanges };
}

/**
 * Batch repair all rows
 */
export function autoRepairAll(records: FLRowRecord[]): {
  repairedRecords: FLRowRecord[];
  totalRepairedCount: number;
  totalChanges: number;
} {
  let totalChanges = 0;
  let totalRepairedCount = 0;

  const repairedRecords = records.map(record => {
    const { updatedRecord, changesMade } = autoRepairRow(record);
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
export function applyFuzzyCitySuggestion(record: FLRowRecord): RepairResult {
  const current = { ...record.data };
  const changes: RepairChange[] = [];

  if (record.fuzzyCitySuggestion) {
    const targetName = record.fuzzyCitySuggestion.cityHomepass;
    changes.push({
      field: 'city',
      oldVal: current.city,
      newVal: targetName,
      reason: `Koreksi typo nama kota '${current.city}' -> '${targetName}' (${Math.round(record.fuzzyCitySuggestion.similarity * 100)}% akurat)`
    });
    current.city = targetName;
  }

  const tempRecord = validateFLRow(current, record.rowIndex, record.id, record.originalData);
  const syncResult = repairPlanSectionFromCityName(tempRecord);
  return {
    updatedRecord: syncResult.updatedRecord,
    changesMade: [...changes, ...syncResult.changesMade]
  };
}

/**
 * Batch apply all fuzzy typo suggestions across all records
 */
export function batchApplyAllFuzzyTypoSuggestions(records: FLRowRecord[]): {
  repairedRecords: FLRowRecord[];
  totalFixedCount: number;
} {
  let totalFixedCount = 0;
  const repairedRecords = records.map(record => {
    if (record.fuzzyCitySuggestion) {
      const { updatedRecord } = applyFuzzyCitySuggestion(record);
      totalFixedCount++;
      return updatedRecord;
    }
    return record;
  });
  return { repairedRecords, totalFixedCount };
}

/**
 * Resets record to original
 */
export function resetRecord(record: FLRowRecord): FLRowRecord {
  return validateFLRow(record.originalData, record.rowIndex, record.id, record.originalData);
}
