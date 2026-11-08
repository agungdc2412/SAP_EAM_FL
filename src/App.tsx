import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ValidationWorkflowBar } from './components/ValidationWorkflowBar';
import { DataGrid } from './components/DataGrid';
import { ScanningRepairPanel } from './components/ScanningRepairPanel';
import { LovDatabaseModal } from './components/LovDatabaseModal';
import { HierarchyDocModal } from './components/HierarchyDocModal';
import { UploadModal } from './components/UploadModal';
import { ExportModal } from './components/ExportModal';
import { ReferenceFuzzyModal } from './components/ReferenceFuzzyModal';
import { LoadingPresentationModal } from './components/LoadingPresentationModal';
import { FLRowRecord, FunclocModule, MODULE_CONFIGS, FLRowData, ValidationSummary } from './types/flTypes';
import { getSampleRecords } from './data/sampleDataset';
import { validateAllRows, validateFLRow, extractDigit6to8, validateAllRowsAsync } from './services/validationService';
import { 
  autoRepairRow, 
  autoRepairAll, 
  resetRecord, 
  repairPlanSectionFromCityName, 
  syncPlantSectionWithFLCode,
  batchRepairPlanSection,
  batchSyncFLVsPlantSection,
  applyFuzzyCitySuggestion,
  batchApplyAllFuzzyTypoSuggestions,
  batchRepairHierarchy,
  batchRepairPlanSectionAsync,
  batchSyncFLVsPlantSectionAsync,
  batchApplyAllFuzzyTypoSuggestionsAsync,
  batchRepairHierarchyAsync
} from './services/repairService';
import { exportToDelimitedCSV, exportErrorReportCSV, parseFileStream } from './services/csvService';
import { 
  Search, 
  CheckCircle2, 
  Download
} from 'lucide-react';

