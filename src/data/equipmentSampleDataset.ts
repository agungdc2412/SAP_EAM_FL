import { EquipmentCategory, EquipmentRecord, EquipmentRowData } from '../types/eamTypes';

export function getSampleEquipmentRecords(category: EquipmentCategory): EquipmentRecord[] {
  const samplesByCategory: Record<EquipmentCategory, EquipmentRowData[]> = {
    cable: [
      {
        equipmentNumber: 'EQ-CBL-1011-000001',
        category: 'C',
        description: 'Kabel Feeder FO 48C G652D ARS-01',
        functionalLocation: '1011-ARS-000000001',
        technicalIdentNo: 'TID-CBL-ARS-01',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Fiberhome',
        modelNumber: 'ADSS 48 Core',
        startupDate: '01.08.2026',
        latLong: '-0.982145,100.612034',
        inventoryNo: 'INV-CBL-48C-9912',
        status: 'AVBL'
      },
      {
        equipmentNumber: 'EQ-CBL-1011-000001', // Duplicate PK to demonstrate audit
        category: 'C',
        description: 'Kabel Distribusi FO 24C ARS-02',
        functionalLocation: '1011-ARS-000000002',
        technicalIdentNo: 'TID-CBL-ARS-02',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Prysmian',
        modelNumber: 'Aerial 24 Core',
        startupDate: '05.08.2026',
        latLong: '100.651200,-0.801322', // Inverted coordinate
        inventoryNo: 'INV-CBL-24C-9913',
        status: 'AVBL'
      },
      {
        equipmentNumber: 'EQ-CBL-1011-000003',
        category: 'C',
        description: 'Kabel Feeder FO 96C LBP-01',
        functionalLocation: '1011-LBP-T00014433-20351H000.1.01897',
        technicalIdentNo: 'TID-CBL-LBP-01',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Furukawa',
        modelNumber: 'Duct 96 Core',
        startupDate: '10.08.2026',
        latLong: '3.5618141,98.6028937',
        inventoryNo: 'INV-CBL-96C-9914',
        status: 'AVBL'
      }
    ],
    pole_manhole: [
      {
        equipmentNumber: 'EQ-POL-1011-000142',
        category: 'P',
        description: 'Tiang OSP Besi 7M 140daN LBP-0142',
        functionalLocation: '1011-LBP-T00014433',
        technicalIdentNo: 'TID-POL-LBP-0142',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Krakatau Steel',
        modelNumber: 'Besi 7M / 140 daN',
        startupDate: '01.07.2026',
        latLong: '3.5619141,98.6029937',
        inventoryNo: 'INV-POL-07M-3011',
        status: 'AVBL'
      },
      {
        equipmentNumber: 'EQ-POL-1011-000143',
        category: 'P',
        description: 'Manhole OSP Type B Underground',
        functionalLocation: '1011-ARS-000000001',
        technicalIdentNo: 'TID-MH-ARS-001',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Wika Beton',
        modelNumber: 'MH Type B 120x80',
        startupDate: '03.07.2026',
        latLong: '-0.982245,100.612134',
        inventoryNo: 'INV-MH-TYPB-3012',
        status: 'AVBL'
      }
    ],
    dpfo: [
      {
        equipmentNumber: 'EQ-DPFO-1011-000088',
        category: 'D',
        description: 'ODP Pole Solid Splitter 8 Port LBP-01',
        functionalLocation: '1011-LBP-T00014433-20351H000.1.01897',
        technicalIdentNo: 'TID-ODP-LBP-001',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Huawei',
        modelNumber: 'ODP-8-SP-SC/UPC',
        startupDate: '15.08.2026',
        latLong: '3.5618141,98.6028937',
        inventoryNo: 'INV-DPFO-8P-4011',
        status: 'AVBL'
      },
      {
        equipmentNumber: 'EQ-DPFO-1011-000089',
        category: 'D',
        description: 'ODP Wall Mount 16 Port ARS-01',
        functionalLocation: '1011-ARS-000000001',
        technicalIdentNo: 'TID-ODP-ARS-001',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'ZTE',
        modelNumber: 'ODP-16-WM-SC/UPC',
        startupDate: '18.08.2026',
        latLong: '-0.982145,100.612034',
        inventoryNo: 'INV-DPFO-16P-4012',
        status: 'AVBL'
      }
    ],
    jointbox: [
      {
        equipmentNumber: 'EQ-JBX-1011-000031',
        category: 'J',
        description: 'Joint Closure Dome 96C IP68 Feeder ARS',
        functionalLocation: '1011-ARS-000000001',
        technicalIdentNo: 'TID-JBX-ARS-01',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: '3M',
        modelNumber: 'BTI Dome 96 Core',
        startupDate: '12.08.2026',
        latLong: '-0.982300,100.612400',
        inventoryNo: 'INV-JBX-96C-5011',
        status: 'AVBL'
      },
      {
        equipmentNumber: 'EQ-JBX-1011-000032',
        category: 'J',
        description: 'Joint Closure Inline 48C OSP LBP',
        functionalLocation: '1011-LBP-T00014433',
        technicalIdentNo: 'TID-JBX-LBP-01',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Corning',
        modelNumber: 'Inline Closure 48C',
        startupDate: '14.08.2026',
        latLong: '3.5617000,98.6027000',
        inventoryNo: 'INV-JBX-48C-5012',
        status: 'AVBL'
      }
    ],
    splitter: [
      {
        equipmentNumber: 'EQ-SPL-1011-000511',
        category: 'S',
        description: 'Passive PLC Splitter 1:8 SC/UPC Box',
        functionalLocation: '1011-LBP-T00014433-20351H000.1.01897',
        technicalIdentNo: 'TID-SPL-1x8-01',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Senko',
        modelNumber: 'PLC 1x8 SC/UPC Micro',
        startupDate: '15.08.2026',
        latLong: '3.5618141,98.6028937',
        inventoryNo: 'INV-SPL-1x8-6011',
        status: 'AVBL'
      },
      {
        equipmentNumber: 'EQ-SPL-1011-000512',
        category: 'S',
        description: 'Passive PLC Splitter 1:16 SC/UPC Module',
        functionalLocation: '1011-ARS-000000001',
        technicalIdentNo: 'TID-SPL-1x16-01',
        maintPlant: '1011',
        planningPlant: '1011',
        workCenter: '1011FOP1',
        costCenter: '101OP02',
        manufacturer: 'Huber+Suhner',
        modelNumber: 'PLC 1x16 SC/UPC LGX',
        startupDate: '19.08.2026',
        latLong: '-0.982145,100.612034',
        inventoryNo: 'INV-SPL-1x16-6012',
        status: 'AVBL'
      }
    ]
  };

  const rawRows = samplesByCategory[category] || samplesByCategory.cable;

  return rawRows.map((data, idx) => {
    const issues: any[] = [];
    let isDuplicatePk = false;

    // Detect duplicate
    if (idx === 1 && category === 'cable') {
      isDuplicatePk = true;
      issues.push({
        id: `eq_dup_${idx}`,
        field: 'equipmentNumber',
        rule: 'RULE_DUPLICATE_EQUIPMENT',
        severity: 'error',
        message: 'Duplikasi Nomor Equipment! Nomor ini telah digunakan pada baris #1.',
        canAutoFix: false
      });
    }

    // Inverted coordinate check
    if (data.latLong && data.latLong.startsWith('100.')) {
      issues.push({
        id: `eq_coord_${idx}`,
        field: 'latLong',
        rule: 'RULE_INVERTED_COORDINATE',
        severity: 'error',
        message: 'Koordinat terbalik! Format wajib Latitude,Longitude (-0.801322,100.651200).',
        suggestedFix: '-0.801322,100.651200',
        canAutoFix: true
      });
    }

    return {
      id: `eq_${category}_${idx + 1}`,
      rowIndex: idx + 1,
      data: { ...data },
      originalData: { ...data },
      category,
      issues,
      hasErrors: issues.some(i => i.severity === 'error') || isDuplicatePk,
      hasWarnings: issues.some(i => i.severity === 'warning'),
      isDuplicatePk,
      isRepaired: false
    };
  });
}
