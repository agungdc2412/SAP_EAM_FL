/**
 * LOV (List of Values) Database for Functional Location Master Data
 * Sourced from SAP PM Configuration: Plant - City - Work Center - Cost Center
 * Total 111 verified mappings.
 */

export interface LovItem {
  cityHomepass: string;
  cityId: string;
  plant: string;
  workCenter: string;
  costCenter: string;
}

export const LOV_DATABASE: LovItem[] = [
  { cityHomepass: "KOTA BINJAI", cityId: "BNJ", plant: "1011", workCenter: "1011FOP1", costCenter: "101OP02" },
  { cityHomepass: "KAB. DELI SERDANG", cityId: "LBP", plant: "1011", workCenter: "1011FOP1", costCenter: "101OP02" },
  { cityHomepass: "KOTA MEDAN", cityId: "MDN", plant: "1011", workCenter: "1011FOP1", costCenter: "101OP02" },
  { cityHomepass: "KAB. SERDANG BEDAGAI", cityId: "SRH", plant: "1011", workCenter: "1011FOP1", costCenter: "101OP02" },
  { cityHomepass: "KAB. LANGKAT", cityId: "STB", plant: "1011", workCenter: "1011FOP1", costCenter: "101OP02" },
  { cityHomepass: "KAB. KAMPAR", cityId: "BKN", plant: "1011", workCenter: "1011FOP2", costCenter: "101OP02" },
  { cityHomepass: "KOTA PEKANBARU", cityId: "PBR", plant: "1011", workCenter: "1011FOP2", costCenter: "101OP02" },
  { cityHomepass: "KAB. OGAN ILIR", cityId: "IDL", plant: "1021", workCenter: "1021FOP1", costCenter: "102OP02" },
  { cityHomepass: "KAB. OGAN KOMERING ILIR", cityId: "KAG", plant: "1021", workCenter: "1021FOP1", costCenter: "102OP02" },
  { cityHomepass: "KAB. BANYUASIN", cityId: "PKB", plant: "1021", workCenter: "1021FOP1", costCenter: "102OP02" },
  { cityHomepass: "KOTA PALEMBANG", cityId: "PLG", plant: "1021", workCenter: "1021FOP1", costCenter: "102OP02" },
  { cityHomepass: "KOTA BANDAR LAMPUNG", cityId: "BDL", plant: "1021", workCenter: "1021FOP2", costCenter: "102OP02" },
  { cityHomepass: "KAB. LAMPUNG SELATAN", cityId: "KLA", plant: "1021", workCenter: "1021FOP2", costCenter: "102OP02" },
  { cityHomepass: "KAB. LAMPUNG TIMUR", cityId: "SDN", plant: "1021", workCenter: "1021FOP2", costCenter: "102OP02" },
  { cityHomepass: "KAB. BATANG", cityId: "BTG", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KAB. DEMAK", cityId: "DMK", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KAB. KENDAL", cityId: "KDL", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KAB. PEKALONGAN", cityId: "KJN", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KOTA PEKALONGAN", cityId: "PKL", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KOTA SALATIGA", cityId: "SLT", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KAB. TEGAL", cityId: "SLW", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KOTA SEMARANG", cityId: "SMG", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KOTA TEGAL", cityId: "TGL", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KAB. SEMARANG", cityId: "UNR", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
  { cityHomepass: "KAB. BANTUL", cityId: "BTL", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. BOYOLALI", cityId: "BYL", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. CILACAP", cityId: "CLP", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. KLATEN", cityId: "KLN", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. KARANGANYAR", cityId: "KRG", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KOTA MAGELANG", cityId: "MGG", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. MAGELANG", cityId: "MKD", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. BANYUMAS", cityId: "PWT", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KOTA SURAKARTA", cityId: "SKA", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. SUKOHARJO", cityId: "SKH", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KAB. SLEMAN", cityId: "SMN", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KOTA YOGYAKARTA", cityId: "YOG", plant: "2031", workCenter: "2031FOP2", costCenter: "203OP02" },
  { cityHomepass: "KOTA BANDUNG", cityId: "BDG", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. CIANJUR", cityId: "CJR", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KOTA CIMAHI", cityId: "CMH", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. GARUT", cityId: "GRT", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. KARAWANG", cityId: "KWG", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. BANDUNG BARAT", cityId: "NPH", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. SUKABUMI", cityId: "PRT", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. PURWAKARTA", cityId: "PWK", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. SUBANG", cityId: "SBN", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KOTA SUKABUMI", cityId: "SKB", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KAB. BANDUNG", cityId: "SOR", plant: "2041", workCenter: "2041FOP1", costCenter: "204OP02" },
  { cityHomepass: "KOTA BANJAR", cityId: "BJR", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KOTA CIREBON", cityId: "CBN", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. CIAMIS", cityId: "CMS", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. INDRAMAYU", cityId: "IDM", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. MAJALENGKA", cityId: "MJL", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. CIREBON", cityId: "SBR", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. SUMEDANG", cityId: "SMD", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. TASIKMALAYA", cityId: "SPA", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KOTA TASIKMALAYA", cityId: "TSM", plant: "2041", workCenter: "2041FOP2", costCenter: "204OP02" },
  { cityHomepass: "KAB. PASURUAN", cityId: "BNL", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KOTA BATU", cityId: "BTU", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KAB. JEMBER", cityId: "JMR", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KAB. MALANG", cityId: "KPN", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KAB. PROBOLINGGO", cityId: "KRS", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KOTA MALANG", cityId: "MLG", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KOTA PROBOLINGGO", cityId: "PBL", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KOTA PASURUAN", cityId: "PSR", plant: "2051", workCenter: "2051FOP1", costCenter: "205OP02" },
  { cityHomepass: "KAB. BANGKALAN", cityId: "BKL", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. MADIUN", cityId: "CRB", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. GRESIK", cityId: "GSK", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. JOMBANG", cityId: "JBG", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KOTA KEDIRI", cityId: "KDR", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KOTA MADIUN", cityId: "MAD", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KOTA MOJOKERTO", cityId: "MJK", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. MOJOKERTO", cityId: "MJS", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. KEDIRI", cityId: "PAR", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KOTA SURABAYA", cityId: "SBY", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. SIDOARJO", cityId: "SDA", plant: "2051", workCenter: "2051FOP2", costCenter: "205OP02" },
  { cityHomepass: "KAB. KARANGASEM", cityId: "ALP", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. BANGLI", cityId: "BLI", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KOTA DENPASAR", cityId: "DPS", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. GIANYAR", cityId: "GIN", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. BADUNG", cityId: "MNP", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. JEMBRANA", cityId: "NGA", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. BULELENG", cityId: "SGR", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. KLUNGKUNG", cityId: "SRP", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KAB. TABANAN", cityId: "TAB", plant: "3061", workCenter: "3061FOP", costCenter: "306OP02" },
  { cityHomepass: "KOTA BANJARBARU", cityId: "BJB", plant: "3071", workCenter: "3071FOP1", costCenter: "307OP02" },
  { cityHomepass: "KOTA BANJARMASIN", cityId: "BJM", plant: "3071", workCenter: "3071FOP1", costCenter: "307OP02" },
  { cityHomepass: "KAB. BARITO KUALA", cityId: "MRH", plant: "3071", workCenter: "3071FOP1", costCenter: "307OP02" },
  { cityHomepass: "KAB. BANJAR", cityId: "MTP", plant: "3071", workCenter: "3071FOP1", costCenter: "307OP02" },
  { cityHomepass: "KOTA MAKASSAR", cityId: "MKS", plant: "3081", workCenter: "3081FOP", costCenter: "308OP02" },
  { cityHomepass: "KAB. MAROS", cityId: "MRS", plant: "3081", workCenter: "3081FOP", costCenter: "308OP02" },
  { cityHomepass: "KAB. GOWA", cityId: "SGM", plant: "3081", workCenter: "3081FOP", costCenter: "308OP02" },
  { cityHomepass: "KAB. TAKALAR", cityId: "TKL", plant: "3081", workCenter: "3081FOP", costCenter: "308OP02" },
  { cityHomepass: "KOTA JAKARTA TIMUR", cityId: "CKG", plant: "4091", workCenter: "4091FOP1", costCenter: "409OP02" },
  { cityHomepass: "KOTA JAKARTA BARAT", cityId: "KBN", plant: "4091", workCenter: "4091FOP1", costCenter: "409OP02" },
  { cityHomepass: "KOTA JAKARTA SELATAN", cityId: "KYB", plant: "4091", workCenter: "4091FOP1", costCenter: "409OP02" },
  { cityHomepass: "KOTA JAKARTA UTARA", cityId: "TJP", plant: "4091", workCenter: "4091FOP1", costCenter: "409OP02" },
  { cityHomepass: "KOTA JAKARTA PUSAT", cityId: "TNA", plant: "4091", workCenter: "4091FOP1", costCenter: "409OP02" },
  { cityHomepass: "KOTA TANGERANG SELATAN", cityId: "CPT", plant: "4091", workCenter: "4091FOP2", costCenter: "409OP02" },
  { cityHomepass: "KAB. SERANG", cityId: "CRU", plant: "4091", workCenter: "4091FOP2", costCenter: "409OP02" },
  { cityHomepass: "KOTA SERANG", cityId: "SRG", plant: "4091", workCenter: "4091FOP2", costCenter: "409OP02" },
  { cityHomepass: "KAB. TANGERANG", cityId: "TGR", plant: "4091", workCenter: "4091FOP2", costCenter: "409OP02" },
  { cityHomepass: "KOTA TANGERANG", cityId: "TNG", plant: "4091", workCenter: "4091FOP2", costCenter: "409OP02" },
  { cityHomepass: "KOTA BEKASI", cityId: "BKS", plant: "4091", workCenter: "4091FOP3", costCenter: "409OP02" },
  { cityHomepass: "KAB. BEKASI", cityId: "CKR", plant: "4091", workCenter: "4091FOP3", costCenter: "409OP02" },
  { cityHomepass: "KOTA BOGOR", cityId: "BGR", plant: "4091", workCenter: "4091FOP4", costCenter: "409OP02" },
  { cityHomepass: "KAB. BOGOR", cityId: "CBI", plant: "4091", workCenter: "4091FOP4", costCenter: "409OP02" },
  { cityHomepass: "KOTA DEPOK", cityId: "DPK", plant: "4091", workCenter: "4091FOP4", costCenter: "409OP02" },
  { cityHomepass: "KAB. LAMPUNG TENGAH", cityId: "GNS", plant: "1021", workCenter: "1021FOP2", costCenter: "102OP02" },
  { cityHomepass: "KAB. TANGGAMUS", cityId: "KOT", plant: "1021", workCenter: "1021FOP2", costCenter: "102OP02" },
  { cityHomepass: "KAB. OGAN KOMERING ULU", cityId: "BTA", plant: "1021", workCenter: "1021FOP2", costCenter: "102OP02" },
  { cityHomepass: "KAB. PATI", cityId: "PTI", plant: "2031", workCenter: "2031FOP1", costCenter: "203OP02" },
];

/**
 * Normalizes city string for resilient lookup:
 * removes punctuation, collapses spaces, converts KABUPATEN to KAB, upper-cases.
 */
export function normalizeCityName(str: string): string {
  if (!str) return "";
  let clean = str.toUpperCase().trim();
  clean = clean.replace(/KABUPATEN/g, "KAB.");
  clean = clean.replace(/KAB\s+/g, "KAB. ");
  clean = clean.replace(/KAB\.\s*/g, "KAB. ");
  clean = clean.replace(/KOTA\s+/g, "KOTA ");
  clean = clean.replace(/\s+/g, " ").trim();
  return clean;
}

/**
 * Resilient lookup from City Homepass name to LOV item
 */
export function findLovByCityName(cityName: string): LovItem | undefined {
  if (!cityName) return undefined;
  const normalized = normalizeCityName(cityName);
  
  // Exact match
  const direct = LOV_DATABASE.find(item => normalizeCityName(item.cityHomepass) === normalized);
  if (direct) return direct;

  // Stripped prefix match (e.g., "DELI SERDANG" matching "KAB. DELI SERDANG")
  const strippedInput = normalized.replace(/^(KAB\.\s*|KOTA\s*)/i, "").trim();
  if (strippedInput.length >= 3) {
    const strippedMatch = LOV_DATABASE.find(item => {
      const strippedLov = normalizeCityName(item.cityHomepass).replace(/^(KAB\.\s*|KOTA\s*)/i, "").trim();
      return strippedLov === strippedInput;
    });
    if (strippedMatch) return strippedMatch;
  }

  // Contains match
  return LOV_DATABASE.find(item => {
    const nLov = normalizeCityName(item.cityHomepass);
    return nLov.includes(normalized) || normalized.includes(nLov);
  });
}

/**
 * Calculates Levenshtein Distance between two strings
 */
export function calculateLevenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Calculates Dice Bigram similarity (0.0 to 1.0)
 */
export function calculateBigramSimilarity(str1: string, str2: string): number {
  const s1 = str1.replace(/\s+/g, '');
  const s2 = str2.replace(/\s+/g, '');
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const getBigrams = (str: string) => {
    const map = new Map<string, number>();
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.substring(i, i + 2);
      map.set(bigram, (map.get(bigram) || 0) + 1);
    }
    return map;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  let intersection = 0;
  for (const [bigram, count1] of bg1.entries()) {
    if (bg2.has(bigram)) {
      intersection += Math.min(count1, bg2.get(bigram)!);
    }
  }
  return (2.0 * intersection) / ((s1.length - 1) + (s2.length - 1));
}

export interface FuzzyMatchResult {
  lovItem: LovItem;
  similarity: number; // 0 to 1
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestionText: string;
}

/**
 * Intelligent Fuzzy Matching for Typo City Names
 * Handles typos like "KAB DELI SERDNG", "JAKARTA TMR", "KODYA BANDUNG", etc.
 */
export function fuzzyMatchCityName(cityName: string): FuzzyMatchResult | null {
  if (!cityName || cityName.trim().length < 3) return null;

  // If already matches exactly, no fuzzy suggestion needed
  const exact = findLovByCityName(cityName);
  if (exact) {
    return {
      lovItem: exact,
      similarity: 1.0,
      confidence: 'HIGH',
      suggestionText: exact.cityHomepass
    };
  }

  // Pre-expand common abbreviations
  let input = normalizeCityName(cityName);
  input = input.replace(/\bTMR\b/g, 'TIMUR');
  input = input.replace(/\bSEL\b/g, 'SELATAN');
  input = input.replace(/\bSLT\b/g, 'SELATAN');
  input = input.replace(/\bBRT\b/g, 'BARAT');
  input = input.replace(/\bUTR\b/g, 'UTARA');
  input = input.replace(/\bPST\b/g, 'PUSAT');
  input = input.replace(/\bKODYA\b/g, 'KOTA');

  const baseInput = input.replace(/^(KAB\.\s*|KOTA\s*)/i, '').trim();

  let bestMatch: LovItem | null = null;
  let bestScore = 0;

  for (const item of LOV_DATABASE) {
    const itemNorm = normalizeCityName(item.cityHomepass);
    const itemBase = itemNorm.replace(/^(KAB\.\s*|KOTA\s*)/i, '').trim();

    // 1. Check similarity on full normalized names
    const levDist = calculateLevenshtein(input, itemNorm);
    const maxLen = Math.max(input.length, itemNorm.length);
    const levSim = Math.max(0, 1 - (levDist / maxLen));
    const biSim = calculateBigramSimilarity(input, itemNorm);

    // 2. Check similarity on base city names (without KAB/KOTA prefix)
    const baseLevDist = calculateLevenshtein(baseInput, itemBase);
    const baseMaxLen = Math.max(baseInput.length, itemBase.length);
    const baseLevSim = Math.max(0, 1 - (baseLevDist / baseMaxLen));
    const baseBiSim = calculateBigramSimilarity(baseInput, itemBase);

    // Weighted composite score
    const score = Math.max(
      (levSim * 0.4) + (biSim * 0.6),
      (baseLevSim * 0.4) + (baseBiSim * 0.6)
    );

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  // Threshold: at least 55% similarity
  if (bestMatch && bestScore >= 0.55) {
    const confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 
      bestScore >= 0.78 ? 'HIGH' : bestScore >= 0.65 ? 'MEDIUM' : 'LOW';

    return {
      lovItem: bestMatch,
      similarity: Math.round(bestScore * 100) / 100,
      confidence,
      suggestionText: bestMatch.cityHomepass
    };
  }

  return null;
}

/**
 * Lookup LOV by 3-character City ID (e.g. "LBP", "MDN")
 */
export function findLovByCityId(cityId: string): LovItem | undefined {
  if (!cityId) return undefined;
  const cleanId = cityId.trim().toUpperCase();
  return LOV_DATABASE.find(item => item.cityId === cleanId);
}

/**
 * Lookup by Plant and City ID combo (Level 2 General)
 */
export function findLovByPlantAndCity(plant: string, cityId: string): LovItem | undefined {
  if (!plant || !cityId) return undefined;
  const cleanPlant = plant.trim().toUpperCase();
  const cleanCity = cityId.trim().toUpperCase();
  return LOV_DATABASE.find(item => item.plant === cleanPlant && item.cityId === cleanCity);
}