export default function App() {
  // Current active structure module: ZFS01 (NonBroadband) or ZFS04 (OSP/Broadband)
  const [currentModule, setCurrentModule] = useState<FunclocModule>('ZFS01');
  const [records, setRecords] = useState<FLRowRecord[]>(() => getSampleRecords('ZFS01'));
  const [summary, setSummary] = useState<ValidationSummary>(() => {
    return validateAllRows(getSampleRecords('ZFS01'), 'ZFS01').summary;
  });
  const [activeTab, setActiveTab] = useState<'validator' | 'scanning' | 'lov' | 'docs'>('validator');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFuzzyModalOpen, setIsFuzzyModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ERROR' | 'DUPLICATE' | 'VALID' | 'REPAIRED'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Presentation-grade loading modal state
  const [loadingState, setLoadingState] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    stage: string;
    currentCount: number;
    totalCount: number;
    percent: number;
    speedRowsPerSec: number;
    elapsedSeconds: number;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    stage: '',
    currentCount: 0,
    totalCount: 0,
    percent: 0,
    speedRowsPerSec: 0,
    elapsedSeconds: 0
  });

  const refreshSummary = (updatedRecords: FLRowRecord[], mod: FunclocModule = currentModule) => {
    const { summary: s } = validateAllRows(updatedRecords, mod);
    setSummary(s);
  };

  // Counts for the 2 main workflow buttons
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

  // Module switch handler with async chunked revalidation
  const handleChangeModule = async (newModule: FunclocModule) => {
    if (newModule === currentModule) return;
    setCurrentModule(newModule);

    if (records.length > 500) {
      setLoadingState({
        isOpen: true,
        title: `Beralih ke Modul ${MODULE_CONFIGS[newModule].code}`,
        subtitle: `Validasi ulang ${records.length.toLocaleString()} baris data sesuai standar ${MODULE_CONFIGS[newModule].name}`,
        stage: 'Memvalidasi ulang seluruh baris...',
        currentCount: 0,
        totalCount: records.length,
        percent: 0,
        speedRowsPerSec: 0,
        elapsedSeconds: 0
      });

      const { records: finalRecords, summary: newSummary } = await validateAllRowsAsync(
        records,
        newModule,
        (p) => {
          setLoadingState(prev => ({
            ...prev,
            stage: p.stage,
            currentCount: p.current,
            totalCount: p.total,
            percent: p.percent,
            speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
            elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
          }));
        }
      );

      setRecords(finalRecords);
      setSummary(newSummary);
      setLoadingState(prev => ({ ...prev, percent: 100, stage: '✓ Validasi modul selesai.' }));
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        showToast(`Beralih ke Modul ${MODULE_CONFIGS[newModule].code}. Data telah divalidasi ulang.`, 'info');
      }, 400);
    } else {
      const { records: finalRecords, summary: newSummary } = validateAllRows(records, newModule);
      setRecords(finalRecords);
      setSummary(newSummary);
      showToast(`Beralih ke Modul ${MODULE_CONFIGS[newModule].code}. Data telah divalidasi ulang.`, 'info');
    }
  };

  // Load sample dataset for active module
  const handleLoadSample = () => {
    const samples = getSampleRecords(currentModule);
    const { records: val, summary: s } = validateAllRows(samples, currentModule);
    setRecords(val);
    setSummary(s);
    showToast(`Data sampel migrasi ${MODULE_CONFIGS[currentModule].code} berhasil dimuat.`);
  };

  // High-performance streaming file upload handler (handles 100,000+ rows smoothly)
  const handleStartStreamingFile = (file: File) => {
    setLoadingState({
      isOpen: true,
      title: `Mengimpor: ${file.name}`,
      subtitle: `Ukuran file ${(file.size / (1024 * 1024)).toFixed(2)} MB · Streaming batch ingestion non-blocking ke modul ${MODULE_CONFIGS[currentModule].code}`,
      stage: 'Mempersiapkan alokasi stream memori...',
      currentCount: 0,
      totalCount: 0,
      percent: 5,
      speedRowsPerSec: 0,
      elapsedSeconds: 0
    });

    parseFileStream(
      file,
      currentModule,
      (p) => {
        setLoadingState(prev => ({
          ...prev,
          isOpen: true,
          stage: p.stage,
          currentCount: p.currentRows,
          totalCount: p.totalRows || p.currentRows,
          percent: p.percent,
          speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
          elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
        }));
      },
      (loadedRecords, loadedSummary) => {
        setRecords(loadedRecords);
        setSummary(loadedSummary);
        setLoadingState(prev => ({
          ...prev,
          stage: `✓ Selesai! ${loadedRecords.length.toLocaleString()} baris berhasil dimuat dan divalidasi.`,
          percent: 100
        }));
        setTimeout(() => {
          setLoadingState(prev => ({ ...prev, isOpen: false }));
          showToast(`Sukses memuat dan memvalidasi ${loadedRecords.length.toLocaleString()} baris data master FL.`, 'success');
        }, 500);
      },
      (errorMsg) => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        showToast(errorMsg, 'warning');
      }
    );
  };

  // FUZZY TYPO FIX: Single Row
  const handleApplyFuzzyCity = (record: FLRowRecord) => {
    const oldCity = record.data.city;
    const targetCity = record.fuzzyCitySuggestion?.cityHomepass || '';
    const { updatedRecord } = applyFuzzyCitySuggestion(record, currentModule);
    setRecords(prev => {
      const next = prev.map(r => r.id === record.id ? updatedRecord : r);
      refreshSummary(next);
      return next;
    });
    showToast(
      `Typo diperbaiki: '${oldCity}' -> '${targetCity}' (City ID ${updatedRecord.data.cityIdGenerated} terisi & hierarki sinkron).`,
      'success'
    );
  };

  // FUZZY TYPO FIX: Batch All Typos with Loading Presentation
  const handleFixAllTypos = async () => {
    if (records.length > 500) {
      setLoadingState({
        isOpen: true,
        title: 'Perbaikan Otomatis Seluruh Typo Nama Kota',
        subtitle: `Menerapkan saran pencocokan Bigram + Levenshtein ke nama resmi dan menyinkronkan ID referensi`,
        stage: 'Memperbaiki penulisan typo...',
        currentCount: 0,
        totalCount: records.length,
        percent: 0,
        speedRowsPerSec: 0,
        elapsedSeconds: 0
      });

      const { repairedRecords, totalFixedCount } = await batchApplyAllFuzzyTypoSuggestionsAsync(
        records,
        currentModule,
        (p) => {
          setLoadingState(prev => ({
            ...prev,
            stage: p.stage,
            currentCount: p.current,
            totalCount: p.total,
            percent: p.percent,
            speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
            elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
          }));
        }
      );

      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      setLoadingState(prev => ({ ...prev, percent: 100, stage: '✓ Perbaikan typo selesai.' }));
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        showToast(`Berhasil memperbaiki ${totalFixedCount.toLocaleString()} penulisan typo nama kota dan menyinkronkan seluruh ID referensi.`, 'success');
      }, 400);
    } else {
      const { repairedRecords, totalFixedCount } = batchApplyAllFuzzyTypoSuggestions(records, currentModule);
      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      showToast(`Berhasil memperbaiki ${totalFixedCount} penulisan typo nama kota dan menyinkronkan seluruh ID referensi.`, 'success');
    }
  };

  // HIERARCHY REPAIR: Batch Fix Hierarchy Violations with Loading Presentation
  const handleRepairHierarchy = async () => {
    if (records.length > 500) {
      setLoadingState({
        isOpen: true,
        title: 'Perbaikan Otomatis Pelanggaran Hierarki',
        subtitle: `Menyelaraskan Superior FL (Kolom D) dengan parent prefix Kolom A sesuai hierarki Modul ${MODULE_CONFIGS[currentModule].code}`,
        stage: 'Menyelaraskan struktur hierarki...',
        currentCount: 0,
        totalCount: records.length,
        percent: 0,
        speedRowsPerSec: 0,
        elapsedSeconds: 0
      });

      const { repairedRecords, totalFixedCount } = await batchRepairHierarchyAsync(
        records,
        currentModule,
        (p) => {
          setLoadingState(prev => ({
            ...prev,
            stage: p.stage,
            currentCount: p.current,
            totalCount: p.total,
            percent: p.percent,
            speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
            elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
          }));
        }
      );

      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      setLoadingState(prev => ({ ...prev, percent: 100, stage: '✓ Penyelarasan hierarki selesai.' }));
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        showToast(`Berhasil menyelaraskan ${totalFixedCount.toLocaleString()} baris hierarchy violation (Kolom D diselaraskan ke prefix Kolom A).`, 'success');
      }, 400);
    } else {
      const { repairedRecords, totalFixedCount } = batchRepairHierarchy(records, currentModule);
      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      showToast(`Berhasil menyelaraskan ${totalFixedCount} baris hierarchy violation (Kolom D diselaraskan ke prefix Kolom A).`, 'success');
    }
  };

  // FUZZY MODAL: Apply Single Suggestion from Modal
  const handleApplySingleSuggestionFromModal = (
    recordId: string, 
    suggestion: { cityName: string; cityId: string; plant?: string }
  ) => {
    const target = records.find(r => r.id === recordId);
    if (!target) return;

    // Use repairPlanSectionFromCityName with updated city
    const modifiedRecord: FLRowRecord = {
      ...target,
      data: {
        ...target.data,
        city: suggestion.cityName,
        cityIdGenerated: suggestion.cityId
      }
    };
    const { updatedRecord } = repairPlanSectionFromCityName(modifiedRecord, currentModule);
    setRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r));
    showToast(`Baris #${target.rowIndex}: Nama kota diperbarui menjadi '${suggestion.cityName}' [${suggestion.cityId}].`);
  };

  // FUZZY MODAL: Apply All Suggestions from Modal
  const handleApplyAllSuggestionsFromModal = (
    suggestions: Array<{ recordId: string; cityName: string; cityId: string; plant?: string }>
  ) => {
    const suggestionMap = new Map(suggestions.map(s => [s.recordId, s]));

    const updated = records.map(rec => {
      const sug = suggestionMap.get(rec.id);
      if (!sug) return rec;

      const modifiedRecord: FLRowRecord = {
        ...rec,
        data: {
          ...rec.data,
          city: sug.cityName,
          cityIdGenerated: sug.cityId
        }
      };
      const { updatedRecord } = repairPlanSectionFromCityName(modifiedRecord, currentModule);
      return updatedRecord;
    });

    const { records: finalRecords } = validateAllRows(updated, currentModule);
    setRecords(finalRecords);
    showToast(`Berhasil menerapkan ${suggestions.length} saran perbaikan nama kota dan menyinkronkan data hierarki.`);
  };

  // INLINE CELL EDITING: Quick Manual Edit
  const handleUpdateCell = (record: FLRowRecord, field: keyof FLRowData, newValue: string) => {
    if (field === 'functionalLocation') {
      showToast('Kolom A (Functional Location) adalah Primary Key dan tidak dapat diubah.', 'warning');
      return;
    }

    const updatedData = {
      ...record.data,
      [field]: newValue
    };

    // Re-validate single row with new data under active module
    const revalidated = validateFLRow(updatedData, record.rowIndex, record.id, record.originalData, currentModule);
    setRecords(prev => prev.map(r => r.id === record.id ? revalidated : r));
    showToast(`Baris #${record.rowIndex}: Nilai Kolom ${field} berhasil diperbarui.`);
  };

  // BUTTON 1: Validate Plan Section with Loading Presentation
  const handleValidatePlanSection = async () => {
    if (records.length > 500) {
      setLoadingState({
        isOpen: true,
        title: 'Validasi & Sinkronisasi Plan Section (Langkah 1)',
        subtitle: `Menyinkronkan City ID (AH), Plan Section (H), Plant (F/I), Work Center (J), Cost Center (K) pada ${records.length.toLocaleString()} baris`,
        stage: 'Memulai sinkronisasi batch...',
        currentCount: 0,
        totalCount: records.length,
        percent: 0,
        speedRowsPerSec: 0,
        elapsedSeconds: 0
      });

      const { repairedRecords, totalRepairedCount, totalChanges } = await batchRepairPlanSectionAsync(
        records,
        currentModule,
        (p) => {
          setLoadingState(prev => ({
            ...prev,
            stage: p.stage,
            currentCount: p.current,
            totalCount: p.total,
            percent: p.percent,
            speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
            elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
          }));
        }
      );

      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      setLoadingState(prev => ({ ...prev, percent: 100, stage: '✓ Sinkronisasi Langkah 1 selesai.' }));
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        showToast(
          `Sukses Validasi 1 (${MODULE_CONFIGS[currentModule].code}): ${totalRepairedCount.toLocaleString()} baris diperbarui (${totalChanges.toLocaleString()} perubahan kolom).`,
          'success'
        );
      }, 400);
    } else {
      const { repairedRecords, totalRepairedCount, totalChanges } = batchRepairPlanSection(records, currentModule);
      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      if (totalRepairedCount > 0) {
        showToast(
          `Sukses Validasi 1 (${MODULE_CONFIGS[currentModule].code}): ${totalRepairedCount} baris diperbarui (${totalChanges} perubahan).`,
          'success'
        );
      } else {
        showToast(`Seluruh Plan Section dan hierarki sudah sesuai dengan referensi ${MODULE_CONFIGS[currentModule].shortName}.`, 'info');
      }
    }
  };

  // BUTTON 2: Validate FL 3-Digit vs Plan Section with Loading Presentation
  const handleValidateFLVsPlantSection = async () => {
    if (records.length > 500) {
      setLoadingState({
        isOpen: true,
        title: 'Validasi FL 3-Digit vs Plan Section (Langkah 2)',
        subtitle: `Mencocokkan digit 6-8 Kolom A dengan Kolom H dan menyelaraskan Superior FL (Kolom D) pada ${records.length.toLocaleString()} baris`,
        stage: 'Memulai validasi 3-digit...',
        currentCount: 0,
        totalCount: records.length,
        percent: 0,
        speedRowsPerSec: 0,
        elapsedSeconds: 0
      });

      const { repairedRecords, totalRepairedCount, mismatchCountBefore } = await batchSyncFLVsPlantSectionAsync(
        records,
        currentModule,
        (p) => {
          setLoadingState(prev => ({
            ...prev,
            stage: p.stage,
            currentCount: p.current,
            totalCount: p.total,
            percent: p.percent,
            speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
            elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
          }));
        }
      );

      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      setLoadingState(prev => ({ ...prev, percent: 100, stage: '✓ Validasi 3-digit selesai.' }));
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        if (mismatchCountBefore === 0) {
          showToast('Pemeriksaan selesai: Semua 3-digit Plant Section (Kolom H) SUDAH SAMA dengan 3-digit Kolom A.', 'success');
        } else {
          showToast(
            `Ditemukan ${mismatchCountBefore.toLocaleString()} baris selisih: Kolom Plant Section (H) & Superior FL (D) telah disinkronkan mengikuti Kolom A (${MODULE_CONFIGS[currentModule].code}).`,
            'warning'
          );
        }
      }, 400);
    } else {
      const { repairedRecords, totalRepairedCount, mismatchCountBefore } = batchSyncFLVsPlantSection(records, currentModule);
      if (mismatchCountBefore === 0) {
        showToast('Pemeriksaan selesai: Semua 3-digit Plant Section (Kolom H) SUDAH SAMA dengan 3-digit Kolom A.', 'success');
        return;
      }
      setRecords(repairedRecords);
      refreshSummary(repairedRecords);
      showToast(
        `Ditemukan ${mismatchCountBefore} baris selisih: Kolom Plant Section (H) & Superior FL (D) telah disinkronkan mengikuti Kolom A.`,
        'warning'
      );
    }
  };

  // Single Row: Sync Plan Section from City Name
  const handleSyncPlanSectionRow = (record: FLRowRecord) => {
    const { updatedRecord, changesMade } = repairPlanSectionFromCityName(record, currentModule);
    setRecords(prev => {
      const next = prev.map(r => r.id === record.id ? updatedRecord : r);
      refreshSummary(next);
      return next;
    });
    if (changesMade.length > 0) {
      showToast(`Baris #${record.rowIndex}: Berhasil disinkronkan dengan referensi ${MODULE_CONFIGS[currentModule].shortName}.`);
    } else {
      showToast(`Baris #${record.rowIndex}: Sudah sesuai dengan referensi.`, 'info');
    }
  };

  // Single Row: Sync Plant Section with FL 3-digit
  const handleSyncFLDigitRow = (record: FLRowRecord) => {
    const { updatedRecord, changesMade } = syncPlantSectionWithFLCode(record, currentModule);
    setRecords(prev => {
      const next = prev.map(r => r.id === record.id ? updatedRecord : r);
      refreshSummary(next);
      return next;
    });
    const flDigit = extractDigit6to8(record.data.functionalLocation);
    if (changesMade.length > 0) {
      showToast(`Baris #${record.rowIndex}: Plant Section (Kolom H) disamakan dengan '${flDigit}' dari Kolom A.`);
    } else {
      showToast(`Baris #${record.rowIndex}: Plant Section sudah sama dengan 3-digit Kolom A.`, 'info');
    }
  };

  // Repair single row
  const handleRepairRow = (record: FLRowRecord) => {
    const { updatedRecord, changesMade } = autoRepairRow(record, currentModule);
    setRecords(prev => {
      const next = prev.map(r => r.id === record.id ? updatedRecord : r);
      refreshSummary(next);
      return next;
    });
    showToast(`Baris #${record.rowIndex} berhasil diperbaiki (${changesMade.length} kolom disinkronkan).`);
  };

  // Repair all rows
  const handleRepairAll = () => {
    const { repairedRecords, totalRepairedCount, totalChanges } = autoRepairAll(records, currentModule);
    setRecords(repairedRecords);
    refreshSummary(repairedRecords);
    showToast(`Berhasil memperbaiki ${totalRepairedCount} baris data (${totalChanges} perubahan diterapkan).`);
  };

  // Reset single row
  const handleResetRow = (record: FLRowRecord) => {
    const reset = resetRecord(record, currentModule);
    setRecords(prev => {
      const next = prev.map(r => r.id === record.id ? reset : r);
      refreshSummary(next);
      return next;
    });
    showToast(`Baris #${record.rowIndex} dikembalikan ke data awal.`, 'info');
  };

  // Export Audit CSV
  const handleExportAuditReport = () => {
    exportErrorReportCSV(records, `Laporan_Audit_Validasi_FL_${currentModule}.csv`);
    showToast('Laporan audit temuan validasi (CSV ;) berhasil diunduh.');
  };

  // File Upload
  const handleDataLoaded = async (newRecords: FLRowRecord[]) => {
    if (newRecords.length > 500) {
      setLoadingState({
        isOpen: true,
        title: 'Memvalidasi Data Hasil Impor',
        subtitle: `Memvalidasi ${newRecords.length.toLocaleString()} baris data sesuai standar modul ${MODULE_CONFIGS[currentModule].code}`,
        stage: 'Memvalidasi baris data...',
        currentCount: 0,
        totalCount: newRecords.length,
        percent: 0,
        speedRowsPerSec: 0,
        elapsedSeconds: 0
      });

      const { records: finalRecords, summary: newSummary } = await validateAllRowsAsync(
        newRecords,
        currentModule,
        (p) => {
          setLoadingState(prev => ({
            ...prev,
            stage: p.stage,
            currentCount: p.current,
            totalCount: p.total,
            percent: p.percent,
            speedRowsPerSec: p.speedRowsPerSec || prev.speedRowsPerSec,
            elapsedSeconds: p.elapsedSeconds || prev.elapsedSeconds
          }));
        }
      );

      setRecords(finalRecords);
      setSummary(newSummary);
      setLoadingState(prev => ({ ...prev, percent: 100, stage: '✓ Selesai!' }));
      setTimeout(() => {
        setLoadingState(prev => ({ ...prev, isOpen: false }));
        showToast(`${newRecords.length.toLocaleString()} baris data berhasil diimpor dan divalidasi dengan modul ${MODULE_CONFIGS[currentModule].code}.`);
      }, 400);
    } else {
      const { records: finalRecords, summary: newSummary } = validateAllRows(newRecords, currentModule);
      setRecords(finalRecords);
      setSummary(newSummary);
      showToast(`${newRecords.length} baris data berhasil diimpor dan divalidasi dengan modul ${MODULE_CONFIGS[currentModule].code}.`);
    }
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-slate-200 w-full max-w-full overflow-x-hidden">
      {/* Header with Navigation Bar & Module Switcher */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLoadSample={handleLoadSample}
        hasData={records.length > 0}
        totalErrors={summary.errorRows}
        currentModule={currentModule}
        onChangeModule={handleChangeModule}
        onOpenFuzzyModal={() => setIsFuzzyModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-6 min-w-0">
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
            {/* Structured Workflow Bar with 2 Clear Buttons, Module Info, and Fuzzy Matching Button */}
            <ValidationWorkflowBar
              summary={summary}
              onValidatePlanSection={handleValidatePlanSection}
              onValidateFLVsPlantSection={handleValidateFLVsPlantSection}
              missingCityIdCount={missingCityIdCount}
              flMismatchCount={flMismatchCount}
              typoCityCount={typoCityCount}
              onFixAllTypos={handleFixAllTypos}
              onFilterToDuplicate={() => setStatusFilter('DUPLICATE')}
              onRepairHierarchy={handleRepairHierarchy}
              module={currentModule}
              onOpenFuzzyModal={() => setIsFuzzyModalOpen(true)}
            />

            {/* Clean Data Grid Toolbar matching mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                    statusFilter === 'ALL'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Semua {records.length}
                </button>

                <button
                  onClick={() => setStatusFilter('ERROR')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                    statusFilter === 'ERROR'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Bermasalah {summary.errorRows}
                </button>

                {summary.duplicateRows > 0 && (
                  <button
                    onClick={() => setStatusFilter('DUPLICATE')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                      statusFilter === 'DUPLICATE'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Duplikat {summary.duplicateRows}
                  </button>
                )}

                <button
                  onClick={() => setStatusFilter('VALID')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                    statusFilter === 'VALID'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Valid {summary.validRows}
                </button>

                <button
                  onClick={() => setStatusFilter('REPAIRED')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                    statusFilter === 'REPAIRED'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Diperbaiki {summary.repairedRows}
                </button>
              </div>

              {/* Search & Audit Log Button */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari FL, kota, atau ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-white w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400 shadow-2xs"
                  />
                </div>

                <button
                  onClick={handleExportAuditReport}
                  className="px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 font-medium shadow-2xs hover:bg-slate-50"
                  title="Unduh rekapan temuan audit CSV (;)"
                >
                  Log audit
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

        {/* Tab 3: Referensi Database (SNI 424 & LOV 111) */}
        {activeTab === 'lov' && (
          <LovDatabaseModal initialModule={currentModule} />
        )}

        {/* Tab 4: Panduan Struktur */}
        {activeTab === 'docs' && (
          <HierarchyDocModal />
        )}
      </main>

      {/* Fuzzy Matching Reference Discrepancy Modal */}
      <ReferenceFuzzyModal
        isOpen={isFuzzyModalOpen}
        onClose={() => setIsFuzzyModalOpen(false)}
        records={records}
        module={currentModule}
        onApplySingleSuggestion={handleApplySingleSuggestionFromModal}
        onApplyAllSuggestions={handleApplyAllSuggestionsFromModal}
      />

      {/* Upload & Import Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
        onStartStreamingFile={handleStartStreamingFile}
        module={currentModule}
      />

      {/* Opsi Ekspor Terpisah Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
        onShowToast={showToast}
      />

      {/* Presentation-Style Running Indicator Modal for Upload & Large Batch Validations */}
      <LoadingPresentationModal
        {...loadingState}
        onCancel={() => setLoadingState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
