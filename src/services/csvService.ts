import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FLRowData, FLRowRecord, FL_COLUMNS, FunclocModule, ValidationSummary } from '../types/flTypes';
import { validateFLRow, validateAllRowsAsync } from './validationService';

/**
 * Maps raw imported header names to standard FLRowData fields
 */
function mapHeaderToKey(rawHeader: string): keyof FLRowData | null {
  const h = rawHeader.toLowerCase().trim().replace(/[\r\n\t]/g, ' ');
  
  // Col A
  if (h.includes('functional location') && !h.includes('superior') && !h.includes('description') || h === 'fl' || h === 'kode fl' || h === 'functloc') {
    return 'functionalLocation';
  }
  // Col B
  if (h.includes('structure indicator') || h === 'structure' || h === 'struktur') {
    return 'structureIndicator';
  }
  // Col C
  if (h.includes('description') || h === 'deskripsi') {
    return 'description';
  }
  // Col D
  if (h.includes('superior') || h.includes('superior functloc') || h === 'parent fl' || h === 'lev 3') {
    return 'superiorFunctLoc';
  }
  // Col E
  if (h.includes('start-up date') || h.includes('startup') || h.includes('start up')) {
    return 'startupDate';
  }
  // Col F
  if (h.includes('planning plant') || h === 'plant') {
    return 'planningPlant';
  }
  // Col G
  if (h.includes('location (maint plant)') || h === 'location') {
    return 'location';
  }
  // Col H
  if (h.includes('plant section') || h.includes('kabupaten/kota') || h === 'section' || h === 'plan section') {
    return 'plantSection';
  }
  // Col I
  if (h.includes('maint. plant') || h.includes('maint plant') || h === 'maintenance plant') {
    return 'maintPlant';
  }
  // Col J
  if (h.includes('work center') || h === 'workcenter') {
    return 'workCenter';
  }
  // Col K
  if (h.includes('cost center') || h === 'costcenter') {
    return 'costCenter';
  }
  // Col L
  if (h.includes('sort field') || h.includes('project id')) {
    return 'sortField';
  }
  // Col M
  if (h.includes('inventory no') || h.includes('crt id') || h.includes('inventory')) {
    return 'inventoryNo';
  }
  // Col N
  if (h.includes('latitude and longitude') || h.includes('lat') || h.includes('coordinates') || h.includes('koordinat')) {
    return 'latLong';
  }
  // Col O
  if (h === 'title' || h === 'gelar') {
    return 'title';
  }
  // Col P
  if (h === 'name 1' || h === 'nama 1' || h === 'name1') {
    return 'name1';
  }
  // Col Q
  if (h === 'name 2' || h === 'nama 2' || h === 'name2') {
    return 'name2';
  }
  // Col R
  if (h.includes('street 5') || h.includes('cluster') || h.includes('building')) {
    return 'street5';
  }
  // Col S
  if ((h.includes('street') && !h.includes('2') && !h.includes('3') && !h.includes('4') && !h.includes('5')) || h.includes('street name') || h === 'jalan') {
    return 'street';
  }
  // Col T
  if (h.includes('street 3')) {
    return 'street3';
  }
  // Col U
  if (h.includes('house number') && !h.includes('supplement') || h === 'no rumah' || h === 'nomor') {
    return 'houseNumber';
  }
  // Col V
  if (h.includes('house number supplement') || h.includes('block code') || h.includes('blok')) {
    return 'houseNumberSupplement';
  }
  // Col W
  if (h.includes('floor') || h === 'lantai') {
    return 'floor';
  }
  // Col X
  if (h.includes('street 2') || h.includes('rt rw') || h.includes('rt/rw')) {
    return 'street2';
  }
  // Col Y
  if (h.includes('street 4')) {
    return 'street4';
  }
  // Col Z
  if (h.includes('other city') || h.includes('kelurahan') || h.includes('desa')) {
    return 'otherCity';
  }
  // Col AA
  if (h.includes('district') || h.includes('kecamatan')) {
    return 'district';
  }
  // Col AB
  if (h === 'city' || h === 'kota' || h === 'city homepass' || h === 'kabupaten') {
    return 'city';
  }
  // Col AC
  if (h.includes('postal code') || h.includes('kode pos') || h === 'zip') {
    return 'postalCode';
  }
  // Col AD
  if (h.includes('region') || h.includes('province')) {
    return 'region';
  }
  // Col AE
  if (h.includes('country') || h === 'negara' || h.includes('country (ae)')) {
    return 'country';
  }
  // Col AF
  if (h === 'telephone' || h === 'telepon' || h.includes('without country code')) {
    return 'telephone';
  }
  // Col AG
  if (h.includes('telephone extension') || h.includes('ext')) {
    return 'telephoneExtension';
  }
  // Col AH
  if (h.includes('city id') || h === 'cityid' || h === 'city code' || h === 'kode kota' || h.includes('city id (ah)')) {
    return 'cityIdGenerated';
  }
  // Col AI
  if (h === 'status' || h === 'status aktivasi') {
    return 'status';
  }

  return null;
}

