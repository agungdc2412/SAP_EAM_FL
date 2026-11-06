import { FLRowData, FLRowRecord, ValidationIssue, ValidationSummary, FL_COLUMNS } from '../types/flTypes';
import { findLovByCityName, findLovByCityId, findLovByPlantAndCity, fuzzyMatchCityName } from '../data/lovDatabase';

/**
 * Extracts the 3-character city code from Column A (digit 6-8, 1-indexed)
 * E.g., for "1011-LBP-T00014433-20351H000.1.01897", returns "LBP"
 */
export function extractDigit6to8(flCode: string): string {
  if (!flCode) return '';
  const trimmed = flCode.trim();
  
  // Hyphen separated format: PLANT-CITY-...
  const parts = trimmed.split('-');
  if (parts.length >= 2 && parts[1].length === 3) {
    return parts[1].toUpperCase();
  }
  
  // Strict 1-indexed chars 6 to 8 (0-indexed 5 to 8)
  if (trimmed.length >= 8) {
    return trimmed.substring(5, 8).toUpperCase();
  }
  
  return parts.length >= 2 ? parts[1].toUpperCase() : '';
}

/**
 * Extracts Level 2 General (PLANT-CITY) from a functional location code
 */
export function extractLev2General(code: string): { plant: string; cityId: string; formatted: string } | null {
  if (!code) return null;
  const parts = code.trim().split('-');
  if (parts.length >= 2) {
    return {
      plant: parts[0].toUpperCase(),
      cityId: parts[1].toUpperCase(),
      formatted: `${parts[0].toUpperCase()}-${parts[1].toUpperCase()}`
    };
  }
  return null;
}

/**
 * Validates coordinate format for Column N (Latitude and Longitude)
 * Standard SAP PM format: "latitude,longitude" (e.g. "3.5618141,98.6028937" or "-6.211451,106.920831")
 * Detects:
 * - Empty coordinates
 * - Inverted coordinates (Longitude first, e.g. "98.6028937,3.5618141")
 * - Non-standard delimiters (semicolon, multiple spaces, "lat:", etc.)
 * - Out-of-bounds coordinates for Indonesia (Lat ~-11° to 6°, Long ~95° to 141°)
 * - Length exceeding SAP 30 chars
 */
export function validateCoordinate(rawCoord: string): {
  severity: 'error' | 'warning';
  message: string;
  suggestedFix?: string;
  canAutoFix: boolean;
}[] {
  const issues: {
    severity: 'error' | 'warning';
    message: string;
    suggestedFix?: string;
    canAutoFix: boolean;
  }[] = [];

  const trimmed = (rawCoord || '').trim();
  if (!trimmed) {
    return issues;
  }

  // Normalize delimiters (e.g. ';' or ' / ' or spaces to single comma)
  const cleaned = trimmed
    .replace(/[;\/\s]+/g, ',')
    .replace(/^lat[:\s]*/i, '')
    .replace(/long[:\s]*/i, '');

  const parts = cleaned.split(',').filter(p => p.length > 0);
  
  if (parts.length !== 2) {
    issues.push({
      severity: 'error',
      message: `Format koordinat Kolom N tidak valid ('${trimmed}'). Wajib format desimal 'Latitude,Longitude' (contoh: -6.211451,106.920831).`,
      canAutoFix: false
    });
    return issues;
  }

  const p1 = parseFloat(parts[0]);
  const p2 = parseFloat(parts[1]);

  if (isNaN(p1) || isNaN(p2)) {
    issues.push({
      severity: 'error',
      message: `Nilai koordinat Kolom N mengandung karakter bukan angka ('${trimmed}').`,
      canAutoFix: false
    });
    return issues;
  }

  // Inverted Coordinate Detection:
  // In Indonesia: Longitude is 95.0 to 141.0, Latitude is -11.0 to +6.0
  const isP1Longitude = p1 >= 90 && p1 <= 145;
  const isP2Latitude = p2 >= -12 && p2 <= 8;

  if (isP1Longitude && isP2Latitude) {
    // Inverted! Pos 1 is Longitude, Pos 2 is Latitude
    const latFixed = p2.toFixed(7).replace(/\.?0+$/, '');
    const lngFixed = p1.toFixed(7).replace(/\.?0+$/, '');
    const invertedFix = `${latFixed},${lngFixed}`;
    issues.push({
      severity: 'error',
      message: `Koordinat terbalik! Posisi 1 adalah Longitude (${p1}) dan Posisi 2 adalah Latitude (${p2}). Standar SAP PM mewajibkan format 'Latitude,Longitude'.`,
      suggestedFix: invertedFix,
      canAutoFix: true
    });
    return issues;
  }

  const lat = p1;
  const lng = p2;

  const latStr = lat.toFixed(7).replace(/\.?0+$/, '');
  const lngStr = lng.toFixed(7).replace(/\.?0+$/, '');
  const standardFormat = `${latStr},${lngStr}`;

  if (trimmed.includes(' ') || trimmed.includes(';') || trimmed.includes('/') || trimmed !== standardFormat) {
    issues.push({
      severity: 'warning',
      message: `Format pemisah atau spasi koordinat Kolom N ('${trimmed}') perlu distandarisasi ke '${standardFormat}'.`,
      suggestedFix: standardFormat,
      canAutoFix: true
    });
  }

  if (lat < -11.5 || lat > 6.5) {
    issues.push({
      severity: 'warning',
      message: `Titik Latitude (${lat}) berada di luar batas wilayah geografis Indonesia (-11.0° s/d 6.0°).`,
      canAutoFix: false
    });
  }

  if (lng < 94.0 || lng > 141.5) {
    issues.push({
      severity: 'warning',
      message: `Titik Longitude (${lng}) berada di luar batas wilayah geografis Indonesia (95.0° s/d 141.0°).`,
      canAutoFix: false
    });
  }

  return issues;
}

