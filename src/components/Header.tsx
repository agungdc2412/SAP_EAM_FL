import React from 'react';
import { 
  FileSpreadsheet, 
  ShieldAlert, 
  Database, 
  BookOpen, 
  Download, 
  Upload, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'validator' | 'scanning' | 'lov' | 'docs';
  setActiveTab: (tab: 'validator' | 'scanning' | 'lov' | 'docs') => void;
  onOpenExportModal: () => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  hasData: boolean;
  totalErrors: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
  onOpenUpload,
  onLoadSample,
  hasData,
  totalErrors
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand & Subtitle */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
              FL
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Validasi Master Data FL
              </div>
              <div className="text-[11px] text-slate-500 whitespace-nowrap">
                Tools Migrasi SAP PM · Primary Key Kolom A
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Clean & Single Line) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('validator')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'validator'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Lembar Kerja Validasi</span>
            </button>

            <button
              onClick={() => setActiveTab('scanning')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'scanning'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Daftar Temuan Masalah</span>
              {totalErrors > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono">
                  {totalErrors}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('lov')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'lov'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Referensi LOV (111 Kota)</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Panduan Struktur</span>
            </button>
          </nav>

          {/* Zone 3: Essential Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              title="Upload file CSV atau Excel"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Impor File</span>
            </button>

            <button
              onClick={onLoadSample}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Muat data sampel contoh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sampel</span>
            </button>

            <button
              onClick={onOpenExportModal}
              disabled={!hasData}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                hasData
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Pilih opsi ekspor: Data Bersih Siap SAP, Data Bermasalah Feedback Vendor, Semua Data, atau Laporan Audit (;)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Opsi Ekspor (;)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