/**
 * Creates empty FLRowData structure
 */
export function createEmptyFLRow(): FLRowData {
  return {
    functionalLocation: '',
    structureIndicator: 'ZFS04',
    description: '',
    superiorFunctLoc: '',
    startupDate: '',
    planningPlant: '',
    location: '',
    plantSection: '',
    maintPlant: '',
    workCenter: '',
    costCenter: '',
    sortField: '',
    inventoryNo: '',
    latLong: '',
    title: '',
    name1: '',
    name2: '',
    street5: '',
    street: '',
    street3: '',
    houseNumber: '',
    houseNumberSupplement: '',
    floor: '',
    street2: '',
    street4: '',
    otherCity: '',
    district: '',
    city: '',
    postalCode: '',
    region: '',
    country: 'ID',
    telephone: '',
    telephoneExtension: '',
    cityIdGenerated: '',
    status: 'Active'
  };
}

export interface FileStreamProgress {
  stage: string;
  currentRows: number;
  totalRows?: number;
  percent: number;
  speedRowsPerSec?: number;
  elapsedSeconds?: number;
}

/**
 * High-performance streaming file parser designed for datasets with hundreds of thousands of rows.
 * Reads CSV chunks asynchronously to prevent browser main-thread freezes and Out-Of-Memory errors.
 */
