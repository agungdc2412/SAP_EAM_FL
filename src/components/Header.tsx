import React from 'react';
import { 
  FileSpreadsheet, 
  ShieldAlert, 
  Database, 
  BookOpen, 
  Download, 
  Upload, 
  RotateCcw,
  CheckCircle2,
  Layers,
  Sparkles
} from 'lucide-react';
import { FunclocModule, MODULE_CONFIGS } from '../types/flTypes';

interface HeaderProps {
  activeTab: 'validator' | 'scanning' | 'lov' | 'docs';
  setActiveTab: (tab: 'validator' | 'scanning' | 'lov' | 'docs') => void;
  onOpenExportModal: () => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  hasData: boolean;
  totalErrors: number;
  currentModule: FunclocModule;
  onChangeModule: (module: FunclocModule) => void;
  onOpenFuzzyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExportModal,
  onOpenUpload,
  onLoadSample,
  hasData,
  totalErrors,
  currentModule,
  onChangeModule,
  onOpenFuzzyModal
}) => {
  const activeConfig = MODULE_CONFIGS[currentModule];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 w-full min-w-0">
          {/* Zone 1: Brand & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              FL
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Validasi Master Data FL
              </div>
              <div className="hidden xl:block text-[10px] text-slate-500 whitespace-nowrap leading-none mt-0.5">
                Tools Migrasi SAP PM · Primary Key Kolom A
              </div>
            </div>
          </div>

          {/* Zone 2: Module Switcher (ZFS01-NBB vs ZFS04-OSP/BB) & Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Module Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                onClick={() => onChangeModule('ZFS01')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currentModule === 'ZFS01'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Modul ZFS01 Non-Broadband (Format: Plant-CityID-RunningID, Sup: Lev 2)"
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span>ZFS01-NBB</span>
              </button>
              <button
                onClick={() => onChangeModule('ZFS04')}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  currentModule === 'ZFS04'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Modul ZFS04 OSP/Broadband (Format: Plant-CityID-Pole-HomeID, Sup: Lev 3)"
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span>ZFS04-OSP/BB</span>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveTab('validator')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'validator'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                <span>Lembar Kerja</span>
              </button>

              <button
                onClick={() => setActiveTab('scanning')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'scanning'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                <span>Daftar Masalah</span>
                {totalErrors > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-mono font-bold">
                    {totalErrors}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('lov')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'lov'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {currentModule === 'ZFS01' ? 'Referensi SNI' : 'Referensi LOV'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1 rounded">
                  {currentModule === 'ZFS01' ? '424' : '111'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('docs')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'docs'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Panduan</span>
              </button>
            </nav>
          </div>

          {/* Zone 3: Essential Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Upload file CSV atau Excel"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Impor</span>
            </button>

            <button
              onClick={onLoadSample}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Muat data sampel contoh"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sampel</span>
            </button>

            {/* Download / Export Button: Compact, Clean, Never Stretches */}
            <button
              onClick={onOpenExportModal}
              disabled={!hasData}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                hasData
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Pilih opsi ekspor: Data Bersih Siap SAP, Data Bermasalah Feedback Vendor, Semua Data, atau Laporan Audit (;)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor (;)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
