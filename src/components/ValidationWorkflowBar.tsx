import React, { useState } from 'react';
import { ValidationSummary, FunclocModule, MODULE_CONFIGS } from '../types/flTypes';
import { 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Play
} from 'lucide-react';

interface ValidationWorkflowBarProps {
  summary: ValidationSummary;
  onValidatePlanSection: () => void;
  onValidateFLVsPlantSection: () => void;
  missingCityIdCount: number;
  flMismatchCount: number;
  typoCityCount?: number;
  onFixAllTypos?: () => void;
  onOpenFuzzyModal?: () => void;
  onFilterToDuplicate?: () => void;
  onRepairHierarchy?: () => void;
  module?: FunclocModule;
}

export const ValidationWorkflowBar: React.FC<ValidationWorkflowBarProps> = ({
  summary,
  onValidatePlanSection,
  onValidateFLVsPlantSection,
  missingCityIdCount,
  flMismatchCount,
  typoCityCount = 0,
  onFixAllTypos,
  onOpenFuzzyModal,
  onFilterToDuplicate,
  onRepairHierarchy,
  module = 'ZFS01'
}) => {
  const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(true);
  const { totalRows, validRows, errorRows, repairedRows } = summary;
  const config = MODULE_CONFIGS[module];

  // Calculate percentage of valid rows
  const validPercent = totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0;

  // Issues count for review panel
  const totalReviewItems = 
    (summary.duplicateRows > 0 ? 1 : 0) +
    (summary.ruleStats.ruleHierarchyViolation > 0 ? 1 : 0) +
    (typoCityCount > 0 ? 1 : 0);

  const totalProblemPoints = 
    summary.duplicateRows + 
    summary.ruleStats.ruleHierarchyViolation + 
    typoCityCount;

  return (
    <div className="space-y-4">
      {/* 1. Four Clean Contextual Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Master Data */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="text-xs font-medium text-slate-500">
            Total master data
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {totalRows}
            </span>
            <span className="text-xs text-slate-400">baris</span>
          </div>
        </div>

        {/* Card 2: Data Valid with Progress Bar */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="text-xs font-medium text-slate-500">
            Data valid
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                {validRows}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {totalRows}</span>
            </div>
            {/* Horizontal Green Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2.5">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${validPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Perlu Perbaikan (Soft Rose Background for quick scanning) */}
        <div className={`border rounded-xl p-4 flex flex-col justify-between shadow-2xs transition-colors ${
          errorRows > 0
            ? 'bg-rose-50/70 border-rose-200/80'
            : 'bg-white border-slate-200/90'
        }`}>
          <div className={`text-xs font-semibold ${
            errorRows > 0 ? 'text-rose-700' : 'text-slate-500'
          }`}>
            Perlu perbaikan
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono tracking-tight ${
              errorRows > 0 ? 'text-rose-900' : 'text-slate-900'
            }`}>
              {errorRows}
            </span>
            <span className={`text-xs ${
              errorRows > 0 ? 'text-rose-400' : 'text-slate-400'
            }`}>
              baris
            </span>
          </div>
        </div>

        {/* Card 4: Telah Disinkronkan */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
          <div className="text-xs font-medium text-slate-500">
            Telah disinkronkan
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {repairedRows}
            </span>
            <span className="text-xs text-slate-400">baris</span>
          </div>
        </div>
      </div>

      {/* 2. Consolidated "Perlu Ditinjau" Panel (Collapsible) */}
      {totalReviewItems > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
          {/* Panel Header */}
          <div 
            onClick={() => setIsReviewPanelOpen(prev => !prev)}
            className="px-4 py-3 bg-amber-50/50 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-bold text-slate-900">
                {totalProblemPoints} hal perlu ditinjau sebelum migrasi
              </span>
              <span className="text-xs text-slate-500">
                · {totalReviewItems} jenis masalah
              </span>
            </div>

            <button
              type="button"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              <span>{isReviewPanelOpen ? 'Sembunyikan' : 'Tampilkan'}</span>
              {isReviewPanelOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Panel Content: 1 line per issue type with contextual action buttons */}
          {isReviewPanelOpen && (
            <div className="divide-y divide-slate-100 px-4">
              {/* Row 1: Duplikat Primary Key */}
              {summary.duplicateRows > 0 && (
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 shrink-0">
                      Duplikat
                    </span>
                    <span className="text-xs text-slate-700">
                      <strong>{summary.duplicateRows} baris</strong> memakai kode Primary Key sama · wajib unik di SAP PM
                    </span>
                  </div>
                  {onFilterToDuplicate && (
                    <button
                      onClick={onFilterToDuplicate}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                    >
                      Lihat baris
                    </button>
                  )}
                </div>
              )}

              {/* Row 2: Hierarchy Violation */}
              {summary.ruleStats.ruleHierarchyViolation > 0 && (
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 shrink-0">
                      Hierarki
                    </span>
                    <span className="text-xs text-slate-700">
                      <strong>{summary.ruleStats.ruleHierarchyViolation} baris</strong> Kolom A tidak diawali Superior FL · pemisah "-"
                    </span>
                  </div>
                  {onRepairHierarchy && (
                    <button
                      onClick={onRepairHierarchy}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                    >
                      Perbaiki otomatis
                    </button>
                  )}
                </div>
              )}

              {/* Row 3: Typo Kota (Fuzzy Matching) */}
              {typoCityCount > 0 && (
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-800 shrink-0">
                      Typo kota
                    </span>
                    <span className="text-xs text-slate-700">
                      <strong>{typoCityCount} baris</strong> nama kota mirip referensi {module === 'ZFS01' ? 'SNI' : 'LOV'} · Bigram + Levenshtein
                    </span>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {onOpenFuzzyModal && (
                      <button
                        onClick={onOpenFuzzyModal}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs cursor-pointer"
                      >
                        Perbedaan
                      </button>
                    )}
                    {onFixAllTypos && (
                      <button
                        onClick={onFixAllTypos}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-2xs cursor-pointer"
                      >
                        Perbaiki semua
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Alur Validasi Section (Numbered Circles, Clear Hierarchy) */}
      <div className="space-y-2.5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-900">
            Alur validasi
          </h2>
          <span className="text-xs text-slate-500">
            Jalankan berurutan · standar {config.code} · {config.totalReferenceCount} entri referensi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Step 1 Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Validasi Plan Section
                  </h3>
                </div>
                {missingCityIdCount > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-100 text-amber-800">
                    {missingCityIdCount} belum sync
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-100 text-emerald-800">
                    100% sync
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pl-7">
                Isi City ID (AH) dari master {module === 'ZFS01' ? 'SNI' : 'LOV'}, lalu sinkronkan H, F, I, J, K, AE.
              </p>
            </div>

            <div className="pt-2 pl-7">
              <button
                onClick={onValidatePlanSection}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Jalankan validasi 1</span>
              </button>
            </div>
          </div>

          {/* Step 2 Card */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between shadow-2xs space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-slate-300 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Validasi 3-digit vs Plan Section
                  </h3>
                </div>
                {flMismatchCount > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-100 text-rose-800">
                    {flMismatchCount} beda
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-100 text-emerald-800">
                    100% cocok
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed pl-7">
                Cocokkan digit 6-8 Kolom A dengan H; selaraskan D ke {config.superiorFormatSample}.
              </p>
            </div>

            <div className="pt-2 pl-7">
              <button
                onClick={onValidateFLVsPlantSection}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Play className="w-3 h-3 text-slate-500" />
                <span>Jalankan validasi 2</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
