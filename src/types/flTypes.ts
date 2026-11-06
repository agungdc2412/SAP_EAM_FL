/**
 * Types and schema for Functional Location (FL) Master Data Migration
 */

export interface FLRowData {
  // Primary SAP PM Columns
  functionalLocation: string;       // Col A (Char 40) PRIMARY KEY (IMMUTABLE)
  structureIndicator: string;       // Col B (Char 5) Default: ZFS04
  description: string;              // Col C (Char 40)
  superiorFunctLoc: string;         // Col D (Char 40) e.g. 1011-LBP-T00014433
  startupDate: string;              // Col E (Char 10)
  planningPlant: string;            // Col F (Char 4) e.g. 1011
  location: string;                 // Col G (Char 10)
  plantSection: string;             // Col H (Char 3) e.g. LBP
  maintPlant: string;               // Col I (Char 4) e.g. 1011
  workCenter: string;               // Col J (Char 8) e.g. 1011FOP1
  costCenter: string;               // Col K (Char 10) e.g. 101OP02
  sortField: string;                // Col L (Char 30) Project ID
  inventoryNo: string;              // Col M (Char 25) CRT ID
  latLong: string;                  // Col N (Char 30) Latitude & Longitude
  title: string;                    // Col O (Char 4)
  name1: string;                    // Col P (Char 40)
  name2: string;                    // Col Q (Char 40)
  street5: string;                  // Col R (Char 40)
  street: string;                   // Col S (Char 60)
  street3: string;                  // Col T (Char 40)
  houseNumber: string;              // Col U (Char 10)
  houseNumberSupplement: string;    // Col V (Char 10)
  floor: string;                    // Col W (Char 10)
  street2: string;                  // Col X (Char 40)
  street4: string;                  // Col Y (Char 40)
  otherCity: string;                // Col Z (Char 40) Kelurahan/Desa
  district: string;                 // Col AA (Char 40) Kecamatan
  city: string;                     // Col AB (Char 40) Kabupaten/Kota name
  postalCode: string;               // Col AC (Char 10)
  region: string;                   // Col AD (Char 3)
  country: string;                  // Col AE (Char 3) Default: ID
  telephone: string;                // Col AF (Char 30)
  telephoneExtension: string;       // Col AG (Char 10)
  cityIdGenerated: string;          // Col AH (Char 3) City ID hasil generate dari City Name (LOV)
  status: string;                   // Col AI (Char 15) Active / Non Active
}

export type Severity = 'error' | 'warning' | 'info';

export type IssueRule = 
  | 'RULE_DUPLICATE_PK'           // Col A (Functional Location) Duplicate Primary Key
  | 'RULE_1_SUPERIOR_FL'          // Col D vs Col A Lev 2 (PLANT-CITY)
  | 'RULE_2_DIGIT_6_8_VS_PLAN'    // Col A 3char (digit 6-8) vs Col H (Plan Section)
  | 'RULE_3_CITY_NAME_TO_CITY_ID' // Generate City Name (AB) to City ID (AH) via LOV
  | 'RULE_4_PLAN_SECTION_SYNC'    // Col H, F, I, J, K sync with LOV City ID
  | 'RULE_5_SAP_HIERARCHY'        // Plant, Work Center, Cost Center sync with LOV
  | 'RULE_6_CHAR_LENGTH'          // Exceeding SAP Char Length limit
  | 'RULE_7_STRUCTURE_IND'        // Structure Indicator != ZFS04 or Country != ID
  | 'RULE_8_COORDINATES';         // Col N (Latitude and Longitude) format & bounds

export interface ValidationIssue {
  id: string;
  rule: IssueRule;
  field: keyof FLRowData;
  columnLetter: string;
  severity: Severity;
  message: string;
  suggestedFix?: string;
  canAutoFix: boolean;
  meta?: Record<string, any>;
}

export interface FLRowRecord {
  id: string;
  rowIndex: number;                 // 1-based data row index
  originalData: FLRowData;
  data: FLRowData;
  issues: ValidationIssue[];
  repairedFields: (keyof FLRowData)[];
  hasErrors: boolean;
  hasWarnings: boolean;
  isRepaired: boolean;
  isDuplicatePk?: boolean;
  duplicateWithRows?: number[];
  fuzzyCitySuggestion?: {
    cityHomepass: string;
    cityId: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  };
}

export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  repairedRows: number;
  duplicateRows: number;
  ruleStats: {
    ruleDuplicatePk: number;
    rule1SuperiorMismatch: number;
    rule2DigitMismatch: number;
    rule3CityIdMissingOrInvalid: number;
    rule4PlanSyncIssues: number;
    rule5HierarchyInconsistency: number;
    rule6LengthExceeded: number;
    rule8CoordinateIssues: number;
  };
}

