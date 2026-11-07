import { FLRowData, FLRowRecord, ValidationIssue, ValidationSummary, FL_COLUMNS, FunclocModule } from '../types/flTypes';
import { findLovByCityName, findLovByCityId, findLovByPlantAndCity, fuzzyMatchCityName } from '../data/lovDatabase';
import { findSniByCityName, findSniByCityId, findSniByPlantAndCity, fuzzyMatchSniCityName } from '../data/sniDatabase';

/**
 * Extracts the 3-character city code from Column A (digit 6-8, 1-indexed)
 * E.g., for "1011-LBP-T00014433-20351H000.1.01897" or "1011-ARS-000000001", returns "LBP" or "ARS"
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
/**
 * Looks up city in the appropriate reference database based on active module.
 * In ZFS01-NBB: Prioritizes SNI Master Database (424 items), fallback to ZFS04 LOV.
 * In ZFS04-OSP/BB: Prioritizes LOV Database (111 items), fallback to SNI Database.
 */
export function lookupCityReference(cityName: string, module: FunclocModule = 'ZFS04'): {
  item?: {
    cityName: string;
    cityId: string;
    plant: string;
    workCenter: string;
    costCenter: string;
    source: 'SNI' | 'ZFS04';
  };
  fuzzySuggestion?: {
    cityHomepass: string;
    cityId: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    sourceTable: 'SNI' | 'ZFS04';
  };
} {
  if (!cityName || !cityName.trim()) return {};
  const trimmed = cityName.trim();

  if (module === 'ZFS01') {
    // 1. Check SNI Database first
    const sni = findSniByCityName(trimmed);
    if (sni) {
      return {
        item: {
          cityName: sni.citySni,
          cityId: sni.cityId,
          plant: sni.plant,
          workCenter: sni.workCenter,
          costCenter: sni.costCenter,
          source: 'SNI'
        }
      };
    }
    // 2. Check ZFS04 LOV as fallback
    const lov = findLovByCityName(trimmed);
    if (lov) {
      return {
        item: {
          cityName: lov.cityHomepass,
          cityId: lov.cityId,
          plant: lov.plant,
          workCenter: lov.workCenter,
          costCenter: lov.costCenter,
          source: 'ZFS04'
        }
      };
    }
    // 3. Fuzzy match in SNI
    const fuzzySni = fuzzyMatchSniCityName(trimmed);
    if (fuzzySni && fuzzySni.similarity >= 0.55) {
      return {
        fuzzySuggestion: {
          cityHomepass: fuzzySni.sniItem.citySni,
          cityId: fuzzySni.sniItem.cityId,
          similarity: fuzzySni.similarity,
          confidence: fuzzySni.confidence,
          sourceTable: 'SNI'
        }
      };
    }
    // 4. Fuzzy match in LOV
    const fuzzyLov = fuzzyMatchCityName(trimmed);
    if (fuzzyLov && fuzzyLov.similarity >= 0.55) {
      return {
        fuzzySuggestion: {
          cityHomepass: fuzzyLov.lovItem.cityHomepass,
          cityId: fuzzyLov.lovItem.cityId,
          similarity: fuzzyLov.similarity,
          confidence: fuzzyLov.confidence,
          sourceTable: 'ZFS04'
        }
      };
    }
  } else {
    // ZFS04 module
    // 1. Check LOV Database first
    const lov = findLovByCityName(trimmed);
    if (lov) {
      return {
        item: {
          cityName: lov.cityHomepass,
          cityId: lov.cityId,
          plant: lov.plant,
          workCenter: lov.workCenter,
          costCenter: lov.costCenter,
          source: 'ZFS04'
        }
      };
    }
    // 2. Check SNI Database as fallback
    const sni = findSniByCityName(trimmed);
    if (sni) {
      return {
        item: {
          cityName: sni.citySni,
          cityId: sni.cityId,
          plant: sni.plant,
          workCenter: sni.workCenter,
          costCenter: sni.costCenter,
          source: 'SNI'
        }
      };
    }
    // 3. Fuzzy match in LOV
    const fuzzyLov = fuzzyMatchCityName(trimmed);
    if (fuzzyLov && fuzzyLov.similarity >= 0.55) {
      return {
        fuzzySuggestion: {
          cityHomepass: fuzzyLov.lovItem.cityHomepass,
          cityId: fuzzyLov.lovItem.cityId,
          similarity: fuzzyLov.similarity,
          confidence: fuzzyLov.confidence,
          sourceTable: 'ZFS04'
        }
      };
    }
    // 4. Fuzzy match in SNI
    const fuzzySni = fuzzyMatchSniCityName(trimmed);
    if (fuzzySni && fuzzySni.similarity >= 0.55) {
      return {
        fuzzySuggestion: {
          cityHomepass: fuzzySni.sniItem.citySni,
          cityId: fuzzySni.sniItem.cityId,
          similarity: fuzzySni.similarity,
          confidence: fuzzySni.confidence,
          sourceTable: 'SNI'
        }
      };
    }
  }

  return {};
}

