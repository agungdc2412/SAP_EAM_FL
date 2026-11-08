import React from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw
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
  onChangeModule
}) => {
  const activeConfig = MODULE_CONFIGS[currentModule];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Brand & Top Action Buttons */}
        <div className="flex items-center justify-between h-14 border-b border-slate-100">
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
              FL
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900">
                Validasi master data FL
              </div>
              <div className="text-[11px] text-slate-400 leading-none mt-0.5">
                Migrasi SAP PM · Primary key Kolom A
              </div>
            </div>
          </div>

          {/* Right: Core File Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUpload}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Upload file CSV atau Excel"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Impor</span>
            </button>

            <button
              onClick={onLoadSample}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Muat data sampel contoh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Sampel</span>
            </button>

            <button
              onClick={onOpenExportModal}
              disabled={!hasData}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0 ${
                hasData
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
              title="Ekspor CSV delimitasi titik koma (;)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Module Switcher (Segmented Control) + Underline Nav Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 h-auto sm:h-12 py-2 sm:py-0">
          {/* Left: Module Switcher Segmented Control */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => onChangeModule('ZFS01')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                currentModule === 'ZFS01'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ZFS01-NBB
            </button>
            <button
              onClick={() => onChangeModule('ZFS04')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                currentModule === 'ZFS04'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ZFS04-OSP/BB
            </button>
          </div>

          {/* Right: Clean Underline Navigation Tabs */}
          <nav className="flex items-center gap-5 text-xs font-medium overflow-x-auto min-w-0">
            <button
              onClick={() => setActiveTab('validator')}
              className={`py-3 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'validator'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Lembar kerja
            </button>

            <button
              onClick={() => setActiveTab('scanning')}
              className={`py-3 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer border-b-2 ${
                activeTab === 'scanning'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Daftar masalah</span>
              {totalErrors > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                  {totalErrors}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('lov')}
              className={`py-3 transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer border-b-2 ${
                activeTab === 'lov'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>
                {currentModule === 'ZFS01' ? 'Referensi SNI 424' : 'Referensi LOV 111'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`py-3 transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === 'docs'
                  ? 'border-slate-900 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Panduan
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