export async function parseFileStream(
  file: File,
  module: FunclocModule = 'ZFS04',
  onProgress?: (progress: FileStreamProgress) => void,
  onComplete?: (records: FLRowRecord[], summary: ValidationSummary) => void,
  onError?: (errMessage: string) => void
): Promise<void> {
  const fileName = file.name.toLowerCase();
  const startTime = performance.now();

  // 1. EXCEL WORKBOOK (.xlsx / .xls)
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    try {
      onProgress?.({
        stage: 'Membaca binary workbook Excel...',
        currentRows: 0,
        percent: 10,
        elapsedSeconds: 0
      });

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

      if (!rawRows || rawRows.length === 0) {
        onError?.('File Excel tidak memiliki baris data.');
        return;
      }

      onProgress?.({
        stage: `Mengekstrak ${rawRows.length.toLocaleString()} baris data dari sheet...`,
        currentRows: rawRows.length,
        totalRows: rawRows.length,
        percent: 30,
        elapsedSeconds: Math.round((performance.now() - startTime) / 100) / 10
      });

      // Map headers
      let headerIndex = -1;
      const firstRow = (rawRows[0] || []).map(c => String(c ?? '').trim());
      const isHeader = firstRow.some(cell => {
        const l = cell.toLowerCase();
        return l.includes('functional') || l.includes('location') || l.includes('plant') || l.includes('city') || l.includes('structure');
      });

      const columnMap: { [colIdx: number]: keyof FLRowData } = {};
      if (isHeader) {
        headerIndex = 0;
        firstRow.forEach((cell, idx) => {
          const key = mapHeaderToKey(cell);
          if (key) columnMap[idx] = key;
        });
      } else {
        FL_COLUMNS.forEach((col, idx) => {
          columnMap[idx] = col.key;
        });
      }

      const dataRows = headerIndex >= 0 ? rawRows.slice(headerIndex + 1) : rawRows;
      const unvalidatedRows: FLRowRecord[] = [];

      for (let idx = 0; idx < dataRows.length; idx++) {
        const row = dataRows[idx];
        const rowData = createEmptyFLRow();
        (row || []).forEach((cellVal, colIdx) => {
          const fieldKey = columnMap[colIdx] || (colIdx < FL_COLUMNS.length ? FL_COLUMNS[colIdx].key : null);
          if (fieldKey) {
            rowData[fieldKey] = String(cellVal ?? '').trim();
          }
        });

        unvalidatedRows.push({
          id: `row_${idx + 1}_${Date.now()}_${idx}`,
          rowIndex: idx + 1,
          originalData: { ...rowData },
          data: rowData,
          issues: [],
          repairedFields: [],
          hasErrors: false,
          hasWarnings: false,
          isRepaired: false,
          module
        });
      }

      // Validate asynchronously with progress
      const { records, summary } = await validateAllRowsAsync(unvalidatedRows, module, (p) => {
        onProgress?.({
          stage: p.stage,
          currentRows: p.current,
          totalRows: p.total,
          percent: Math.round(40 + p.percent * 0.6),
          speedRowsPerSec: p.speedRowsPerSec,
          elapsedSeconds: p.elapsedSeconds
        });
      });

      onComplete?.(records, summary);
    } catch (err: any) {
      onError?.('Gagal membaca file Excel: ' + (err?.message || 'Format tidak sesuai'));
    }
    return;
  }

  // 2. CSV / TXT STREAM PARSING
  const unvalidatedRows: FLRowRecord[] = [];
  let headerMap: { [colIdx: number]: keyof FLRowData } | null = null;
  let parsedRowsCount = 0;
  const totalEstimatedRows = Math.max(100, Math.round(file.size / 130)); // approx 130 bytes/row

  Papa.parse(file, {
    skipEmptyLines: true,
    fastMode: true,
    chunkSize: 1024 * 512, // 512 KB chunks for high throughput
    chunk: async (results, parser) => {
      parser.pause();
      const rows = results.data as string[][];
      if (rows.length === 0) {
        parser.resume();
        return;
      }

      let startIdx = 0;
      if (headerMap === null) {
        const firstRow = rows[0].map(c => String(c ?? '').trim());
        const isHeader = firstRow.some(cell => {
          const l = cell.toLowerCase();
          return l.includes('functional') || l.includes('location') || l.includes('plant') || l.includes('city') || l.includes('structure');
        });

        headerMap = {};
        if (isHeader) {
          firstRow.forEach((cell, idx) => {
            const key = mapHeaderToKey(cell);
            if (key) headerMap![idx] = key;
          });
          startIdx = 1;
        } else {
          FL_COLUMNS.forEach((col, idx) => {
            headerMap![idx] = col.key;
          });
        }
      }

      for (let i = startIdx; i < rows.length; i++) {
        const row = rows[i];
        const rowData = createEmptyFLRow();
        row.forEach((cellVal, colIdx) => {
          const fieldKey = headerMap![colIdx] || (colIdx < FL_COLUMNS.length ? FL_COLUMNS[colIdx].key : null);
          if (fieldKey) {
            rowData[fieldKey] = String(cellVal ?? '').trim();
          }
        });

        parsedRowsCount++;
        unvalidatedRows.push({
          id: `row_${parsedRowsCount}_${parsedRowsCount}`,
          rowIndex: parsedRowsCount,
          originalData: { ...rowData },
          data: rowData,
          issues: [],
          repairedFields: [],
          hasErrors: false,
          hasWarnings: false,
          isRepaired: false,
          module
        });
      }

      const elapsedMs = Math.max(1, performance.now() - startTime);
      const speed = Math.round(parsedRowsCount / (elapsedMs / 1000));
      const percent = Math.min(48, Math.round((parsedRowsCount / totalEstimatedRows) * 45));

      onProgress?.({
        stage: `Membaca streaming & memetakan kolom (baris ${parsedRowsCount.toLocaleString()})...`,
        currentRows: parsedRowsCount,
        totalRows: Math.max(parsedRowsCount, totalEstimatedRows),
        percent,
        speedRowsPerSec: speed,
        elapsedSeconds: Math.round(elapsedMs / 100) / 10
      });

      // Yield to main event loop
      await new Promise(r => setTimeout(r, 0));
      parser.resume();
    },
    complete: async () => {
      try {
        if (unvalidatedRows.length === 0) {
          onError?.('Tidak ada baris data yang ditemukan dalam berkas.');
          return;
        }

        onProgress?.({
          stage: `Memulai pipeline validasi untuk ${unvalidatedRows.length.toLocaleString()} baris...`,
          currentRows: unvalidatedRows.length,
          totalRows: unvalidatedRows.length,
          percent: 50,
          elapsedSeconds: Math.round((performance.now() - startTime) / 100) / 10
        });

        const { records, summary } = await validateAllRowsAsync(
          unvalidatedRows,
          module,
          (p) => {
            onProgress?.({
              stage: p.stage,
              currentRows: p.current,
              totalRows: p.total,
              percent: Math.round(50 + p.percent * 0.5),
              speedRowsPerSec: p.speedRowsPerSec,
              elapsedSeconds: p.elapsedSeconds
            });
          }
        );

        onComplete?.(records, summary);
      } catch (err: any) {
        onError?.(err?.message || 'Gagal memvalidasi data');
      }
    },
    error: (err) => {
      onError?.('Gagal memproses streaming CSV: ' + (err?.message || 'Unknown error'));
    }
  });
}

/**
 * Fast synchronous CSV parser fallback for small text pastes
 */
