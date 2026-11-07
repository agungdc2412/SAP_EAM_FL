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

export const SAMPLE_ZFS04_DATA = SAMPLE_RAW_DATA;

export const SAMPLE_ZFS01_DATA: FLRowData[] = [
  // 1. Row 1: Valid ZFS01 Solok (matches blueprint image_0e8da4e1.png)
  {
    functionalLocation: '1011-ARS-000000001', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[11194] KCP Alahan Panjang',
    superiorFunctLoc: '1011-ARS', // Level 2: Plant-CityID
    startupDate: '2026-07-05',
    planningPlant: '1011',
    location: '',
    plantSection: 'ARS',
    maintPlant: '1011',
    workCenter: '1011FOP1',
    costCenter: '101OP02',
    sortField: 'P1900044',
    inventoryNo: 'CRT2606026552',
    latLong: '-0.982145,100.612034',
    title: '',
    name1: 'Bank Mandiri KCP Alahan Panjang',
    name2: '',
    street5: '',
    street: 'Jl. Gajah Mada No. 5Solok,SumBarIDN',
    street3: '[11194] KCP Alahan Panjang',
    houseNumber: '5',
    houseNumberSupplement: '',
    floor: '1',
    street2: '',
    street4: '1011-ARS-STRBANKMA-01',
    otherCity: 'ALAHAN PANJANG',
    district: 'LEMBAH GUMANTI',
    city: 'KABUPATEN SOLOK',
    postalCode: '27371',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'ARS',
    status: 'Active'
  },

  // 2. Row 2: Col AH is EMPTY and Col H, F, I, J, K not yet synced
  // Test target for Button 1: "Validate Plan Section" with SNI Database
  {
    functionalLocation: '1011-PAD-000000002', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[11200] Kantor Cabang Padang Kota',
    superiorFunctLoc: '1011-PAD',
    startupDate: '2026-07-10',
    planningPlant: '', // Kosong -> disinkron jadi 1011
    location: '',
    plantSection: '',  // Kosong -> disinkron jadi PAD
    maintPlant: '',     // Kosong -> disinkron jadi 1011
    workCenter: '',     // Kosong -> disinkron jadi 1011FOP1
    costCenter: '',     // Kosong -> disinkron jadi 101OP02
    sortField: 'P1900055',
    inventoryNo: 'CRT2606026881',
    latLong: '-0.947083,100.417181',
    title: '',
    name1: 'PT Telekomunikasi Indonesia Padang',
    name2: '',
    street5: '',
    street: 'Jl. Khatib Sulaiman No. 12',
    street3: '',
    houseNumber: '12',
    houseNumberSupplement: '',
    floor: '2',
    street2: 'RT 01 RW 04',
    street4: '1011-PAD-STRPADKOT-01',
    otherCity: 'LOLONG BELANTI',
    district: 'PADANG UTARA',
    city: 'KOTA PADANG',
    postalCode: '25136',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '', // <-- Kosong! Target generate ke Kolom AH (PAD) via SNI
    status: 'Active'
  },

  // 3. Row 3: Digit 6-8 FL Code vs Plan Section (H) MISMATCH
  // FL has 'BDG' at digit 6-8, but Plan Section is 'CBI'
  // Test target for Button 2: "Validate FL vs Plant Section" -> updates Col H to BDG
  {
    functionalLocation: '2041-BDG-000000003', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[20412] Branch Office Bandung Dago',
    superiorFunctLoc: '2041-BDG',
    startupDate: '2026-07-15',
    planningPlant: '2041',
    location: '',
    plantSection: 'CBI', // <-- MISMATCH! FL digit 6-8 is BDG, but Col H is CBI
    maintPlant: '2041',
    workCenter: '2041FOP1',
    costCenter: '204OP02',
    sortField: 'P1900078',
    inventoryNo: 'CRT2606027110',
    latLong: '-6.903890,107.618610',
    title: '',
    name1: 'Dago Digital Hub Center',
    name2: '',
    street5: '',
    street: 'Jl. Ir. H. Juanda No. 100',
    street3: '',
    houseNumber: '100',
    houseNumberSupplement: '',
    floor: '1',
    street2: '',
    street4: '2041-BDG-STRDAGOHUB-01',
    otherCity: 'LEBAKGEDE',
    district: 'COBLONG',
    city: 'KOTA BANDUNG',
    postalCode: '40132',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'BDG',
    status: 'Active'
  },

  // 4. Row 4: Superior FL (D) MISMATCH / Hierarchy Violation
  // FL is 2031-SMG-000000004 but Superior FL is 1011-ARS (Beda Plant & City!)
  // Auto-repair fixes Col D to 2031-SMG, preserving Col A primary key
  {
    functionalLocation: '2031-SMG-000000004', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[20315] Node Semarang Pahlawan',
    superiorFunctLoc: '1011-ARS', // <-- MISMATCH & HIERARCHY VIOLATION! Harusnya 2031-SMG
    startupDate: '2026-07-20',
    planningPlant: '2031',
    location: '',
    plantSection: 'SMG',
    maintPlant: '2031',
    workCenter: '2031FOP1',
    costCenter: '203OP02',
    sortField: 'P1900089',
    inventoryNo: 'CRT2606027450',
    latLong: '-6.992812,110.421543',
    title: '',
    name1: 'Gedung Telkom Simpang Lima',
    name2: '',
    street5: '',
    street: 'Jl. Pahlawan No. 1',
    street3: '',
    houseNumber: '1',
    houseNumberSupplement: '',
    floor: '3',
    street2: '',
    street4: '2031-SMG-STRSMPLMA-01',
    otherCity: 'MUGASSARI',
    district: 'SEMARANG SELATAN',
    city: 'KOTA SEMARANG',
    postalCode: '50249',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'SMG',
    status: 'Active'
  },

  // 5. Row 5: Missing Superior FL (Col D is empty)
  {
    functionalLocation: '2051-SBY-000000005', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[20518] Point Surabaya Basuki Rahmat',
    superiorFunctLoc: '', // <-- Kosong! Harus diisi 2051-SBY (Lev 2)
    startupDate: '2026-07-22',
    planningPlant: '2051',
    location: '',
    plantSection: 'SBY',
    maintPlant: '2051',
    workCenter: '2051FOP2',
    costCenter: '205OP02',
    sortField: 'P1900101',
    inventoryNo: 'CRT2606027890',
    latLong: '-7.265140,112.742300',
    title: '',
    name1: 'Intiland Tower Surabaya',
    name2: '',
    street5: '',
    street: 'Jl. Panglima Sudirman No. 101',
    street3: '',
    houseNumber: '101',
    houseNumberSupplement: '',
    floor: '5',
    street2: '',
    street4: '2051-SBY-STRINTLND-01',
    otherCity: 'EMBONG KALIASIN',
    district: 'GENTENG',
    city: 'KOTA SURABAYA',
    postalCode: '60271',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'SBY',
    status: 'Active'
  },

  // 6. Row 6: Outdated Plan Section, WC, CC vs City Name
  {
    functionalLocation: '3061-DPS-000000006', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[30611] Gateway Bali Renon',
    superiorFunctLoc: '3061-DPS',
    startupDate: '2026-07-25',
    planningPlant: '1011', // Outdated -> Harusnya 3061
    location: '',
    plantSection: 'SDA', // Outdated -> Harusnya DPS
    maintPlant: '1011',    // Outdated -> Harusnya 3061
    workCenter: '1011FOP1', // Outdated -> Harusnya 3061FOP
    costCenter: '101OP02',  // Outdated -> Harusnya 306OP02
    sortField: 'P1900115',
    inventoryNo: 'CRT2606028120',
    latLong: '-8.674120,115.234510',
    title: '',
    name1: 'Regional Office Renon',
    name2: '',
    street5: '',
    street: 'Jl. Raya Puputan No. 28',
    street3: '',
    houseNumber: '28',
    houseNumberSupplement: '',
    floor: '1',
    street2: '',
    street4: '3061-DPS-STRRENNON-01',
    otherCity: 'RENON',
    district: 'DENPASAR SELATAN',
    city: 'KOTA DENPASAR',
    postalCode: '80239',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '', // Kosong -> disinkron DPS
    status: 'Active'
  },

  // 7. Row 7: Typo City Name "KAB SOLOK" (SNI Fuzzy Match -> KABUPATEN SOLOK / ARS) + Inverted Coordinates
  {
    functionalLocation: '1011-ARS-000000007', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[11198] Unit Pelayanan Talang',
    superiorFunctLoc: '1011-ARS',
    startupDate: '2026-08-01',
    planningPlant: '1011',
    location: '',
    plantSection: 'ARS',
    maintPlant: '1011',
    workCenter: '1011FOP1',
    costCenter: '101OP02',
    sortField: 'P1900122',
    inventoryNo: 'CRT2606028440',
    latLong: '100.612034,-0.982145', // <-- KOORDINAT TERBALIK! (Long dulu baru Lat)
    title: '',
    name1: 'Puskesmas Talang Babungo',
    name2: '',
    street5: '',
    street: 'Jl. Raya Solok - Alahan Panjang Km 18',
    street3: '',
    houseNumber: '18',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '1011-ARS-STRTLNG01-01',
    otherCity: 'TALANG',
    district: 'GUNUNG TALANG',
    city: 'KAB SOLOK', // <-- TYPO SNI! Kurang kata "UPATEN"
    postalCode: '27365',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '',
    status: 'Active'
  },

  // 8. Row 8: Typo Inverted "BEKASI KOTA" (SNI Fuzzy Match -> KOTA BEKASI / BKS) + Semicolon Coordinates
  {
    functionalLocation: '4091-BKS-000000008', // PK IMMUTABLE
    structureIndicator: 'ZFS01',
    description: '[40915] Datacenter Summarecon Bekasi',
    superiorFunctLoc: '4091-BKS',
    startupDate: '2026-08-05',
    planningPlant: '4091',
    location: '',
    plantSection: 'BKS',
    maintPlant: '4091',
    workCenter: '4091FOP3',
    costCenter: '409OP02',
    sortField: 'P1900140',
    inventoryNo: 'CRT2606028890',
    latLong: '-6.224150; 106.998230', // <-- Pemisah titik koma dan spasi tidak standar
    title: '',
    name1: 'Summarecon Mall Bekasi POP',
    name2: '',
    street5: '',
    street: 'Jl. Bulevar Ahmad Yani Blok M',
    street3: '',
    houseNumber: 'Blok M',
    houseNumberSupplement: '',
    floor: '2',
    street2: '',
    street4: '4091-BKS-STRSUMMBK-01',
    otherCity: 'MARGA MULYA',
    district: 'BEKASI UTARA',
    city: 'BEKASI KOTA', // <-- TYPO SNI! Susunan kata terbalik
    postalCode: '17142',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '',
    status: 'Active'
  },

  // 9. Row 9: DUPLICATE PRIMARY KEY (Sama persis dengan Baris #1)
  {
    functionalLocation: '1011-ARS-000000001', // <-- DUPLIKAT PK ROW 1!
    structureIndicator: 'ZFS01',
    description: '[11194] KCP Alahan Panjang (DUPLIKAT)',
    superiorFunctLoc: '1011-ARS',
    startupDate: '2026-07-05',
    planningPlant: '1011',
    location: '',
    plantSection: 'ARS',
    maintPlant: '1011',
    workCenter: '1011FOP1',
    costCenter: '101OP02',
    sortField: 'P1900044',
    inventoryNo: 'CRT2606026552',
    latLong: '-0.982145,100.612034',
    title: '',
    name1: 'Bank Mandiri KCP Alahan Panjang (Ganda)',
    name2: '',
    street5: '',
    street: 'Jl. Gajah Mada No. 5Solok',
    street3: '',
    houseNumber: '5',
    houseNumberSupplement: '',
    floor: '1',
    street2: '',
    street4: '1011-ARS-STRBANKMA-01',
    otherCity: 'ALAHAN PANJANG',
    district: 'LEMBAH GUMANTI',
    city: 'KABUPATEN SOLOK',
    postalCode: '27371',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'ARS',
    status: 'Active'
  },

  // 10. Row 10: Wrong Structure Indicator (ZFS04 on ZFS01 module) & Missing Country
  {
    functionalLocation: '3081-MKS-000000010', // PK IMMUTABLE
    structureIndicator: 'ZFS04', // <-- Struktur salah! Modul ini ZFS01
    description: '[30812] POP Makassar Ratulangi',
    superiorFunctLoc: '3081-MKS',
    startupDate: '2026-08-10',
    planningPlant: '3081',
    location: '',
    plantSection: 'MKS',
    maintPlant: '3081',
    workCenter: '3081FOP',
    costCenter: '308OP02',
    sortField: 'P1900155',
    inventoryNo: 'CRT2606029110',
    latLong: '-5.152890,119.414320',
    title: '',
    name1: 'Ratulangi Point of Presence',
    name2: '',
    street5: '',
    street: 'Jl. Dr. Sam Ratulangi No. 45',
    street3: '',
    houseNumber: '45',
    houseNumberSupplement: '',
    floor: '1',
    street2: '',
    street4: '3081-MKS-STRRATUL-01',
    otherCity: 'MAMAJANG LUAR',
    district: 'MAMAJANG',
    city: 'KOTA MAKASSAR',
    postalCode: '90132',
    region: '',
    country: '', // <-- Kosong! Harus ID
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: 'MKS',
    status: 'Active'
  }
];

import { FunclocModule } from '../types/flTypes';

export function getSampleRecords(module: FunclocModule = 'ZFS04'): FLRowRecord[] {
  const dataset = module === 'ZFS01' ? SAMPLE_ZFS01_DATA : SAMPLE_ZFS04_DATA;
  const initialRecords = dataset.map((row, idx) => {
    return validateFLRow(row, idx + 1, `${module.toLowerCase()}_sample_row_${idx + 1}`, undefined, module);
  });
  // Use validateAllRows so duplicate detection and cross checks run on initial data
  const { records } = validateAllRows(initialRecords, module);
  return records;
}