export interface ColumnDefinition {
  key: keyof FLRowData;
  letter: string;
  title: string;
  charLength: number;
  isMandatory?: boolean;
  description: string;
}

export const FL_COLUMNS: ColumnDefinition[] = [
  { key: 'functionalLocation', letter: 'A', title: 'Functional Location', charLength: 40, isMandatory: true, description: 'Primary Key (Immutable): Plant-PlanSection-Pole-HomeID' },
  { key: 'structureIndicator', letter: 'B', title: 'Structure indicator', charLength: 5, description: 'Default ZFS04' },
  { key: 'description', letter: 'C', title: 'Description', charLength: 40, description: 'Description Funcloc' },
  { key: 'superiorFunctLoc', letter: 'D', title: 'Superior FunctLoc.', charLength: 40, isMandatory: true, description: 'FL LEV 3 (Plant-CityID-Pole)' },
  { key: 'startupDate', letter: 'E', title: 'Start-up date', charLength: 10, description: 'Sales Activation Date' },
  { key: 'planningPlant', letter: 'F', title: 'Planning Plant', charLength: 4, description: 'LOV FL Subregion ID' },
  { key: 'location', letter: 'G', title: 'Location (Maint Plant)', charLength: 10, description: 'LOV SNI' },
  { key: 'plantSection', letter: 'H', title: 'Plant Section', charLength: 3, isMandatory: true, description: 'City ID Administrative 3-char' },
  { key: 'maintPlant', letter: 'I', title: 'Maint. Plant', charLength: 4, description: 'LOV FL Subregion ID' },
  { key: 'workCenter', letter: 'J', title: 'Work Center', charLength: 8, description: 'Work Center ID LOV' },
  { key: 'costCenter', letter: 'K', title: 'Cost Center', charLength: 10, description: 'Cost Center ID LOV' },
  { key: 'sortField', letter: 'L', title: 'Sort Field (Project ID)', charLength: 30, description: 'Project ID' },
  { key: 'inventoryNo', letter: 'M', title: 'Inventory No. (CRT ID)', charLength: 25, description: 'Join Home ID & Aktivasi' },
  { key: 'latLong', letter: 'N', title: 'Latitude and Longitude', charLength: 30, description: 'Lat, Long Coordinates' },
  { key: 'title', letter: 'O', title: 'Title', charLength: 4, description: 'Title' },
  { key: 'name1', letter: 'P', title: 'Name 1', charLength: 40, description: 'Customer Name 1' },
  { key: 'name2', letter: 'Q', title: 'Name 2', charLength: 40, description: 'Customer Name 2' },
  { key: 'street5', letter: 'R', title: 'Street 5 (Cluster/Bldg)', charLength: 40, description: 'Cluster/Building' },
  { key: 'street', letter: 'S', title: 'Street (Street Name)', charLength: 60, description: 'Street Name' },
  { key: 'street3', letter: 'T', title: 'Street 3', charLength: 40, description: 'Additional Info' },
  { key: 'houseNumber', letter: 'U', title: 'House Number', charLength: 10, description: 'No. Rumah' },
  { key: 'houseNumberSupplement', letter: 'V', title: 'House No. Supplement', charLength: 10, description: 'Block Code' },
  { key: 'floor', letter: 'W', title: 'Floor', charLength: 10, description: 'Lantai' },
  { key: 'street2', letter: 'X', title: 'Street 2 (RT RW)', charLength: 40, description: 'RT/RW' },
  { key: 'street4', letter: 'Y', title: 'Street 4', charLength: 40, description: 'Additional Info' },
  { key: 'otherCity', letter: 'Z', title: 'Other City (Kel/Desa)', charLength: 40, description: 'Kelurahan/Desa' },
  { key: 'district', letter: 'AA', title: 'District (Kecamatan)', charLength: 40, description: 'Kecamatan' },
  { key: 'city', letter: 'AB', title: 'City', charLength: 40, isMandatory: true, description: 'Nama Kabupaten/Kota' },
  { key: 'postalCode', letter: 'AC', title: 'Postal Code', charLength: 10, description: 'Kode Pos' },
  { key: 'region', letter: 'AD', title: 'Region (Province Code)', charLength: 3, description: 'Province Code' },
  { key: 'country', letter: 'AE', title: 'Country (AE)', charLength: 3, description: 'Default ID' },
  { key: 'telephone', letter: 'AF', title: 'Telephone', charLength: 30, description: 'Telephone' },
  { key: 'telephoneExtension', letter: 'AG', title: 'Telephone Extension', charLength: 10, description: 'Extension' },
  { key: 'cityIdGenerated', letter: 'AH', title: 'City ID (AH - LOV)', charLength: 3, isMandatory: true, description: 'City ID 3-char hasil generate dari City Name (LOV)' },
  { key: 'status', letter: 'AI', title: 'Status', charLength: 15, description: 'Active / Non Active' },
];