export function parseCSVText(csvText: string, module: FunclocModule = 'ZFS04'): FLRowRecord[] {
  const parsed = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rawRows = parsed.data as string[][];
  if (rawRows.length === 0) return [];

  let headerIndex = -1;
  const firstRow = rawRows[0].map(c => String(c).trim());
  const isHeader = firstRow.some(cell => {
    const l = cell.toLowerCase();
    return l.includes('functional') || l.includes('location') || l.includes('plant') || l.includes('city') || l.includes('structure');
  });

  if (isHeader) headerIndex = 0;

  const columnMap: { [colIdx: number]: keyof FLRowData } = {};
  if (headerIndex >= 0) {
    firstRow.forEach((cell, idx) => {
      const key = mapHeaderToKey(cell);
      if (key) columnMap[idx] = key;
    });
  } else {
    FL_COLUMNS.forEach((col, idx) => {
      columnMap[idx] = col.key;
    });
  }

  const dataRows = headerIndex >= 0 ? rawRows.slice(headerIndex + 1) : rawRows;
  const records: FLRowRecord[] = [];

  dataRows.forEach((row, idx) => {
    const rowData = createEmptyFLRow();
    row.forEach((cellVal, colIdx) => {
      const fieldKey = columnMap[colIdx] || (colIdx < FL_COLUMNS.length ? FL_COLUMNS[colIdx].key : null);
      if (fieldKey) {
        rowData[fieldKey] = String(cellVal || '').trim();
      }
    });

    const validated = validateFLRow(rowData, idx + 1, `row_${idx + 1}_${Date.now()}`, undefined, module);
    records.push(validated);
  });

  return records;
}

/**
 * Parse binary Excel file (.xlsx / .xls) into FLRowRecord array (synchronous fallback)
 */
export function parseExcelFile(arrayBuffer: ArrayBuffer, module: FunclocModule = 'ZFS04'): FLRowRecord[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  if (!rawRows || rawRows.length === 0) return [];

  const csvContent = rawRows.map(row => 
    (row || []).map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')
  ).join('\n');

  return parseCSVText(csvContent, module);
}

/**
 * Export rows to CSV with ';' delimiter as requested
 */
export function exportToDelimitedCSV(records: FLRowRecord[], filename = 'Validasi_FL_Master_Data.csv'): void {
  // Build header row with standard column titles
  const headers = FL_COLUMNS.map(col => `"${col.title} (${col.letter})"`);
  
  const rows = records.map(record => {
    return FL_COLUMNS.map(col => {
      const val = record.data[col.key] ?? '';
      // Escape quotes and enclose in quotes for CSV safety
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';');
  });

  const csvString = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * OPSI EKSPOR 1: Export ONLY Clean Records (100% Valid & No Duplicates) for SAP Upload
 */
export function exportCleanRecordsCSV(records: FLRowRecord[], filename = 'Master_Data_FL_BERSIH_SIAP_UPLOAD.csv'): number {
  const cleanRecords = records.filter(r => !r.hasErrors && !r.isDuplicatePk);
  exportToDelimitedCSV(cleanRecords, filename);
  return cleanRecords.length;
}

/**
 * OPSI EKSPOR 2: Export ONLY Problematic & Duplicate Records for Vendor/Field Feedback
 */
export function exportErrorRecordsCSV(records: FLRowRecord[], filename = 'Master_Data_FL_BERMASALAH_FEEDBACK_VENDOR.csv'): number {
  const errorRecords = records.filter(r => r.hasErrors || r.isDuplicatePk);
  exportToDelimitedCSV(errorRecords, filename);
  return errorRecords.length;
}

/**
 * Export error audit report to CSV with ';' delimiter
 */
export function exportErrorReportCSV(records: FLRowRecord[], filename = 'Audit_Temuan_Validasi_FL.csv'): void {
  const headers = [
    'Baris',
    'Kolom',
    'Aturan Validasi',
    'Tingkat Masalah',
    'Pesan Validasi',
    'Nilai Saat Ini',
    'Saran Perbaikan (Auto-Fix)'
  ];

  const issueRows: string[] = [];

  records.forEach(r => {
    r.issues.forEach(issue => {
      const currentVal = r.data[issue.field] || '';
      const row = [
        `"${r.rowIndex}"`,
        `"${issue.columnLetter} - ${String(issue.field)}"`,
        `"${issue.rule}"`,
        `"${issue.severity.toUpperCase()}"`,
        `"${issue.message.replace(/"/g, '""')}"`,
        `"${String(currentVal).replace(/"/g, '""')}"`,
        `"${(issue.suggestedFix || '').replace(/"/g, '""')}"`
      ];
      issueRows.push(row.join(';'));
    });
  });

  const csvString = '\uFEFF' + [headers.join(';'), ...issueRows].join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
