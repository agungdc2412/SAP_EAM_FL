import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ValidationWorkflowBar } from './components/ValidationWorkflowBar';
import { DataGrid } from './components/DataGrid';
import { ScanningRepairPanel } from './components/ScanningRepairPanel';
import { LovDatabaseModal } from './components/LovDatabaseModal';
import { HierarchyDocModal } from './components/HierarchyDocModal';
import { UploadModal } from './components/UploadModal';
import { ExportModal } from './components/ExportModal';
import { FLRowRecord } from './types/flTypes';
import { getSampleRecords } from './data/sampleDataset';
import { validateAllRows, validateFLRow, extractDigit6to8 } from './services/validationService';
import { 
  autoRepairRow, 
  autoRepairAll, 
  resetRecord, 
  repairPlanSectionFromCityName, 
  syncPlantSectionWithFLCode,
  batchRepairPlanSection,
  batchSyncFLVsPlantSection,
  applyFuzzyCitySuggestion,
  batchApplyAllFuzzyTypoSuggestions
} from './services/repairService';
import { exportToDelimitedCSV, exportErrorReportCSV } from './services/csvService';
import { 
  Search, 
  CheckCircle2, 
  FileSpreadsheet,
  AlertCircle,
  Download
} from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<FLRowRecord[]>(() => getSampleRecords());
  const [activeTab, setActiveTab] = useState<'validator' | 'scanning' | 'lov' | 'docs'>('validator');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ERROR' | 'DUPLICATE' | 'VALID' | 'REPAIRED'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Compute live validation summary
  const { summary } = useMemo(() => {
    return validateAllRows(records);
  }, [records]);

  // Counts for the 2 main buttons
  const missingCityIdCount = useMemo(() => {
    return records.filter(r => !r.data.cityIdGenerated || r.data.plantSection !== r.data.cityIdGenerated).length;
  }, [records]);

  const flMismatchCount = useMemo(() => {
    return records.filter(r => {
      const d = extractDigit6to8(r.data.functionalLocation);
      return d && r.data.plantSection !== d;
    }).length;
  }, [records]);

  // Detected typos count
  const typoCityCount = useMemo(() => {
    return records.filter(r => !!r.fuzzyCitySuggestion).length;
  }, [records]);

  // Toast notification
  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // FUZZY TYPO FIX: Single Row
  const handleApplyFuzzyCity = (record: FLRowRecord) => {
    const oldCity = record.data.city;
    const targetCity = record.fuzzyCitySuggestion?.cityHomepass || '';
    const { updatedRecord, changesMade } = applyFuzzyCitySuggestion(record);
    setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
    showToast(
      `Typo diperbaiki: '${oldCity}' -> '${targetCity}' (City ID ${updatedRecord.data.cityIdGenerated} terisi & hierarki sinkron).`,
      'success'
    );
  };

  // FUZZY TYPO FIX: Batch All Typos
  const handleFixAllTypos = () => {
    const { repairedRecords, totalFixedCount } = batchApplyAllFuzzyTypoSuggestions(records);
    setRecords(repairedRecords);
    showToast(
      `Berhasil memperbaiki ${totalFixedCount} penulisan typo nama kota dan menyinkronkan seluruh ID LOV.`,
      'success'
    );
  };

  // INLINE CELL EDITING: Quick Manual Edit
  const handleUpdateCell = (record: FLRowRecord, field: keyof import('./types/flTypes').FLRowData, newValue: string) => {
    if (field === 'functionalLocation') {
      showToast('Kolom A (Functional Location) adalah Primary Key dan tidak dapat diubah.', 'warning');
      return;
    }

    const updatedData = {
      ...record.data,
      [field]: newValue
    };

    // Re-validate single row with new data
    const revalidated = validateFLRow(updatedData, record.rowIndex, record.id, record.originalData);
    setRecords(prev => prev.map(r => r.id === record.id ? revalidated : r));
    showToast(`Baris #${record.rowIndex}: Nilai Kolom ${field} berhasil diperbarui.`);
  };

  // BUTTON 1: Validate Plan Section
  const handleValidatePlanSection = () => {
    const { repairedRecords, totalRepairedCount, totalChanges } = batchRepairPlanSection(records);
    setRecords(repairedRecords);
    if (totalRepairedCount > 0) {
      showToast(
        `Sukses Validasi 1: ${totalRepairedCount} baris diperbarui (${totalChanges} kolom: City ID AH, Plan Section H, Plant F/I, WC J, CC K disinkronkan).`,
        'success'
      );
    } else {
      showToast('Seluruh Plan Section, Plant, Work Center, dan Cost Center sudah sesuai dengan City ID LOV.', 'info');
    }
  };

  // BUTTON 2: Validate FL 3-Digit vs Plant Section
  const handleValidateFLVsPlantSection = () => {
    const { repairedRecords, totalRepairedCount, mismatchCountBefore } = batchSyncFLVsPlantSection(records);
    if (mismatchCountBefore === 0) {
      showToast('Pemeriksaan selesai: Semua 3-digit Plant Section (Kolom H) SUDAH SAMA dengan 3-digit Kolom A.', 'success');
      return;
    }

    setRecords(repairedRecords);
    showToast(
      `Ditemukan ${mismatchCountBefore} baris selisih: Kolom Plant Section (H) telah disinkronkan mengikuti 3-digit Kolom A.`,
      'warning'
    );
  };

  // Single Row: Sync Plan Section from City Name
  const handleSyncPlanSectionRow = (record: FLRowRecord) => {
    const { updatedRecord, changesMade } = repairPlanSectionFromCityName(record);
    setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
    if (changesMade.length > 0) {
      showToast(`Baris #${record.rowIndex}: Berhasil disinkronkan dengan referensi LOV.`);
    } else {
      showToast(`Baris #${record.rowIndex}: Sudah sesuai dengan LOV.`, 'info');
    }
  };

  // Single Row: Sync Plant Section with FL 3-digit
  const handleSyncFLDigitRow = (record: FLRowRecord) => {
    const { updatedRecord, changesMade } = syncPlantSectionWithFLCode(record);
    setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
    const flDigit = extractDigit6to8(record.data.functionalLocation);
    if (changesMade.length > 0) {
      showToast(`Baris #${record.rowIndex}: Plant Section (Kolom H) disamakan dengan '${flDigit}' dari Kolom A.`);
    } else {
      showToast(`Baris #${record.rowIndex}: Plant Section sudah sama dengan 3-digit Kolom A.`, 'info');
    }
  };

  // Repair single row
  const handleRepairRow = (record: FLRowRecord) => {
    const { updatedRecord, changesMade } = autoRepairRow(record);
    setRecords(prev => prev.map(r => r.id === record.id ? updatedRecord : r));
    showToast(`Baris #${record.rowIndex} berhasil diperbaiki (${changesMade.length} kolom disinkronkan).`);
  };

  // Repair all rows
  const handleRepairAll = () => {
    const { repairedRecords, totalRepairedCount, totalChanges } = autoRepairAll(records);
    setRecords(repairedRecords);
    showToast(`Berhasil memperbaiki ${totalRepairedCount} baris data (${totalChanges} perubahan diterapkan).`);
  };

  // Reset single row
  const handleResetRow = (record: FLRowRecord) => {
    const reset = resetRecord(record);
    setRecords(prev => prev.map(r => r.id === record.id ? reset : r));
    showToast(`Baris #${record.rowIndex} dikembalikan ke data awal.`, 'info');
  };

  // Load sample dataset
  const handleLoadSample = () => {
    const samples = getSampleRecords();
    setRecords(samples);
    showToast('Data sampel migrasi berhasil dimuat.');
  };

  // Export CSV
  const handleExportCSV = () => {
    exportToDelimitedCSV(records, 'Master_Data_Functional_Location_SAP.csv');
    showToast('File CSV dengan delimiter titik koma (;) berhasil diunduh.');
  };

  // Export Audit CSV
  const handleExportAuditReport = () => {
    exportErrorReportCSV(records, 'Laporan_Audit_Validasi_FL.csv');
    showToast('Laporan audit temuan validasi (CSV ;) berhasil diunduh.');
  };

  // File Upload
  const handleDataLoaded = (newRecords: FLRowRecord[]) => {
    setRecords(newRecords);
    showToast(`${newRecords.length} baris data berhasil diimpor dan divalidasi.`);
  };

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (statusFilter === 'ERROR' && !r.hasErrors) return false;
      if (statusFilter === 'DUPLICATE' && !r.isDuplicatePk) return false;
      if (statusFilter === 'VALID' && (r.hasErrors || r.hasWarnings)) return false;
      if (statusFilter === 'REPAIRED' && !r.isRepaired) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesFl = (r.data.functionalLocation || '').toLowerCase().includes(q);
        const matchesSup = (r.data.superiorFunctLoc || '').toLowerCase().includes(q);
        const matchesCity = (r.data.city || '').toLowerCase().includes(q);
        const matchesCityIdAh = (r.data.cityIdGenerated || '').toLowerCase().includes(q);
        const matchesPlan = (r.data.plantSection || '').toLowerCase().includes(q);
        return matchesFl || matchesSup || matchesCity || matchesCityIdAh || matchesPlan;
      }

      return true;
    });
  }, [records, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-slate-200">
      {/* Header with Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLoadSample={handleLoadSample}
        hasData={records.length > 0}
        totalErrors={summary.errorRows}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-fade-in shadow-xl">
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : toastMessage.type === 'warning'
                ? 'bg-amber-900 text-white border-amber-800'
                : 'bg-blue-900 text-white border-blue-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Lembar Kerja Validasi */}
        {activeTab === 'validator' && (
          <div className="space-y-4">
            {/* Structured Workflow Bar with 2 Clear Buttons */}
            <ValidationWorkflowBar
              summary={summary}
              onValidatePlanSection={handleValidatePlanSection}
              onValidateFLVsPlantSection={handleValidateFLVsPlantSection}
              missingCityIdCount={missingCityIdCount}
              flMismatchCount={flMismatchCount}
              typoCityCount={typoCityCount}
              onFixAllTypos={handleFixAllTypos}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />

            {/* Clean Data Grid Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Segmented Filter Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua Data ({records.length})
                </button>

                <button
                  onClick={() => setStatusFilter('ERROR')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'ERROR'
                      ? 'bg-white text-rose-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Hanya Masalah ({summary.errorRows})
                </button>

                {summary.duplicateRows > 0 && (
                  <button
                    onClick={() => setStatusFilter('DUPLICATE')}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      statusFilter === 'DUPLICATE'
                        ? 'bg-white text-rose-900 shadow-2xs font-bold'
                        : 'text-rose-700 hover:text-rose-900 bg-rose-50/60'
                    }`}
                  >
                    Duplikat PK ({summary.duplicateRows})
                  </button>
                )}

                <button
                  onClick={() => setStatusFilter('VALID')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'VALID'
                      ? 'bg-white text-emerald-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sudah Valid ({summary.validRows})
                </button>

                <button
                  onClick={() => setStatusFilter('REPAIRED')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    statusFilter === 'REPAIRED'
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Telah Diperbaiki ({summary.repairedRows})
                </button>
              </div>

              {/* Search & Audit Log */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari FL / Kota / ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-md bg-white w-48 sm:w-64 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 font-medium cursor-pointer"
                  title="Buka pilihan ekspor terpisah (Data Bersih, Data Bermasalah, Semua Data, Laporan Audit)"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Opsi Ekspor (;)</span>
                </button>

                <button
                  onClick={handleExportAuditReport}
                  className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                  title="Unduh rekapan temuan audit CSV (;)"
                >
                  Unduh Log Audit (;)
                </button>
              </div>
            </div>

            {/* High-Density Data Grid */}
            <DataGrid
              records={filteredRecords}
              onRepairRow={handleRepairRow}
              onSyncPlanSection={handleSyncPlanSectionRow}
              onSyncFLDigit={handleSyncFLDigitRow}
              onApplyFuzzyCity={handleApplyFuzzyCity}
              onUpdateCell={handleUpdateCell}
              onResetRow={handleResetRow}
            />
          </div>
        )}

        {/* Tab 2: Scanning & Temuan Masalah */}
        {activeTab === 'scanning' && (
          <ScanningRepairPanel
            records={records}
            onRepairRow={handleRepairRow}
            onRepairAll={handleRepairAll}
            onValidatePlanSection={handleValidatePlanSection}
            onValidateFLVsPlantSection={handleValidateFLVsPlantSection}
            onRunValidation={handleValidatePlanSection}
            onApplyFuzzyCity={handleApplyFuzzyCity}
          />
        )}

        {/* Tab 3: Referensi LOV 111 Kota */}
        {activeTab === 'lov' && (
          <LovDatabaseModal />
        )}

        {/* Tab 4: Panduan Struktur */}
        {activeTab === 'docs' && (
          <HierarchyDocModal />
        )}
      </main>

      {/* Upload & Import Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Opsi Ekspor Terpisah Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
        onShowToast={showToast}
      />
    </div>
  );
}
