import React from 'react';
import { FLRowRecord } from '../types/flTypes';
import { 
  exportToDelimitedCSV, 
  exportCleanRecordsCSV, 
  exportErrorRecordsCSV, 
  exportErrorReportCSV 
} from '../services/csvService';
import { 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  X, 
  FileCheck,
  ShieldAlert,
  Info
} from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: FLRowRecord[];
  onShowToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  records,
  onShowToast
}) => {
  if (!isOpen) return null;

  const totalCount = records.length;
  const cleanCount = records.filter(r => !r.hasErrors && !r.isDuplicatePk).length;
  const errorCount = records.filter(r => r.hasErrors || r.isDuplicatePk).length;
  const totalIssuesCount = records.reduce((acc, r) => acc + r.issues.length, 0);

  const handleExportClean = () => {
    if (cleanCount === 0) {
      onShowToast('Tidak ada data bersih (semua baris masih memiliki masalah atau duplikasi).', 'warning');
      return;
    }
    const count = exportCleanRecordsCSV(records, 'Master_Data_FL_SAP_BERSIH_SIAP_UPLOAD.csv');
    onShowToast(`Berhasil mengekspor ${count} baris data bersih siap upload SAP (CSV ;).`, 'success');
    onClose();
  };

  const handleExportErrors = () => {
    if (errorCount === 0) {
      onShowToast('Hebat! Tidak ada data bermasalah. Seluruh data sudah valid.', 'info');
      return;
    }
    const count = exportErrorRecordsCSV(records, 'Master_Data_FL_BERMASALAH_FEEDBACK_VENDOR.csv');
    onShowToast(`Berhasil mengekspor ${count} baris data bermasalah untuk feedback vendor (CSV ;).`, 'warning');
    onClose();
  };

  const handleExportAll = () => {
    exportToDelimitedCSV(records, 'Master_Data_Functional_Location_SEMUA_DATA.csv');
    onShowToast(`Berhasil mengekspor seluruh ${totalCount} baris master data (CSV ;).`, 'success');
    onClose();
  };

  const handleExportAudit = () => {
    exportErrorReportCSV(records, 'Laporan_Audit_Temuan_Validasi_FL.csv');
    onShowToast(`Laporan audit temuan (${totalIssuesCount} temuan) berhasil diunduh (CSV ;).`, 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Opsi Ekspor Terpisah (CSV Delimiter ;)
              </h2>
              <p className="text-xs text-slate-500">
                Pilih format keluaran data migrasi sesuai peruntukan stakeholder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Format Notice */}
          <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              Seluruh file diekspor menggunakan <strong>delimiter titik koma (;)</strong> dan <strong>UTF-8 BOM</strong> agar langsung terbuka rapi dan terpisah kolomnya di Microsoft Excel versi Indonesia tanpa konfigurasi wizard teks.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Opsi 1: Data Bersih Siap Upload SAP */}
            <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    1. Data Bersih (Siap Upload SAP)
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                    {cleanCount} Baris Valid
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-2">
                  Hanya berisi baris yang 100% lolos validasi blueprint SAP, bebas error, dan bebas duplikasi Kolom A. Dilengkapi Kolom AH (City ID). Siap untuk LSMW/BAPI.
                </p>
              </div>
              <button
                onClick={handleExportClean}
                disabled={cleanCount === 0}
                className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Bersih (;)</span>
              </button>
            </div>

            {/* Opsi 2: Data Bermasalah & Duplikat (Feedback Vendor) */}
            <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs font-bold text-slate-900">
                    2. Data Bermasalah & Duplikat (Feedback Lapangan)
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                    errorCount > 0
                      ? 'bg-rose-100 text-rose-900 border-rose-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {errorCount} Baris Masalah
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-2">
                  Hanya mengekspor baris-baris data yang bermasalah atau memiliki Primary Key ganda. Berkas ini dikirimkan kembali ke vendor atau tim survei lapangan untuk perbaikan.
                </p>
              </div>
              <button
                onClick={handleExportErrors}
                disabled={errorCount === 0}
                className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Masalah (;)</span>
              </button>
            </div>

            {/* Opsi 3: Semua Data Master */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-bold text-slate-900">
                    3. Semua Data Master (Master Sheet)
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-200 text-slate-800 rounded">
                    {totalCount} Total Baris
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-2">
                  Mengekspor seluruh baris data dalam kondisi olahan terkini (termasuk hasil perbaikan sinkronisasi dan penambahan Kolom AH).
                </p>
              </div>
              <button
                onClick={handleExportAll}
                className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-700" />
                <span>Unduh Semua (;)</span>
              </button>
            </div>

            {/* Opsi 4: Laporan Audit Temuan */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  <h3 className="text-xs font-bold text-slate-900">
                    4. Laporan Rekapitulasi Audit Temuan
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded border border-blue-200">
                    {totalIssuesCount} Isu Temuan
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pr-2">
                  Tabel log rinci berisi: Nomor Baris, Nama & Huruf Kolom, Kode Aturan SAP, Tingkat Keparahan, Nilai Saat Ini, dan Saran Nilai Otomatis.
                </p>
              </div>
              <button
                onClick={handleExportAudit}
                className="px-3.5 py-2 text-xs font-bold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-700" />
                <span>Unduh Log Audit (;)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            SAP PM Master Data Migration · Primary Key Kolom A
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