/**
 * Validates a single row against all SAP PM Functional Location rules
 * NOTE: Column A (Functional Location) is strictly IMMUTABLE PRIMARY KEY.
 */
export function validateFLRow(data: FLRowData, rowIndex: number, id: string, originalData?: FLRowData): FLRowRecord {
  const issues: ValidationIssue[] = [];
  const flCode = (data.functionalLocation || '').trim();
  const superiorFl = (data.superiorFunctLoc || '').trim();
  const plantSection = (data.plantSection || '').trim().toUpperCase();
  const cityName = (data.city || '').trim();
  const cityIdGenerated = (data.cityIdGenerated || '').trim().toUpperCase();
  const country = (data.country || '').trim().toUpperCase();

  // Lookup in LOV
  const lovFromCity = findLovByCityName(cityName);
  const digit6to8 = extractDigit6to8(flCode);

  // -------------------------------------------------------------
  // RULE 1: VALIDASI KOLOM SUPERRIOR (D) FL DENGAN KODE FL DIKOLOM (A)
  // HARUS SESUAI DENGAN KONFIGURASI FL LEV2 GENERAL (PLANT-CITY)
  // Kolom A adalah Primary Key, maka Kolom D yang disesuaikan mengikuti Kolom A.
  // -------------------------------------------------------------
  const flLev2 = extractLev2General(flCode);
  const supLev2 = extractLev2General(superiorFl);

  if (!flCode) {
    issues.push({
      id: `${id}_r1_fl_empty`,
      rule: 'RULE_1_SUPERIOR_FL',
      field: 'functionalLocation',
      columnLetter: 'A',
      severity: 'error',
      message: 'Kode Functional Location (Kolom A) sebagai Primary Key tidak boleh kosong.',
      canAutoFix: false
    });
  }

  if (!superiorFl && flCode) {
    const expectedSup = flCode.split('-').slice(0, 3).join('-');
    issues.push({
      id: `${id}_r1_sup_empty`,
      rule: 'RULE_1_SUPERIOR_FL',
      field: 'superiorFunctLoc',
      columnLetter: 'D',
      severity: 'error',
      message: 'Superior FunctLoc. (Kolom D) tidak boleh kosong.',
      suggestedFix: expectedSup,
      canAutoFix: true
    });
  } else if (flLev2 && supLev2) {
    // Check if Superior FL prefix matches FL Code prefix
    if (flLev2.formatted !== supLev2.formatted) {
      const flParts = flCode.split('-');
      const expectedSup = flParts.length >= 3 ? flParts.slice(0, 3).join('-') : `${flLev2.formatted}-${superiorFl.split('-')[2] || 'POLE'}`;
      issues.push({
        id: `${id}_r1_mismatch_lev2`,
        rule: 'RULE_1_SUPERIOR_FL',
        field: 'superiorFunctLoc',
        columnLetter: 'D',
        severity: 'error',
        message: `Prefix Lev 2 Superior FL ('${supLev2.formatted}') tidak sesuai dengan Primary Key FL Kolom A ('${flLev2.formatted}').`,
        suggestedFix: expectedSup,
        canAutoFix: true // Superior FL will be fixed to match Primary Key Column A
      });
    } else if (!flCode.startsWith(superiorFl)) {
      const flParts = flCode.split('-');
      const expectedSup = flParts.slice(0, 3).join('-');
      issues.push({
        id: `${id}_r1_mismatch_pole`,
        rule: 'RULE_1_SUPERIOR_FL',
        field: 'superiorFunctLoc',
        columnLetter: 'D',
        severity: 'warning',
        message: `Superior FL ('${superiorFl}') tidak sinkron dengan hierarki Pole Kolom A ('${expectedSup}').`,
        suggestedFix: expectedSup,
        canAutoFix: true
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 2: VALIDASI KODE DI KOLOM PLANT SECTION (H) 3 DIGIT
  // SUDAH SAMA DENGAN 3 DIGIT YANG ADA DI KOLOM FUNCTIONAL LOCATION (A)
  // Perubahan hanya pada Kolom H (Plant Section), Kolom A adalah Primary Key!
  // -------------------------------------------------------------
  if (flCode && digit6to8) {
    if (!plantSection) {
      issues.push({
        id: `${id}_r2_plan_sec_empty`,
        rule: 'RULE_2_DIGIT_6_8_VS_PLAN',
        field: 'plantSection',
        columnLetter: 'H',
        severity: 'error',
        message: `Plant Section (H) kosong. Harus sama dengan 3 digit Kolom A ('${digit6to8}').`,
        suggestedFix: digit6to8,
        canAutoFix: true
      });
    } else if (digit6to8 !== plantSection) {
      issues.push({
        id: `${id}_r2_mismatch`,
        rule: 'RULE_2_DIGIT_6_8_VS_PLAN',
        field: 'plantSection',
        columnLetter: 'H',
        severity: 'error',
        message: `Kode Plant Section Kolom H ('${plantSection}') tidak sama dengan 3 digit Kolom A ('${digit6to8}').`,
        suggestedFix: digit6to8,
        canAutoFix: true // Fixes Column H to match Column A
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 3: GENERATE CITY NAME MENJADI CITY ID PADA KOLOM BARU (AH)
  // 3 DIGIT menggunakan referensi file LOV
  // -------------------------------------------------------------
  let fuzzyCitySuggestion: { cityHomepass: string; cityId: string; similarity: number; confidence: 'HIGH' | 'MEDIUM' | 'LOW' } | undefined = undefined;

  if (!cityName) {
    issues.push({
      id: `${id}_r3_city_empty`,
      rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
      field: 'city',
      columnLetter: 'AB',
      severity: 'warning',
      message: 'Nama City pada Kolom AB kosong. Tidak dapat mencocokkan LOV City ID secara otomatis.',
      canAutoFix: false
    });
  } else if (!lovFromCity) {
    // Check fuzzy match for possible typo
    const fuzzy = fuzzyMatchCityName(cityName);
    if (fuzzy && fuzzy.similarity >= 0.55) {
      fuzzyCitySuggestion = {
        cityHomepass: fuzzy.lovItem.cityHomepass,
        cityId: fuzzy.lovItem.cityId,
        similarity: fuzzy.similarity,
        confidence: fuzzy.confidence
      };

      issues.push({
        id: `${id}_r3_city_fuzzy`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'city',
        columnLetter: 'AB',
        severity: 'warning',
        message: `Terindikasi typo pada '${cityName}'. Saran LOV: '${fuzzy.lovItem.cityHomepass}' (City ID: ${fuzzy.lovItem.cityId}, Akurasi: ${Math.round(fuzzy.similarity * 100)}%).`,
        suggestedFix: fuzzy.lovItem.cityHomepass,
        canAutoFix: true
      });
    } else {
      issues.push({
        id: `${id}_r3_city_not_in_lov`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'city',
        columnLetter: 'AB',
        severity: 'warning',
        message: `City '${cityName}' tidak ditemukan dalam referensi LOV 111 kota.`,
        canAutoFix: false
      });
    }
  } else {
    // City name found in LOV -> target City ID should be in Column AH
    const expectedCityId = lovFromCity.cityId;
    if (!cityIdGenerated) {
      issues.push({
        id: `${id}_r3_city_id_ah_empty`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'cityIdGenerated',
        columnLetter: 'AH',
        severity: 'error',
        message: `Kolom AH (City ID) kosong. Hasil generate dari '${lovFromCity.cityHomepass}' adalah '${expectedCityId}'.`,
        suggestedFix: expectedCityId,
        canAutoFix: true
      });
    } else if (cityIdGenerated !== expectedCityId) {
      issues.push({
        id: `${id}_r3_city_id_ah_mismatch`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'cityIdGenerated',
        columnLetter: 'AH',
        severity: 'error',
        message: `Kolom AH City ID ('${cityIdGenerated}') tidak sesuai dengan hasil generate LOV untuk '${cityName}' ('${expectedCityId}').`,
        suggestedFix: expectedCityId,
        canAutoFix: true
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 4 & 5: VALIDATE & SYNC PLAN SECTION, PLANNING PLANT, MAINT PLANT,
  // WORK CENTER, COST CENTER MENGIKUTI HASIL CITY ID GENERATE (LOV)
  // -------------------------------------------------------------
  if (lovFromCity) {
    // Plant Section (Col H) should match generated City ID
    if (plantSection !== lovFromCity.cityId) {
      issues.push({
        id: `${id}_r4_plan_section_sync`,
        rule: 'RULE_4_PLAN_SECTION_SYNC',
        field: 'plantSection',
        columnLetter: 'H',
        severity: 'warning',
        message: `Plant Section Kolom H ('${plantSection || '(kosong)'}') belum mengikuti hasil City ID '${lovFromCity.cityId}' dari City Name.`,
        suggestedFix: lovFromCity.cityId,
        canAutoFix: true
      });
    }

    // Planning Plant (Col F)
    if (data.planningPlant !== lovFromCity.plant) {
      issues.push({
        id: `${id}_r5_planning_plant`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'planningPlant',
        columnLetter: 'F',
        severity: 'warning',
        message: `Planning Plant ('${data.planningPlant || '(kosong)'}') harus mengikuti LOV '${lovFromCity.plant}' (${lovFromCity.cityHomepass}).`,
        suggestedFix: lovFromCity.plant,
        canAutoFix: true
      });
    }

    // Maint Plant (Col I)
    if (data.maintPlant !== lovFromCity.plant) {
      issues.push({
        id: `${id}_r5_maint_plant`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'maintPlant',
        columnLetter: 'I',
        severity: 'warning',
        message: `Maint. Plant ('${data.maintPlant || '(kosong)'}') harus mengikuti LOV '${lovFromCity.plant}' (${lovFromCity.cityHomepass}).`,
        suggestedFix: lovFromCity.plant,
        canAutoFix: true
      });
    }

    // Work Center (Col J)
    if (data.workCenter !== lovFromCity.workCenter) {
      issues.push({
        id: `${id}_r5_work_center`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'workCenter',
        columnLetter: 'J',
        severity: 'warning',
        message: `Work Center ('${data.workCenter || '(kosong)'}') harus mengikuti LOV '${lovFromCity.workCenter}' (${lovFromCity.cityHomepass}).`,
        suggestedFix: lovFromCity.workCenter,
        canAutoFix: true
      });
    }

    // Cost Center (Col K)
    if (data.costCenter !== lovFromCity.costCenter) {
      issues.push({
        id: `${id}_r5_cost_center`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'costCenter',
        columnLetter: 'K',
        severity: 'warning',
        message: `Cost Center ('${data.costCenter || '(kosong)'}') harus mengikuti LOV '${lovFromCity.costCenter}' (${lovFromCity.cityHomepass}).`,
        suggestedFix: lovFromCity.costCenter,
        canAutoFix: true
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 6: Kolom AE (Country) isinya 'ID', bukan City ID
  // Structure Indicator (B) isinya 'ZFS04'
  // -------------------------------------------------------------
  if (country !== 'ID') {
    issues.push({
      id: `${id}_r7_country_ae`,
      rule: 'RULE_7_STRUCTURE_IND',
      field: 'country',
      columnLetter: 'AE',
      severity: 'warning',
      message: `Kolom AE (Country) harus bernilai 'ID' (saat ini: '${country || '(kosong)'}').`,
      suggestedFix: 'ID',
      canAutoFix: true
    });
  }

  if (data.structureIndicator && data.structureIndicator.toUpperCase() !== 'ZFS04') {
    issues.push({
      id: `${id}_r7_structure_ind`,
      rule: 'RULE_7_STRUCTURE_IND',
      field: 'structureIndicator',
      columnLetter: 'B',
      severity: 'warning',
      message: `Structure indicator '${data.structureIndicator}' tidak sesuai blueprint (harus ZFS04).`,
      suggestedFix: 'ZFS04',
      canAutoFix: true
    });
  }

  // -------------------------------------------------------------
  // RULE 8: VALIDASI FORMAT TITIK KOORDINAT (KOLOM N - LAT & LONG)
  // Format baku SAP PM: 'Latitude,Longitude' (contoh: 3.5618141,98.6028937)
  // Mendeteksi koordinat terbalik (Longitude dahulu), delimiter keliru, & batas wilayah Indonesia
  // -------------------------------------------------------------
  const rawCoord = data.latLong || '';
  if (rawCoord.trim()) {
    const coordIssues = validateCoordinate(rawCoord);
    coordIssues.forEach((cIssue, cIdx) => {
      issues.push({
        id: `${id}_r8_coord_${cIdx}`,
        rule: 'RULE_8_COORDINATES',
        field: 'latLong',
        columnLetter: 'N',
        severity: cIssue.severity,
        message: cIssue.message,
        suggestedFix: cIssue.suggestedFix,
        canAutoFix: cIssue.canAutoFix
      });
    });
  }

  // -------------------------------------------------------------
  // RULE 7: Max Character Length Check
  // -------------------------------------------------------------
  FL_COLUMNS.forEach(col => {
    const val = data[col.key];
    if (val && val.length > col.charLength) {
      // If column A, cannot auto-truncate as it's PK, only warn
      const isPk = col.key === 'functionalLocation';
      issues.push({
        id: `${id}_len_${col.key}`,
        rule: 'RULE_6_CHAR_LENGTH',
        field: col.key,
        columnLetter: col.letter,
        severity: 'error',
        message: `Panjang karakter ${col.title} (${val.length}) melebihi batas SAP ${col.charLength} char.`,
        suggestedFix: isPk ? undefined : val.substring(0, col.charLength),
        canAutoFix: !isPk
      });
    }
  });

  const hasErrors = issues.some(i => i.severity === 'error');
  const hasWarnings = issues.some(i => i.severity === 'warning');

  // Track repaired fields (Column A will NEVER be in repairedFields!)
  const repairedFields: (keyof FLRowData)[] = [];
  if (originalData) {
    (Object.keys(data) as (keyof FLRowData)[]).forEach(k => {
      if (k !== 'functionalLocation' && data[k] !== originalData[k]) {
        repairedFields.push(k);
      }
    });
  }

  return {
    id,
    rowIndex,
    originalData: originalData || { ...data },
    data: { ...data },
    issues,
    repairedFields,
    hasErrors,
    hasWarnings,
    isRepaired: repairedFields.length > 0,
    fuzzyCitySuggestion
  };
}

/**
 * Validates an array of rows, computes duplicate Primary Keys, and calculates aggregate statistics
 */
export function validateAllRows(rows: FLRowRecord[]): { records: FLRowRecord[]; summary: ValidationSummary } {
  let validRows = 0;
  let errorRows = 0;
  let warningRows = 0;
  let repairedRows = 0;
  let duplicateRows = 0;

  const ruleStats = {
    ruleDuplicatePk: 0,
    rule1SuperiorMismatch: 0,
    rule2DigitMismatch: 0,
    rule3CityIdMissingOrInvalid: 0,
    rule4PlanSyncIssues: 0,
    rule5HierarchyInconsistency: 0,
    rule6LengthExceeded: 0,
    rule8CoordinateIssues: 0,
  };

  // 1. Build Frequency Map for Column A (Functional Location - Primary Key)
  const flOccurrences = new Map<string, number[]>();
  rows.forEach((r, idx) => {
    const rawFl = (r.data.functionalLocation || '').trim().toUpperCase();
    if (rawFl) {
      const existing = flOccurrences.get(rawFl) || [];
      existing.push(idx + 1); // 1-indexed row number
      flOccurrences.set(rawFl, existing);
    }
  });

  // 2. Validate Each Row and inject duplicate issue if applicable
  const records = rows.map((record, idx) => {
    const validated = validateFLRow(record.data, idx + 1, record.id, record.originalData);
    const rawFl = (validated.data.functionalLocation || '').trim().toUpperCase();
    
    // Check if Column A is duplicated across the dataset
    if (rawFl) {
      const allRowsWithThisFl = flOccurrences.get(rawFl) || [];
      if (allRowsWithThisFl.length > 1) {
        const otherRows = allRowsWithThisFl.filter(rNum => rNum !== idx + 1);
        validated.isDuplicatePk = true;
        validated.duplicateWithRows = otherRows;
        
        // Inject Duplicate PK error issue
        validated.issues.unshift({
          id: `${validated.id}_duplicate_pk`,
          rule: 'RULE_DUPLICATE_PK',
          field: 'functionalLocation',
          columnLetter: 'A',
          severity: 'error',
          message: `Duplikasi Primary Key! Kode FL sama dengan Baris #${otherRows.join(', #')}. Di SAP PM, kode FL wajib unik.`,
          canAutoFix: false
        });

        validated.hasErrors = true;
        duplicateRows++;
        ruleStats.ruleDuplicatePk++;
      }
    }

    if (validated.hasErrors) {
      errorRows++;
    } else if (validated.hasWarnings) {
      warningRows++;
    } else {
      validRows++;
    }

    if (validated.isRepaired) {
      repairedRows++;
    }

    // Accumulate other rule stats
    validated.issues.forEach(issue => {
      if (issue.rule === 'RULE_1_SUPERIOR_FL') ruleStats.rule1SuperiorMismatch++;
      if (issue.rule === 'RULE_2_DIGIT_6_8_VS_PLAN') ruleStats.rule2DigitMismatch++;
      if (issue.rule === 'RULE_3_CITY_NAME_TO_CITY_ID') ruleStats.rule3CityIdMissingOrInvalid++;
      if (issue.rule === 'RULE_4_PLAN_SECTION_SYNC') ruleStats.rule4PlanSyncIssues++;
      if (issue.rule === 'RULE_5_SAP_HIERARCHY') ruleStats.rule5HierarchyInconsistency++;
      if (issue.rule === 'RULE_6_CHAR_LENGTH') ruleStats.rule6LengthExceeded++;
      if (issue.rule === 'RULE_8_COORDINATES') ruleStats.rule8CoordinateIssues++;
    });

    return validated;
  });

  const summary: ValidationSummary = {
    totalRows: rows.length,
    validRows,
    errorRows,
    warningRows,
    repairedRows,
    duplicateRows,
    ruleStats
  };

  return { records, summary };
}
