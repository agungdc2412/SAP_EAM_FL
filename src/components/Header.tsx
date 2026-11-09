import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw,
  Building2,
  Cpu,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Database,
  Layers,
  Menu,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { FunclocModule, MODULE_CONFIGS } from '../types/flTypes';
import { EAMDomain, EAMOperationMode, EquipmentCategory, EQUIPMENT_CONFIGS } from '../types/eamTypes';

interface HeaderProps {
  activeDomain: EAMDomain;
  onChangeDomain: (domain: EAMDomain) => void;
  operationMode: EAMOperationMode;
  onChangeOperationMode: (mode: EAMOperationMode) => void;
  // FL Props
  currentModule: FunclocModule;
  onChangeModule: (module: FunclocModule) => void;
  activeTab: 'validator' | 'scanning' | 'lov' | 'docs';
  setActiveTab: (tab: 'validator' | 'scanning' | 'lov' | 'docs') => void;
  totalErrors: number;
  // Equipment Props
  currentEquipmentCategory: EquipmentCategory;
  onChangeEquipmentCategory: (cat: EquipmentCategory) => void;
  // File Actions
  onOpenExportModal: () => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeDomain,
  onChangeDomain,
  operationMode,
  onChangeOperationMode,
  currentModule,
  onChangeModule,
  activeTab,
  setActiveTab,
  totalErrors,
  currentEquipmentCategory,
  onChangeEquipmentCategory,
  onOpenExportModal,
  onOpenUpload,
  onLoadSample,
  hasData
}) => {
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<'fl' | 'equipment' | 'ref' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (menu: 'fl' | 'equipment' | 'ref') => {
    setOpenDropdown(prev => prev === menu ? null : menu);
  };

  const handleSelectFL = (module: FunclocModule, mode?: EAMOperationMode) => {
    onChangeDomain('functional_location');
    onChangeModule(module);
    if (mode) {
      onChangeOperationMode(mode);
    }
    if (mode === 'validate') {
      setActiveTab('validator');
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleSelectEquipment = (category: EquipmentCategory, mode?: EAMOperationMode) => {
    onChangeDomain('equipment');
    onChangeEquipmentCategory(category);
    if (mode) {
      onChangeOperationMode(mode);
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleSelectRef = (type: 'sni' | 'lov' | 'docs') => {
    onChangeDomain('functional_location');
    onChangeOperationMode('validate');
    if (type === 'sni') {
      onChangeModule('ZFS01');
      setActiveTab('lov');
    } else if (type === 'lov') {
      onChangeModule('ZFS04');
      setActiveTab('lov');
    } else {
      setActiveTab('docs');
    }
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <header ref={navRef} className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navigation Bar */}
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand Identity & Master Navigation Menus */}
          <div className="flex items-center gap-6">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
                EAM
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold tracking-tight text-slate-900 leading-tight">
                  SAP EAM Migration Suite
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  Tools Migrasi Master Data SAP PM
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links with Dropdowns */}
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-semibold">
              {/* Menu 1: Functional Location Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('fl')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDomain === 'functional_location'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Functional Location</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'fl' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'fl' && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Modul Functional Location (FL)
                    </div>

                    {/* ZFS01 */}
                    <div className="px-2 py-1">
                      <div className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>ZFS01 - Non Broadband</span>
                            {activeDomain === 'functional_location' && currentModule === 'ZFS01' && (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            SNI 424
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Format: SubregionID-CityID-RunningNumber
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            onClick={() => handleSelectFL('ZFS01', 'validate')}
                            className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                              activeDomain === 'functional_location' && currentModule === 'ZFS01' && operationMode === 'validate'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Validasi
                          </button>
                          <button
                            onClick={() => handleSelectFL('ZFS01', 'generate')}
                            className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                              activeDomain === 'functional_location' && currentModule === 'ZFS01' && operationMode === 'generate'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>

                    {/* ZFS04 */}
                    <div className="px-2 py-1">
                      <div className="p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span>ZFS04 - Broadband / OSP</span>
                            {activeDomain === 'functional_location' && currentModule === 'ZFS04' && (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                            LOV 111
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Format: SubregionID-CityID-Pole-HomeID
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <button
                            onClick={() => handleSelectFL('ZFS04', 'validate')}
                            className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                              activeDomain === 'functional_location' && currentModule === 'ZFS04' && operationMode === 'validate'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Validasi
                          </button>
                          <button
                            onClick={() => handleSelectFL('ZFS04', 'generate')}
                            className={`px-2 py-1 text-[11px] rounded font-medium cursor-pointer transition-colors ${
                              activeDomain === 'functional_location' && currentModule === 'ZFS04' && operationMode === 'generate'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu 2: Equipment Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('equipment')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeDomain === 'equipment'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Equipment</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'equipment' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'equipment' && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Modul Equipment SAP PM (5 Kategori)
                    </div>

                    <div className="divide-y divide-slate-100">
                      {(Object.keys(EQUIPMENT_CONFIGS) as EquipmentCategory[]).map(catKey => {
                        const cfg = EQUIPMENT_CONFIGS[catKey];
                        const isSelected = activeDomain === 'equipment' && currentEquipmentCategory === catKey;

                        return (
                          <div key={catKey} className="p-2 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded bg-slate-100 text-slate-800 text-[10px] font-mono font-bold flex items-center justify-center">
                                  {cfg.sapCategoryCode}
                                </span>
                                <span>{cfg.name.split('(')[0].trim()}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {cfg.standardPrefix}
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <button
                                onClick={() => handleSelectEquipment(catKey, 'validate')}
                                className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer transition-colors ${
                                  isSelected && operationMode === 'validate'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                Validasi
                              </button>
                              <button
                                onClick={() => handleSelectEquipment(catKey, 'generate')}
                                className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer transition-colors ${
                                  isSelected && operationMode === 'generate'
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                Generate
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Menu 3: Referensi & Bantuan Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('ref')}
                  className="px-3 py-1.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span>Referensi & Standar</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'ref' ? 'rotate-180' : ''}`} />
                </button>

                {openDropdown === 'ref' && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <button
                      onClick={() => handleSelectRef('sni')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">SNI Master Database</div>
                        <div className="text-[10px] text-slate-400">424 Kota/Kabupaten untuk ZFS01</div>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                        424
                      </span>
                    </button>

                    <button
                      onClick={() => handleSelectRef('lov')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">LOV Master Database</div>
                        <div className="text-[10px] text-slate-400">111 Kota Homepass untuk ZFS04</div>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-600">
                        111
                      </span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => handleSelectRef('docs')}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <div>
                        <div className="font-semibold text-slate-900">Panduan Hierarki SAP PM</div>
                        <div className="text-[10px] text-slate-400">Aturan Kolom A vs Kolom D</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right: Mode Switcher & Core Actions */}
          <div className="flex items-center gap-2">
            {/* Inline Mode Switcher (Validasi vs Generate) */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => onChangeOperationMode('validate')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  operationMode === 'validate'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke mode validasi data"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Validasi</span>
              </button>
              <button
                onClick={() => onChangeOperationMode('generate')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  operationMode === 'generate'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Beralih ke mode generate master data baru"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Generate</span>
              </button>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            {/* Quick Actions: Impor, Sampel, Ekspor */}
            {activeDomain === 'functional_location' && (
              <button
                onClick={onOpenUpload}
                className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Impor file CSV atau Excel"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Impor</span>
              </button>
            )}

            <button
              onClick={onLoadSample}
              className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Muat data sampel contoh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sampel</span>
            </button>

            {activeDomain === 'functional_location' && (
              <button
                onClick={onOpenExportModal}
                disabled={!hasData}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                  hasData
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
                title="Ekspor CSV delimitasi titik koma (;)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor (;)</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Secondary Context Bar: Shows active path & sub-navigation tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 border-t border-slate-100 text-xs">
          {/* Breadcrumb / Active Context Indicator */}
          <div className="flex items-center gap-2 text-slate-500 font-medium overflow-x-auto scrollbar-none py-0.5">
            <span className="text-slate-400">Modul:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1">
              {activeDomain === 'functional_location' ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-slate-700" />
                  <span>Functional Location</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-700">{MODULE_CONFIGS[currentModule].code}</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-slate-700" />
                  <span>Equipment</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-700">{EQUIPMENT_CONFIGS[currentEquipmentCategory].name}</span>
                </>
              )}
            </span>

            <span className="text-slate-300">·</span>

            {/* Mode Tag */}
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
              operationMode === 'validate' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {operationMode === 'validate' ? 'Mode Validasi' : 'Mode Generator'}
            </span>
          </div>

          {/* Contextual Subtabs (if Functional Location & Validate) */}
          {activeDomain === 'functional_location' && operationMode === 'validate' && (
            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                onClick={() => setActiveTab('validator')}
                className={`py-1 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'validator'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Lembar kerja
              </button>

              <button
                onClick={() => setActiveTab('scanning')}
                className={`py-1 transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
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
                className={`py-1 transition-colors flex items-center gap-1 cursor-pointer border-b-2 ${
                  activeTab === 'lov'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>
                  {currentModule === 'ZFS01' ? 'Referensi SNI' : 'Referensi LOV'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('docs')}
                className={`py-1 transition-colors cursor-pointer border-b-2 ${
                  activeTab === 'docs'
                    ? 'border-slate-900 text-slate-900 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Panduan
              </button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Functional Location
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelectFL('ZFS01')}
                  className={`p-2 text-xs rounded-lg font-semibold text-left border ${
                    activeDomain === 'functional_location' && currentModule === 'ZFS01'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ZFS01 - Non Broadband
                </button>
                <button
                  onClick={() => handleSelectFL('ZFS04')}
                  className={`p-2 text-xs rounded-lg font-semibold text-left border ${
                    activeDomain === 'functional_location' && currentModule === 'ZFS04'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ZFS04 - Broadband/OSP
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Equipment
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(EQUIPMENT_CONFIGS) as EquipmentCategory[]).map(catKey => {
                  const cfg = EQUIPMENT_CONFIGS[catKey];
                  const isSelected = activeDomain === 'equipment' && currentEquipmentCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      onClick={() => handleSelectEquipment(catKey)}
                      className={`p-2 text-xs rounded-lg font-semibold text-left border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cfg.name.split('(')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Mode Operasi
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onChangeOperationMode('validate'); setMobileMenuOpen(false); }}
                  className={`p-2 text-xs rounded-lg font-semibold border ${
                    operationMode === 'validate'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ✓ Validasi Data
                </button>
                <button
                  onClick={() => { onChangeOperationMode('generate'); setMobileMenuOpen(false); }}
                  className={`p-2 text-xs rounded-lg font-semibold border ${
                    operationMode === 'generate'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  ⚡ Generate Master Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
