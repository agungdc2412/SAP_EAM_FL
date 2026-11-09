/**
 * SAP Enterprise Asset Management (EAM) Master Data Suite Types
 * Supports Functional Location (ZFS01, ZFS04) and Equipment (Cable, Pole/Manhole, DPFO, Jointbox, Splitter)
 */

export type EAMDomain = 'functional_location' | 'equipment';

export type EAMOperationMode = 'validate' | 'generate';

export type EquipmentCategory = 
  | 'cable'
  | 'pole_manhole'
  | 'dpfo'
  | 'jointbox'
  | 'splitter';

export interface EquipmentCategoryConfig {
  id: EquipmentCategory;
  name: string;
  sapCategoryCode: string; // SAP EQTYP
  badge: string;
  icon: string;
  description: string;
  standardPrefix: string;
  defaultSuperiorFlPrefix: string;
  sampleCode: string;
  specLabel: string;
  specDefault: string;
}

export const EQUIPMENT_CONFIGS: Record<EquipmentCategory, EquipmentCategoryConfig> = {
  cable: {
    id: 'cable',
    name: 'Cable (Kabel Fiber Optic)',
    sapCategoryCode: 'C',
    badge: 'Kabel FO / Distribusi',
    icon: 'Cable',
    description: 'Master Data Equipment Kabel Feeder, Distribusi, dan Drop FO dengan relasi Functional Location SAP PM.',
    standardPrefix: 'CBL',
    defaultSuperiorFlPrefix: '1011-ARS',
    sampleCode: 'CBL-FO-48C-1011-0001',
    specLabel: 'Kapasitas Core',
    specDefault: '48 Core / SM-G652D'
  },
  pole_manhole: {
    id: 'pole_manhole',
    name: 'Pole / Manhole (Tiang & MH)',
    sapCategoryCode: 'P',
    badge: 'Tiang / Manhole',
    icon: 'Milestone',
    description: 'Master Data Tiang OSP (7m/9m) dan Manhole Underground dengan koordinat presisi dan kode FL.',
    standardPrefix: 'POL',
    defaultSuperiorFlPrefix: '1011-LBP',
    sampleCode: 'POL-07M-LBP-00142',
    specLabel: 'Spesifikasi Tipe',
    specDefault: 'Tiang Besi 7 Meter / 140 daN'
  },
  dpfo: {
    id: 'dpfo',
    name: 'DPFO (Distribution Point FO)',
    sapCategoryCode: 'D',
    badge: 'DPFO / ODP',
    icon: 'Radio',
    description: 'Master Data Distribution Point Fiber Optic (ODP Pole/Wall/Closure) terhubung ke Level 3 FL.',
    standardPrefix: 'DPFO',
    defaultSuperiorFlPrefix: '1011-LBP-T00014433',
    sampleCode: 'DPFO-LBP-01/08',
    specLabel: 'Port Kapasitas',
    specDefault: 'ODP 8 Port / Solid Splitter 1:8'
  },
  jointbox: {
    id: 'jointbox',
    name: 'Jointbox (Closure Sambungan)',
    sapCategoryCode: 'J',
    badge: 'Joint Closure',
    icon: 'Box',
    description: 'Master Data Joint Closure / Sambungan Kabel Aerial & Underground dengan posisi koordinat geografis.',
    standardPrefix: 'JBX',
    defaultSuperiorFlPrefix: '1011-ARS',
    sampleCode: 'JBX-DOME-96C-0021',
    specLabel: 'Tipe Closure',
    specDefault: 'Dome Closure 96 Core IP68'
  },
  splitter: {
    id: 'splitter',
    name: 'Splitter (Passive Optical Splitter)',
    sapCategoryCode: 'S',
    badge: 'Optical Splitter',
    icon: 'GitFork',
    description: 'Master Data Passive Optical Splitter (FBT/PLC 1:2, 1:4, 1:8, 1:16) di dalam ODC atau DPFO.',
    standardPrefix: 'SPL',
    defaultSuperiorFlPrefix: '1011-LBP',
    sampleCode: 'SPL-PLC-1x8-0043',
    specLabel: 'Rasio Splitter',
    specDefault: 'PLC Splitter 1:8 SC/UPC'
  }
};

export interface EquipmentRowData {
  equipmentNumber: string;        // SAP Kolom A: Equipment ID (Primary Key)
  category: string;               // SAP Kolom B: EQTYP (C, P, D, J, S)
  description: string;            // SAP Kolom C: Description
  functionalLocation: string;     // SAP Kolom D: Superior/Installation FL (TPLNR)
  technicalIdentNo: string;       // SAP Kolom E: Technical ID / Tag ID (TIDNR)
  maintPlant: string;             // SAP Kolom F: Maintenance Plant (SWERK)
  planningPlant: string;          // SAP Kolom G: Planning Plant (IWERK)
  workCenter: string;             // SAP Kolom H: Work Center (GEWRK)
  costCenter: string;             // SAP Kolom I: Cost Center (KOSTL)
  manufacturer: string;           // SAP Kolom J: Pabrikan / Merk (HERST)
  modelNumber: string;            // SAP Kolom K: Model / Tipe (TYPBZ)
  startupDate: string;            // SAP Kolom L: Commissioning Date (INBDT)
  latLong: string;                // SAP Kolom M: Titik Koordinat Lat,Long
  inventoryNo: string;            // SAP Kolom N: Nomor Inventaris / Aset
  status: string;                 // SAP Kolom O: Status Operasi (Active/AVBL)
}

export interface EquipmentRecord {
  id: string;
  rowIndex: number;
  data: EquipmentRowData;
  originalData: EquipmentRowData;
  category: EquipmentCategory;
  issues: EquipmentIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
  isDuplicatePk: boolean;
  isRepaired: boolean;
}

export interface EquipmentIssue {
  id: string;
  field: keyof EquipmentRowData;
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestedFix?: string;
  canAutoFix: boolean;
}

export interface EquipmentSummary {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  repairedRows: number;
  duplicateRows: number;
}
