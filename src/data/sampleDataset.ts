import { FLRowData, FLRowRecord } from '../types/flTypes';
import { validateFLRow, validateAllRows } from '../services/validationService';

export const SAMPLE_RAW_DATA: FLRowData[] = [
  // 1. Row 1: Valid Deli Serdang record (matches image sample)
  {
    functionalLocation: '1011-LBP-T00014433-20351H000.1.01897', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'MDN-T14433_20351H000.1.01897 , BCBHT0',
    superiorFunctLoc: '1011-LBP-T00014433',
    startupDate: '2024-03-15',
    planningPlant: '1011',
    location: '',
    plantSection: 'LBP',
    maintPlant: '1011',
    workCenter: '1011FOP1',
    costCenter: '101OP02',
    sortField: 'P2100316',
    inventoryNo: 'CRT2607004908',
    latLong: '3.5618141,98.6028937',
    title: '',
    name1: 'Budi Santoso',
    name2: '',
    street5: '',
    street: 'Jl. Setia Perwira VI',
    street3: '',
    houseNumber: 'P 27',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'TANJUNG SELAMAT',
    district: 'SUNGGAL',
    city: 'KAB. DELI SERDANG',
    postalCode: '20351',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'LBP', // Col AH
    status: 'Active'
  },

  // 2. Row 2: Col AH is EMPTY and Col H not yet synced
  // Test target for Button 1: "Validate Plan Section" (generates City ID MDN to Col AH, syncs Col H, F, I, J, K)
  {
    functionalLocation: '1011-MDN-T00028114-20112H000.1.00412', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'MDN-T28114_20112H000.1.00412 , BCBHT0',
    superiorFunctLoc: '1011-MDN-T00028114',
    startupDate: '2024-02-10',
    planningPlant: '', // Kosong -> akan disinkron jadi 1011
    location: '',
    plantSection: '',  // Kosong -> akan disinkron jadi MDN
    maintPlant: '',     // Kosong -> akan disinkron jadi 1011
    workCenter: '',     // Kosong -> akan disinkron jadi 1011FOP1
    costCenter: '',     // Kosong -> akan disinkron jadi 101OP02
    sortField: 'P2100422',
    inventoryNo: 'CRT2607005119',
    latLong: '3.5852421,98.6755972',
    title: '',
    name1: 'Rahmat Hidayat',
    name2: '',
    street5: '',
    street: 'Jl. Brigjend Katamso No. 88',
    street3: '',
    houseNumber: 'No. 88',
    houseNumberSupplement: '',
    floor: '',
    street2: 'RT 02 RW 05',
    street4: '',
    otherCity: 'KAMPUNG BARU',
    district: 'MEDAN MAIMUN',
    city: 'KOTA MEDAN',
    postalCode: '20158',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '', // <-- Kosong! Target generate ke Kolom AH (MDN)
    status: 'Active'
  },

  // 3. Row 3: Digit 6-8 FL Code vs Plan Section (H) MISMATCH
  // FL has 'SMG' at digit 6-8, but Plan Section is 'KDL'
  // Test target for Button 2: "Validate FL vs Plant Section" -> updates Col H to SMG without modifying Col A!
  {
    functionalLocation: '2031-SMG-T00049281-50241H000.2.00192', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'SMG-T49281_50241H000.2.00192 , BCBHT0',
    superiorFunctLoc: '2031-SMG-T00049281',
    startupDate: '2024-04-01',
    planningPlant: '2031',
    location: '',
    plantSection: 'KDL', // <-- MISMATCH! FL digit 6-8 is SMG, but Col H is KDL
    maintPlant: '2031',
    workCenter: '2031FOP1',
    costCenter: '203OP02',
    sortField: 'P2100889',
    inventoryNo: 'CRT2607008821',
    latLong: '-6.9932145,110.4208311',
    title: '',
    name1: 'Siti Nurhaliza',
    name2: '',
    street5: '',
    street: 'Jl. Pandanaran No. 12',
    street3: '',
    houseNumber: '12',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'PEKUNDEN',
    district: 'SEMARANG TENGAH',
    city: 'KOTA SEMARANG',
    postalCode: '50134',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'SMG',
    status: 'Active'
  },

  // 4. Row 4: Superior FL (D) MISMATCH with FL Code (A) & Lev 2
  // FL is 2041-BDG-T00091122... but Superior FL is 1011-LBP-T00091122
  // Auto-repair fixes Col D to 2041-BDG-T00091122, keeping Col A intact!
  {
    functionalLocation: '2041-BDG-T00091122-40115H000.1.00984', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'BDG-T91122_40115H000.1.00984 , BCBHT0',
    superiorFunctLoc: '1011-LBP-T00091122', // <-- Mismatch! Akan disinkronkan ke 2041-BDG-T00091122
    startupDate: '2024-05-12',
    planningPlant: '2041',
    location: '',
    plantSection: 'BDG',
    maintPlant: '2041',
    workCenter: '2041FOP1',
    costCenter: '204OP02',
    sortField: 'P2101230',
    inventoryNo: 'CRT2607009441',
    latLong: '-6.917464,107.619123',
    title: '',
    name1: 'Agus Wijaya',
    name2: '',
    street5: '',
    street: 'Jl. Riau No. 45',
    street3: '',
    houseNumber: '45',
    houseNumberSupplement: 'A',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'CITARUM',
    district: 'BANDUNG WETAN',
    city: 'KOTA BANDUNG',
    postalCode: '40115',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'BDG',
    status: 'Active'
  },

  // 5. Row 5: City is KOTA SURABAYA, but Plan Section, Plant, WC, CC are outdated
  // Target for Button 1 to sync everything from City Name -> SBY
  {
    functionalLocation: '2051-SBY-T00055112-60281H000.1.00551', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'SBY-T55112_60281H000.1.00551 , BCBHT0',
    superiorFunctLoc: '2051-SBY-T00055112',
    startupDate: '2024-06-20',
    planningPlant: '2051',
    location: '',
    plantSection: 'SDA', // <-- Akan disinkron ke SBY
    maintPlant: '2051',
    workCenter: '1011FOP1', // <-- Akan disinkron ke 2051FOP2
    costCenter: '101OP02',  // <-- Akan disinkron ke 205OP02
    sortField: 'P2103401',
    inventoryNo: 'CRT2607012399',
    latLong: '-7.257472,112.752088',
    title: '',
    name1: 'Dewi Lestari',
    name2: '',
    street5: '',
    street: 'Jl. Pemuda No. 10',
    street3: '',
    houseNumber: '10',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'EMBONG KALIASIN',
    district: 'GENTENG',
    city: 'KOTA SURABAYA',
    postalCode: '60271',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '', // <-- Kosong, akan diisi SBY
    status: 'Active'
  },

  // 6. Row 6: Multiple Issues (Missing City ID AH, Empty Superior FL D, Missing Country AE)
  {
    functionalLocation: '4091-BKS-T00078129-17144H000.1.00118', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: 'BKS-T78129_17144H000.1.00118 , BCBHT0',
    superiorFunctLoc: '', // <-- Akan diisi 4091-BKS-T00078129
    startupDate: '',
    planningPlant: '4091',
    location: '',
    plantSection: 'BKS',
    maintPlant: '4091',
    workCenter: '4091FOP3',
    costCenter: '409OP02',
    sortField: 'P2109901',
    inventoryNo: 'CRT2607019821',
    latLong: '-6.238270,106.975573',
    title: '',
    name1: 'Hendro Kusumo',
    name2: '',
    street5: '',
    street: 'Jl. Ahmad Yani No. 5',
    street3: '',
    houseNumber: '5',
    houseNumberSupplement: 'B',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'MARGA JAYA',
    district: 'BEKASI SELATAN',
    city: 'KOTA BEKASI',
    postalCode: '17141',
    region: '',
    country: '', // <-- Akan diisi ID
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '', // <-- Akan diisi BKS
    status: 'Active'
  },

  // 7. Row 7: Valid Bali Denpasar (Plant 3061, City ID DPS)
  {
    functionalLocation: '3061-DPS-T00033219-80232H000.1.00332', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'DPS-T33219_80232H000.1.00332 , BCBHT0',
    superiorFunctLoc: '3061-DPS-T00033219',
    startupDate: '2024-07-08',
    planningPlant: '3061',
    location: '',
    plantSection: 'DPS',
    maintPlant: '3061',
    workCenter: '3061FOP',
    costCenter: '306OP02',
    sortField: 'P2105510',
    inventoryNo: 'CRT2607033100',
    latLong: '-8.670458,115.212629',
    title: '',
    name1: 'I Made Sudirga',
    name2: '',
    street5: '',
    street: 'Jl. Hayam Wuruk No. 101',
    street3: '',
    houseNumber: '101',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'PANJER',
    district: 'DENPASAR SELATAN',
    city: 'KOTA DENPASAR',
    postalCode: '80239',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'DPS',
    status: 'Active'
  },

  // 8. Row 8: Jakarta Selatan with mismatched Plan Section
  {
    functionalLocation: '4091-KYB-T00066112-12190H000.1.00210', // PK IMMUTABLE
    structureIndicator: 'ZFS04',
    description: 'KYB-T66112_12190H000.1.00210 , BCBHT0',
    superiorFunctLoc: '4091-KYB-T00066112',
    startupDate: '2024-08-14',
    planningPlant: '4091',
    location: '',
    plantSection: 'TNA', // <-- Mismatch! Harusnya KYB (sesuai digit 6-8 FL dan City Jakarta Selatan)
    maintPlant: '4091',
    workCenter: '4091FOP1',
    costCenter: '409OP02',
    sortField: 'P2106622',
    inventoryNo: 'CRT2607066190',
    latLong: '-6.261493,106.810600',
    title: '',
    name1: 'Putri Anggraini',
    name2: '',
    street5: '',
    street: 'Jl. Kemang Raya No. 20',
    street3: '',
    houseNumber: '20',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'BANGKA',
    district: 'MAMPANG PRAPATAN',
    city: 'KOTA JAKARTA SELATAN',
    postalCode: '12730',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'KYB',
    status: 'Active'
  },

  // 9. Row 9: DUPLICATE PRIMARY KEY TEST (FL code sama persis dengan Baris #1)
  {
    functionalLocation: '1011-LBP-T00014433-20351H000.1.01897', // <-- DUPLIKAT DENGAN ROW 1!
    structureIndicator: 'ZFS04',
    description: 'MDN-T14433_20351H000.1.01897 , BCBHT0 (DUPLIKAT)',
    superiorFunctLoc: '1011-LBP-T00014433',
    startupDate: '2024-09-01',
    planningPlant: '1011',
    location: '',
    plantSection: 'LBP',
    maintPlant: '1011',
    workCenter: '1011FOP1',
    costCenter: '101OP02',
    sortField: 'P2109988',
    inventoryNo: 'CRT2607099881',
    latLong: '3.5618141,98.6028937',
    title: '',
    name1: 'Ahmad Faisal (Data Ganda)',
    name2: '',
    street5: '',
    street: 'Jl. Setia Perwira VI No. 28',
    street3: '',
    houseNumber: '28',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'TANJUNG SELAMAT',
    district: 'SUNGGAL',
    city: 'KAB. DELI SERDANG',
    postalCode: '20351',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'LBP',
    status: 'Active'
  },

  // 10. Row 10: FUZZY MATCHING TEST #1 - Typo City Name "KAB DELI SERDNG" (Tanpa titik & huruf A)
  // Target rekomendasi cerdas -> KAB. DELI SERDANG (City ID: LBP, Plant: 1011)
  {
    functionalLocation: '1011-LBP-T00099120-20351H000.1.00912',
    structureIndicator: 'ZFS04',
    description: 'MDN-T99120_20351H000.1.00912 , BCBHT0',
    superiorFunctLoc: '1011-LBP-T00099120',
    startupDate: '2024-09-10',
    planningPlant: '1011',
    location: '',
    plantSection: 'LBP',
    maintPlant: '1011',
    workCenter: '1011FOP1',
    costCenter: '101OP02',
    sortField: 'P2108711',
    inventoryNo: 'CRT2607087112',
    latLong: '98.612019,3.570112', // <-- KOORDINAT TERBALIK! (Longitude dahulu 98.6, baru Latitude 3.5)
    title: '',
    name1: 'Yusuf Maulana (Typo & Koordinat Terbalik)',
    name2: '',
    street5: '',
    street: 'Jl. Pertahanan No. 14',
    street3: '',
    houseNumber: '14',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'PATUMBAK',
    district: 'PATUMBAK',
    city: 'KAB DELI SERDNG', // <-- TYPO! Kurang titik dan huruf A
    postalCode: '20361',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '',
    status: 'Active'
  },

  // 11. Row 11: FUZZY MATCHING TEST #2 & Delimiter Koordinat Tidak Standar
  {
    functionalLocation: '4091-CKG-T00055410-13930H000.1.00281',
    structureIndicator: 'ZFS04',
    description: 'CKG-T55410_13930H000.1.00281 , BCBHT0',
    superiorFunctLoc: '4091-CKG-T00055410',
    startupDate: '2024-09-15',
    planningPlant: '4091',
    location: '',
    plantSection: 'CKG',
    maintPlant: '4091',
    workCenter: '4091FOP1',
    costCenter: '409OP02',
    sortField: 'P2109923',
    inventoryNo: 'CRT2607099234',
    latLong: '-6.211451; 106.920831', // <-- Pemisah titik koma dan spasi tidak standar
    title: '',
    name1: 'Kartika Sari (Typo Singkatan)',
    name2: '',
    street5: '',
    street: 'Jl. Penggilingan Raya No. 9',
    street3: '',
    houseNumber: '9',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'PENGGILINGAN',
    district: 'CAKUNG',
    city: 'JAKARTA TMR', // <-- TYPO! Singkatan informal dari KOTA JAKARTA TIMUR
    postalCode: '13940',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '',
    status: 'Active'
  },

  // 12. Row 12: TEST KOORDINAT FORMAT TEKS (Lat: ... Long: ...)
  {
    functionalLocation: '4091-TNA-T00011223-10110H000.1.00110',
    structureIndicator: 'ZFS04',
    description: 'TNA-T11223_10110H000.1.00110 , BCBHT0',
    superiorFunctLoc: '4091-TNA-T00011223',
    startupDate: '2024-09-20',
    planningPlant: '4091',
    location: '',
    plantSection: 'TNA',
    maintPlant: '4091',
    workCenter: '4091FOP1',
    costCenter: '409OP02',
    sortField: 'P2109955',
    inventoryNo: 'CRT2607099551',
    latLong: '-6.175392 106.827153', // <-- Pemisah spasi tanpa koma
    title: '',
    name1: 'Bambang Sudarsono',
    name2: '',
    street5: '',
    street: 'Jl. Medan Merdeka Barat No. 1',
    street3: '',
    houseNumber: '1',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: 'GAMBIR',
    district: 'GAMBIR',
    city: 'KOTA JAKARTA PUSAT',
    postalCode: '10110',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'TNA',
    status: 'Active'
  }
];

export function getSampleRecords(): FLRowRecord[] {
  const initialRecords = SAMPLE_RAW_DATA.map((row, idx) => {
    return validateFLRow(row, idx + 1, `sample_row_${idx + 1}`);
  });
  // Use validateAllRows so duplicate detection runs on initial data
  const { records } = validateAllRows(initialRecords);
  return records;
}