/**
 * Validates a single row against all SAP PM Functional Location rules
 * Adapts dynamically based on active module: 'ZFS01' (Non-Broadband) or 'ZFS04' (OSP/Broadband)
 * NOTE: Column A (Functional Location) is strictly IMMUTABLE PRIMARY KEY.
 */
export function validateFLRow(
  data: FLRowData, 
  rowIndex: number, 
  id: string, 
  originalData?: FLRowData, 
  module: FunclocModule = 'ZFS04'
): FLRowRecord {
  const issues: ValidationIssue[] = [];
  const flCode = (data.functionalLocation || '').trim();
  const superiorFl = (data.superiorFunctLoc || '').trim();
  const plantSection = (data.plantSection || '').trim().toUpperCase();
  const cityName = (data.city || '').trim();
  const cityIdGenerated = (data.cityIdGenerated || '').trim().toUpperCase();
  const country = (data.country || '').trim().toUpperCase();

  // Lookup in active module's reference database (SNI for ZFS01, LOV for ZFS04)
  const { item: refItem, fuzzySuggestion: fuzzyCitySuggestion } = lookupCityReference(cityName, module);
  const digit6to8 = extractDigit6to8(flCode);

  // Expected Superior FL based on module hierarchy
  // In ZFS01: Level 2 -> [Plant]-[CityID], e.g. 1011-ARS
  // In ZFS04: Level 3 -> [Plant]-[CityID]-[Pole], e.g. 1011-LBP-T00014433
  const flParts = flCode.split('-');
  const lastHyphen = flCode.lastIndexOf('-');
  let expectedSup = '';
  if (module === 'ZFS01') {
    expectedSup = flParts.length >= 2 ? `${flParts[0]}-${flParts[1]}` : flCode;
  } else {
    expectedSup = flParts.length > 3 
      ? flParts.slice(0, 3).join('-') 
      : (lastHyphen > 0 ? flCode.substring(0, lastHyphen) : flCode);
  }

  // -------------------------------------------------------------
  // PARENT-CHILD HIERARCHY CHECK:
  // For every row, ensure that if a 'Superior Functional Location' (Column D) is defined,
  // the string in Column A starts with the string in Column D followed by a '-' separator.
  // Add a new 'Hierarchy Violation' error type if the structure is inconsistent.
  // Kolom A adalah Primary Key (IMMUTABLE), sehingga Kolom D yang disesuaikan.
  // -------------------------------------------------------------
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
  } else if (!superiorFl) {
    issues.push({
      id: `${id}_r1_sup_empty`,
      rule: 'RULE_1_SUPERIOR_FL',
      field: 'superiorFunctLoc',
      columnLetter: 'D',
      severity: 'error',
      message: `Superior FunctLoc. (Kolom D) tidak boleh kosong. Wajib sesuai hierarki modul ${module} ('${expectedSup}').`,
      suggestedFix: expectedSup,
      canAutoFix: true
    });
  } else {
    // Column D is defined! Perform Parent-Child Hierarchy Check
    const expectedPrefix = `${superiorFl}-`;
    if (!flCode.startsWith(expectedPrefix)) {
      issues.push({
        id: `${id}_hierarchy_violation`,
        rule: 'RULE_HIERARCHY_VIOLATION',
        field: 'superiorFunctLoc',
        columnLetter: 'D',
        severity: 'error',
        message: `Hierarchy Violation: Kode Functional Location (Kolom A: '${flCode}') harus diawali oleh Superior FunctLoc (Kolom D: '${superiorFl}') yang dipisahkan oleh separator '-'.`,
        suggestedFix: expectedSup,
        canAutoFix: true // Column A is PK and immutable; Column D is updated to match parent
      });
    }

    // Also check Lev 2 General prefix (Plant-City)
    const flLev2 = extractLev2General(flCode);
    const supLev2 = extractLev2General(superiorFl);
    if (flLev2 && supLev2 && flLev2.formatted !== supLev2.formatted) {
      issues.push({
        id: `${id}_r1_mismatch_lev2`,
        rule: 'RULE_1_SUPERIOR_FL',
        field: 'superiorFunctLoc',
        columnLetter: 'D',
        severity: 'error',
        message: `Prefix Lev 2 Superior FL ('${supLev2.formatted}') tidak sesuai dengan Primary Key FL Kolom A ('${flLev2.formatted}').`,
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
  // 3 DIGIT menggunakan referensi file SNI (ZFS01) atau LOV (ZFS04)
  // -------------------------------------------------------------
  if (!cityName) {
    issues.push({
      id: `${id}_r3_city_empty`,
      rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
      field: 'city',
      columnLetter: 'AB',
      severity: 'warning',
      message: 'Nama City pada Kolom AB kosong. Tidak dapat mencocokkan City ID secara otomatis.',
      canAutoFix: false
    });
  } else if (!refItem) {
    if (fuzzyCitySuggestion) {
      issues.push({
        id: `${id}_r3_city_fuzzy`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'city',
        columnLetter: 'AB',
        severity: 'warning',
        message: `Terindikasi perbedaan penulisan pada '${cityName}'. Saran Referensi ${fuzzyCitySuggestion.sourceTable || module}: '${fuzzyCitySuggestion.cityHomepass}' (City ID: ${fuzzyCitySuggestion.cityId}, Akurasi: ${Math.round(fuzzyCitySuggestion.similarity * 100)}%).`,
        suggestedFix: fuzzyCitySuggestion.cityHomepass,
        canAutoFix: true
      });
    } else {
      issues.push({
        id: `${id}_r3_city_not_in_lov`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'city',
        columnLetter: 'AB',
        severity: 'warning',
        message: `City '${cityName}' tidak ditemukan dalam referensi ${module === 'ZFS01' ? 'SNI 424 kota/kab' : 'LOV 111 kota'}. Gunakan tombol Fuzzy Matching untuk mencocokkan.`,
        canAutoFix: false
      });
    }
  } else {
    // City name found in reference -> target City ID should be in Column AH
    const expectedCityId = refItem.cityId;
    if (!cityIdGenerated) {
      issues.push({
        id: `${id}_r3_city_id_ah_empty`,
        rule: 'RULE_3_CITY_NAME_TO_CITY_ID',
        field: 'cityIdGenerated',
        columnLetter: 'AH',
        severity: 'error',
        message: `Kolom AH (City ID) kosong. Hasil generate dari '${refItem.cityName}' (${refItem.source}) adalah '${expectedCityId}'.`,
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
        message: `Kolom AH City ID ('${cityIdGenerated}') tidak sesuai dengan hasil generate referensi untuk '${cityName}' ('${expectedCityId}').`,
        suggestedFix: expectedCityId,
        canAutoFix: true
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 4 & 5: VALIDATE & SYNC PLAN SECTION, PLANNING PLANT, MAINT PLANT,
  // WORK CENTER, COST CENTER MENGIKUTI HASIL CITY ID GENERATE
  // -------------------------------------------------------------
  if (refItem) {
    // Plant Section (Col H) should match generated City ID
    if (plantSection !== refItem.cityId) {
      issues.push({
        id: `${id}_r4_plan_section_sync`,
        rule: 'RULE_4_PLAN_SECTION_SYNC',
        field: 'plantSection',
        columnLetter: 'H',
        severity: 'warning',
        message: `Plant Section Kolom H ('${plantSection || '(kosong)'}') belum mengikuti hasil City ID '${refItem.cityId}' dari City Name.`,
        suggestedFix: refItem.cityId,
        canAutoFix: true
      });
    }

    // Planning Plant (Col F)
    if (data.planningPlant !== refItem.plant) {
      issues.push({
        id: `${id}_r5_planning_plant`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'planningPlant',
        columnLetter: 'F',
        severity: 'warning',
        message: `Planning Plant ('${data.planningPlant || '(kosong)'}') harus mengikuti referensi '${refItem.plant}' (${refItem.cityName}).`,
        suggestedFix: refItem.plant,
        canAutoFix: true
      });
    }

    // Maint Plant (Col I)
    if (data.maintPlant !== refItem.plant) {
      issues.push({
        id: `${id}_r5_maint_plant`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'maintPlant',
        columnLetter: 'I',
        severity: 'warning',
        message: `Maint. Plant ('${data.maintPlant || '(kosong)'}') harus mengikuti referensi '${refItem.plant}' (${refItem.cityName}).`,
        suggestedFix: refItem.plant,
        canAutoFix: true
      });
    }

    // Work Center (Col J)
    if (data.workCenter !== refItem.workCenter) {
      issues.push({
        id: `${id}_r5_work_center`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'workCenter',
        columnLetter: 'J',
        severity: 'warning',
        message: `Work Center ('${data.workCenter || '(kosong)'}') harus mengikuti referensi '${refItem.workCenter}' (${refItem.cityName}).`,
        suggestedFix: refItem.workCenter,
        canAutoFix: true
      });
    }

    // Cost Center (Col K)
    if (data.costCenter !== refItem.costCenter) {
      issues.push({
        id: `${id}_r5_cost_center`,
        rule: 'RULE_5_SAP_HIERARCHY',
        field: 'costCenter',
        columnLetter: 'K',
        severity: 'warning',
        message: `Cost Center ('${data.costCenter || '(kosong)'}') harus mengikuti referensi '${refItem.costCenter}' (${refItem.cityName}).`,
        suggestedFix: refItem.costCenter,
        canAutoFix: true
      });
    }
  }

  // -------------------------------------------------------------
  // RULE 6: Kolom AE (Country) isinya 'ID', bukan City ID
  // Structure Indicator (B) isinya ZFS01 (NBB) atau ZFS04 (OSP/BB)
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

  const expectedStructure = module === 'ZFS01' ? 'ZFS01' : 'ZFS04';
  if (data.structureIndicator && data.structureIndicator.toUpperCase() !== expectedStructure) {
    issues.push({
      id: `${id}_r7_structure_ind`,
      rule: 'RULE_7_STRUCTURE_IND',
      field: 'structureIndicator',
      columnLetter: 'B',
      severity: 'warning',
      message: `Structure indicator '${data.structureIndicator}' tidak sesuai blueprint modul ${module} (harus ${expectedStructure}).`,
      suggestedFix: expectedStructure,
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
export function validateAllRows(rows: FLRowRecord[], module: FunclocModule = 'ZFS04'): { records: FLRowRecord[]; summary: ValidationSummary } {
  let validRows = 0;
  let errorRows = 0;
  let warningRows = 0;
  let repairedRows = 0;
  let duplicateRows = 0;

  const ruleStats = {
    ruleDuplicatePk: 0,
    ruleHierarchyViolation: 0,
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
    const validated = validateFLRow(record.data, idx + 1, record.id, record.originalData, module);
    validated.module = module;
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
      if (issue.rule === 'RULE_HIERARCHY_VIOLATION') ruleStats.ruleHierarchyViolation++;
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
