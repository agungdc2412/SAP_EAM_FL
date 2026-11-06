import React from 'react';
import { ValidationSummary } from '../types/flTypes';
import { 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  KeyRound
} from 'lucide-react';

interface ValidationWorkflowBarProps {
  summary: ValidationSummary;
  onValidatePlanSection: () => void;
  onValidateFLVsPlantSection: () => void;
  missingCityIdCount: number;
  flMismatchCount: number;
  typoCityCount?: number;
  onFixAllTypos?: () => void;
  onOpenExportModal?: () => void;
}

export const ValidationWorkflowBar: React.FC<ValidationWorkflowBarProps> = ({
  summary,
  onValidatePlanSection,
  onValidateFLVsPlantSection,
  missingCityIdCount,
  flMismatchCount,
  typoCityCount = 0,
  onFixAllTypos,
  onOpenExportModal
}) => {
  const { totalRows, validRows, errorRows, repairedRows } = summary;

  return (
    <div className="space-y-4">
      {/* 1. Ultra-clean 4-Metric High-Level Counter Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Master Data
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
              {totalRows} <span className="text-xs font-normal text-slate-400">Baris</span>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-slate-700" />
            <span>Col A (PK)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Data Valid (Sesuai)
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 mt-0.5">
              {validRows} <span className="text-xs font-normal text-slate-400">/ {totalRows}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded font-semibold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Perlu Perbaikan
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-rose-600 mt-0.5">
              {errorRows} <span className="text-xs font-normal text-slate-400">Baris</span>
            </div>
          </div>
          {errorRows > 0 ? (
            <div className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2 py-1 rounded font-semibold border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Perlu Aksi</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Bersih</div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Telah Disinkronkan
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-blue-600 mt-0.5">
              {repairedRows} <span className="text-xs font-normal text-slate-400">Baris</span>
            </div>
          </div>
          <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded font-semibold border border-blue-200">
            Tersimpan
          </div>
        </div>
      </div>

      {/* Duplicate Alert Banner (if any duplicates exist) */}
      {summary.duplicateRows > 0 && (
        <div className="bg-rose-50 border border-rose-300 rounded-lg p-3 text-xs text-rose-900 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Perhatian:</strong> Terdeteksi <strong className="font-mono text-rose-950 font-bold">{summary.duplicateRows} baris</strong> dengan kode Primary Key (Kolom A) duplikat. Di SAP PM, kode FL wajib unik agar tidak ditolak saat migrasi.
            </span>
          </div>
          <span className="text-[11px] font-mono text-rose-800 bg-rose-100 px-2 py-0.5 rounded font-bold border border-rose-200 shrink-0">
            {summary.ruleStats.ruleDuplicatePk} Duplikasi
          </span>
        </div>
      )}

      {/* Fuzzy Typo Matching Banner (if typos detected) */}
      {typoCityCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span>
                <strong>Fuzzy Matching Aktif:</strong> Terdeteksi <strong className="font-mono text-amber-900 font-bold">{typoCityCount} baris</strong> typo penulisan nama kota di Kolom AB.
              </span>
              <span className="text-slate-600 ml-1">
                Algoritma Bigram & Levenshtein telah mencocokkan saran nama resmi dari LOV 111 kota.
              </span>
            </div>
          </div>
          {onFixAllTypos && (
            <button
              onClick={onFixAllTypos}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Perbaiki Semua Typo ({typoCityCount})</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Structured Two-Step Validation Center */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-2.5 mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Alur Validasi & Perbaikan Master Data
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jalankan Tombol 1 untuk menyinkronkan data wilayah dari LOV, kemudian jalankan Tombol 2 untuk mencocokkan kode dengan Primary Key Kolom A.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span>Standar Blueprint: <strong>ZFS04</strong></span>
            <span>·</span>
            <span>Referensi: <strong>111 Kota</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* STEP 1 CARD */}
          <div className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  LANGKAH 1
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  missingCityIdCount > 0
                    ? 'text-amber-800 bg-amber-50 border border-amber-200'
                    : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                }`}>
                  {missingCityIdCount > 0 ? `${missingCityIdCount} belum sync` : '100% Terisi'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Validate Plan Section
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Generate City ID dari <strong>Kolom AB (City Name)</strong> ke <strong>Kolom baru AH</strong>, lalu otomatis isi <strong>Plan Section (H)</strong>, <strong>Plant (F & I)</strong>, <strong>Work Center (J)</strong>, <strong>Cost Center (K)</strong>, dan <strong>Country (AE)</strong> = ID.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Kolom A (PK) tidak disentuh
              </span>
              <button
                onClick={onValidatePlanSection}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Jalankan Validasi 1</span>
              </button>
            </div>
          </div>

          {/* STEP 2 CARD */}
          <div className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                  LANGKAH 2
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold ${
                  flMismatchCount > 0
                    ? 'text-rose-800 bg-rose-50 border border-rose-200'
                    : 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                }`}>
                  {flMismatchCount > 0 ? `${flMismatchCount} baris beda` : '100% Cocok'}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Validate FL 3-Digit vs Plan Section
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Cek apakah 3 karakter pada posisi <strong>digit 6-8 Kolom A (FL)</strong> sudah sama persis dengan <strong>Kolom H (Plan Section)</strong>. Jika ada selisih, Kolom H disamakan dengan Kolom A tanpa mengubah Kolom A.
                </p>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500">
                Cocokkan Kolom H dengan Kolom A
              </span>
              <button
                onClick={onValidateFLVsPlantSection}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Jalankan Validasi 2</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
