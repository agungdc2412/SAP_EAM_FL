import React, { useState, useMemo } from 'react';
import { 
  Cable, 
  Milestone, 
  Radio, 
  Box, 
  GitFork, 
  Search, 
  Download, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Layers, 
  Copy, 
  Eye, 
  Settings2,
  FileSpreadsheet,
  Upload
} from 'lucide-react';
import { 
  EquipmentCategory, 
  EquipmentRecord, 
  EquipmentRowData, 
  EQUIPMENT_CONFIGS, 
  EAMOperationMode 
} from '../types/eamTypes';
import { getSampleEquipmentRecords } from '../data/equipmentSampleDataset';

interface EquipmentWorkspaceProps {
  currentCategory: EquipmentCategory;
  onChangeCategory: (cat: EquipmentCategory) => void;
  operationMode: EAMOperationMode;
  onChangeOperationMode: (mode: EAMOperationMode) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const EquipmentWorkspace: React.FC<EquipmentWorkspaceProps> = ({
  currentCategory,
  onChangeCategory,
  operationMode,
  onChangeOperationMode,
  onShowToast
}) => {
  // Equipment records state by category
  const [equipmentStore, setEquipmentStore] = useState<Record<EquipmentCategory, EquipmentRecord[]>>(() => ({
    cable: getSampleEquipmentRecords('cable'),
    pole_manhole: getSampleEquipmentRecords('pole_manhole'),
    dpfo: getSampleEquipmentRecords('dpfo'),
    jointbox: getSampleEquipmentRecords('jointbox'),
    splitter: getSampleEquipmentRecords('splitter')
  }));

  // Active records for current category
  const activeRecords = equipmentStore[currentCategory] || [];

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ERROR' | 'VALID' | 'REPAIRED'>('ALL');

  // Generator Form state
  const currentConfig = EQUIPMENT_CONFIGS[currentCategory];
  const [genQuantity, setGenQuantity] = useState(10);
  const [genInstallationFl, setGenInstallationFl] = useState(currentConfig.defaultSuperiorFlPrefix);
  const [genPrefix, setGenPrefix] = useState(`EQ-${currentConfig.standardPrefix}-1011-`);
  const [genStartSeq, setGenStartSeq] = useState(1);
  const [genSpec, setGenSpec] = useState(currentConfig.specDefault);
  const [genManufacturer, setGenManufacturer] = useState('Fiberhome');
  const [genWorkCenter, setGenWorkCenter] = useState('1011FOP1');
  const [genCostCenter, setGenCostCenter] = useState('101OP02');
  const [genPlant, setGenPlant] = useState('1011');
  const [genBaseLat, setGenBaseLat] = useState('-0.982145');
  const [genBaseLong, setGenBaseLong] = useState('100.612034');
  const [generatedPreviewRows, setGeneratedPreviewRows] = useState<EquipmentRowData[]>([]);

  // Update category when user switches tab
  const handleSelectCategory = (cat: EquipmentCategory) => {
    onChangeCategory(cat);
    const cfg = EQUIPMENT_CONFIGS[cat];
    setGenPrefix(`EQ-${cfg.standardPrefix}-1011-`);
    setGenInstallationFl(cfg.defaultSuperiorFlPrefix);
    setGenSpec(cfg.specDefault);
  };

  // Inline cell edit handler
  const handleCellEdit = (recordId: string, field: keyof EquipmentRowData, value: string) => {
    setEquipmentStore(prev => {
      const currentList = prev[currentCategory] || [];
      const updatedList = currentList.map(rec => {
        if (rec.id !== recordId) return rec;

        const updatedData = { ...rec.data, [field]: value };
        const issues = [...rec.issues];

        // Re-check inverted coordinate if latLong edited
        if (field === 'latLong') {
          const coordIssueIndex = issues.findIndex(i => i.rule === 'RULE_INVERTED_COORDINATE');
          if (value.startsWith('100.')) {
            if (coordIssueIndex === -1) {
              issues.push({
                id: `coord_${Date.now()}`,
                field: 'latLong',
                rule: 'RULE_INVERTED_COORDINATE',
                severity: 'error',
                message: 'Koordinat terbalik! Format wajib Latitude,Longitude (-0.801322,100.651200).',
                suggestedFix: '-0.801322,100.651200',
                canAutoFix: true
              });
            }
          } else if (coordIssueIndex !== -1) {
            issues.splice(coordIssueIndex, 1);
          }
        }

        return {
          ...rec,
          data: updatedData,
          issues,
          hasErrors: issues.some(i => i.severity === 'error') || rec.isDuplicatePk,
          isRepaired: true
        };
      });

      return { ...prev, [currentCategory]: updatedList };
    });
    onShowToast(`Baris equipment berhasil diperbarui.`);
  };

  // Quick Fix: Invert Inverted Coordinates
  const handleFixInvertedCoordinates = (record: EquipmentRecord) => {
    const latLong = record.data.latLong || '';
    const parts = latLong.split(',').map(s => s.trim());
    if (parts.length === 2) {
      const fixed = `${parts[1]},${parts[0]}`;
      handleCellEdit(record.id, 'latLong', fixed);
      onShowToast(`Koordinat diperbaiki menjadi: ${fixed}`, 'success');
    }
  };

  // Batch Quick Fix: Invert all reversed coordinates
  const handleFixAllInvertedCoordinates = () => {
    let count = 0;
    setEquipmentStore(prev => {
      const currentList = prev[currentCategory] || [];
      const updatedList = currentList.map(rec => {
        const coordIssue = rec.issues.find(i => i.rule === 'RULE_INVERTED_COORDINATE');
        if (coordIssue) {
          count++;
          const parts = rec.data.latLong.split(',').map(s => s.trim());
          const fixed = parts.length === 2 ? `${parts[1]},${parts[0]}` : rec.data.latLong;
          const newIssues = rec.issues.filter(i => i.rule !== 'RULE_INVERTED_COORDINATE');
          return {
            ...rec,
            data: { ...rec.data, latLong: fixed },
            issues: newIssues,
            hasErrors: newIssues.some(i => i.severity === 'error') || rec.isDuplicatePk,
            isRepaired: true
          };
        }
        return rec;
      });
      return { ...prev, [currentCategory]: updatedList };
    });

    if (count > 0) {
      onShowToast(`Berhasil memperbaiki ${count} baris koordinat terbalik.`, 'success');
    } else {
      onShowToast('Tidak ada koordinat terbalik yang perlu diperbaiki.', 'info');
    }
  };

  // Reload Category Sample Data
  const handleReloadSample = () => {
    setEquipmentStore(prev => ({
      ...prev,
      [currentCategory]: getSampleEquipmentRecords(currentCategory)
    }));
    onShowToast(`Data sampel ${currentConfig.name} berhasil dimuat ulang.`);
  };

  // Execute Batch Generate Equipment
  const handleGenerateBatch = () => {
    const rows: EquipmentRowData[] = [];
    const cfg = EQUIPMENT_CONFIGS[currentCategory];

    for (let i = 0; i < genQuantity; i++) {
      const seq = String(genStartSeq + i).padStart(6, '0');
      const eqNum = `${genPrefix}${seq}`;
      const latFloat = parseFloat(genBaseLat) + (i * 0.00015);
      const longFloat = parseFloat(genBaseLong) + (i * 0.00012);
      const latLongStr = `${latFloat.toFixed(6)},${longFloat.toFixed(6)}`;

      rows.push({
        equipmentNumber: eqNum,
        category: cfg.sapCategoryCode,
        description: `${cfg.name.split('(')[0].trim()} ${genSpec} - Unit ${i + 1}`,
        functionalLocation: genInstallationFl,
        technicalIdentNo: `TID-${cfg.standardPrefix}-${seq.slice(-4)}`,
        maintPlant: genPlant,
        planningPlant: genPlant,
        workCenter: genWorkCenter,
        costCenter: genCostCenter,
        manufacturer: genManufacturer,
        modelNumber: genSpec,
        startupDate: '01.08.2026',
        latLong: latLongStr,
        inventoryNo: `INV-${cfg.standardPrefix}-${seq.slice(-4)}`,
        status: 'AVBL'
      });
    }

    setGeneratedPreviewRows(rows);
    onShowToast(`Berhasil men-generate ${rows.length} master data equipment ${cfg.name}.`, 'success');
  };

  // Move generated rows to active validation list
  const handleTransferToActiveList = () => {
    if (generatedPreviewRows.length === 0) return;

    const newRecords: EquipmentRecord[] = generatedPreviewRows.map((data, idx) => ({
      id: `eq_gen_${currentCategory}_${Date.now()}_${idx}`,
      rowIndex: (activeRecords.length) + idx + 1,
      data: { ...data },
      originalData: { ...data },
      category: currentCategory,
      issues: [],
      hasErrors: false,
      hasWarnings: false,
      isDuplicatePk: false,
      isRepaired: false
    }));

    setEquipmentStore(prev => ({
      ...prev,
      [currentCategory]: [...prev[currentCategory], ...newRecords]
    }));

    setGeneratedPreviewRows([]);
    onChangeOperationMode('validate');
    onShowToast(`${newRecords.length} baris equipment telah ditambahkan ke Lembar Kerja Validasi.`, 'success');
  };

  // Download Semicolon Delimited CSV for Equipment
  const handleDownloadCsv = (rowsToExport: EquipmentRowData[], filenameSuffix: string) => {
    if (rowsToExport.length === 0) return;

    const headers = [
      'Equipment',
      'Category (EQTYP)',
      'Description',
      'Functional Location (TPLNR)',
      'Technical Ident No (TIDNR)',
      'Maint. Plant',
      'Planning Plant',
      'Work Center',
      'Cost Center',
      'Manufacturer',
      'Model Number',
      'Start-up Date',
      'Latitude and Longitude',
      'Inventory No',
      'Status'
    ];

    const lines = rowsToExport.map(r => [
      r.equipmentNumber,
      r.category,
      r.description,
      r.functionalLocation,
      r.technicalIdentNo,
      r.maintPlant,
      r.planningPlant,
      r.workCenter,
      r.costCenter,
      r.manufacturer,
      r.modelNumber,
      r.startupDate,
      r.latLong,
      r.inventoryNo,
      r.status
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...lines.map(row => row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Equipment_${currentCategory.toUpperCase()}_${filenameSuffix}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`File CSV Equipment (;) berhasil diunduh.`, 'success');
  };

  // Filtered rows for active validator
  const filteredRecords = useMemo(() => {
    return activeRecords.filter(r => {
      if (statusFilter === 'ERROR' && !r.hasErrors) return false;
      if (statusFilter === 'VALID' && (r.hasErrors || r.hasWarnings)) return false;
      if (statusFilter === 'REPAIRED' && !r.isRepaired) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          r.data.equipmentNumber.toLowerCase().includes(q) ||
          r.data.description.toLowerCase().includes(q) ||
          r.data.functionalLocation.toLowerCase().includes(q) ||
          r.data.technicalIdentNo.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeRecords, statusFilter, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = activeRecords.length;
    const errors = activeRecords.filter(r => r.hasErrors).length;
    const valid = activeRecords.filter(r => !r.hasErrors && !r.hasWarnings).length;
    const duplicates = activeRecords.filter(r => r.isDuplicatePk).length;
    const invertedCoords = activeRecords.filter(r => r.issues.some(i => i.rule === 'RULE_INVERTED_COORDINATE')).length;

    return { total, errors, valid, duplicates, invertedCoords };
  }, [activeRecords]);

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(Object.keys(EQUIPMENT_CONFIGS) as EquipmentCategory[]).map(catKey => {
              const cfg = EQUIPMENT_CONFIGS[catKey];
              const isSelected = currentCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => handleSelectCategory(catKey)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cfg.sapCategoryCode}
                  </span>
                  <span>{cfg.name.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>

          {/* Operation Mode Toggle: Validate vs Generate */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 self-start md:self-auto">
            <button
              onClick={() => onChangeOperationMode('validate')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                operationMode === 'validate'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Validasi Data</span>
            </button>
            <button
              onClick={() => onChangeOperationMode('generate')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                operationMode === 'generate'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Generate Master Data</span>
            </button>
          </div>
        </div>

        {/* Category Description Banner */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{currentConfig.name}</span>
            <span>·</span>
            <span>{currentConfig.description}</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500 shrink-0">
            SAP EQTYP: <span className="font-bold text-slate-800">'{currentConfig.sapCategoryCode}'</span> · Format: <span className="font-bold text-slate-800">{currentConfig.sampleCode}</span>
          </div>
        </div>
      </div>

      {/* MODE 1: VALIDATION WORKSPACE */}
      {operationMode === 'validate' && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Total Equipment
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">
                {summary.total} <span className="text-xs font-normal text-slate-500">Unit</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Data Valid
              </div>
              <div className="text-xl font-bold text-emerald-600 mt-1">
                {summary.valid} <span className="text-xs font-normal text-slate-500">/ {summary.total}</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${summary.total > 0 ? (summary.valid / summary.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className={`rounded-xl p-4 shadow-2xs border ${
              summary.errors > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
            }`}>
              <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                Perlu Perbaikan
              </div>
              <div className={`text-xl font-bold mt-1 ${summary.errors > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {summary.errors} <span className="text-xs font-normal text-slate-500">Unit</span>
              </div>
              {summary.duplicates > 0 && (
                <div className="text-[11px] text-rose-600 font-semibold mt-1">
                  {summary.duplicates} Duplikat Nomor EQ
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  Relasi Parent FL
                </div>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  Terkoneksi ke TPLNR (Col D)
                </div>
              </div>
              <div className="text-[10px] text-slate-400">
                Hierarki SAP PM Terverifikasi
              </div>
            </div>
          </div>

          {/* Quick Issue Action Banner (if inverted coordinates or duplicates detected) */}
          {summary.invertedCoords > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-xs text-amber-900 font-medium">
                  Terdeteksi <span className="font-bold">{summary.invertedCoords} baris koordinat terbalik</span> (Longitude di depan Latitude). Format wajib SAP EAM: Latitude,Longitude (-0.801322,100.651200).
                </div>
              </div>
              <button
                onClick={handleFixAllInvertedCoordinates}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-300" />
                <span>Perbaiki Semua Koordinat ({summary.invertedCoords})</span>
              </button>
            </div>
          )}

          {/* Toolbar: Filters & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Semua {activeRecords.length}
              </button>
              <button
                onClick={() => setStatusFilter('ERROR')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ERROR'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Bermasalah {summary.errors}
              </button>
              <button
                onClick={() => setStatusFilter('VALID')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === 'VALID'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Valid {summary.valid}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari Equipment / FL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-white w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <button
                onClick={handleReloadSample}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                title="Muat ulang data sampel"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDownloadCsv(activeRecords.map(r => r.data), 'Validasi')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor (;)</span>
              </button>
            </div>
          </div>

          {/* Equipment Table Grid */}
          <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto max-h-[520px] scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200 z-10">
                  <tr>
                    <th className="p-2.5 border-r border-slate-200 w-12 text-center">#</th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      Col A: Equipment (PK)
                    </th>
                    <th className="p-2.5 border-r border-slate-200 w-16 text-center">EQTYP</th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap min-w-[200px]">
                      Col C: Description
                    </th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap min-w-[220px]">
                      Col D: Installation FL (TPLNR)
                    </th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      Col E: Technical ID
                    </th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      Col F: Plant
                    </th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap">
                      Col J: Pabrikan
                    </th>
                    <th className="p-2.5 border-r border-slate-200 whitespace-nowrap min-w-[160px]">
                      Col M: Koordinat (Lat,Long)
                    </th>
                    <th className="p-2.5 whitespace-nowrap w-24 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredRecords.map((rec) => {
                    const coordIssue = rec.issues.find(i => i.rule === 'RULE_INVERTED_COORDINATE');

                    return (
                      <tr 
                        key={rec.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          rec.isDuplicatePk 
                            ? 'bg-rose-50/70' 
                            : coordIssue 
                            ? 'bg-amber-50/50' 
                            : ''
                        }`}
                      >
                        <td className="p-2 text-center text-slate-400 border-r border-slate-100 font-sans">
                          {rec.rowIndex}
                        </td>

                        {/* Equipment PK */}
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          <div>{rec.data.equipmentNumber}</div>
                          {rec.isDuplicatePk && (
                            <div className="text-[10px] text-rose-600 font-sans font-medium">
                              Duplikat Nomor EQ
                            </div>
                          )}
                        </td>

                        {/* EQTYP */}
                        <td className="p-2 text-center border-r border-slate-100">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                            {rec.data.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="p-2 font-sans text-slate-800 border-r border-slate-100">
                          <input
                            type="text"
                            value={rec.data.description}
                            onChange={(e) => handleCellEdit(rec.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none px-1 py-0.5 rounded"
                          />
                        </td>

                        {/* Installation FL (TPLNR) */}
                        <td className="p-2 text-blue-700 font-semibold border-r border-slate-100 whitespace-nowrap">
                          <input
                            type="text"
                            value={rec.data.functionalLocation}
                            onChange={(e) => handleCellEdit(rec.id, 'functionalLocation', e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-900 focus:bg-white focus:outline-none px-1 py-0.5 rounded"
                          />
                        </td>

                        {/* Technical ID */}
                        <td className="p-2 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                          {rec.data.technicalIdentNo}
                        </td>

                        {/* Plant */}
                        <td className="p-2 text-slate-600 border-r border-slate-100">
                          {rec.data.maintPlant}
                        </td>

                        {/* Manufacturer */}
                        <td className="p-2 font-sans text-slate-700 border-r border-slate-100 whitespace-nowrap">
                          {rec.data.manufacturer}
                        </td>

                        {/* Lat,Long */}
                        <td className="p-2 border-r border-slate-100 whitespace-nowrap">
                          <input
                            type="text"
                            value={rec.data.latLong}
                            onChange={(e) => handleCellEdit(rec.id, 'latLong', e.target.value)}
                            className={`w-full bg-transparent border-b px-1 py-0.5 rounded focus:outline-none ${
                              coordIssue 
                                ? 'border-amber-400 text-amber-800 bg-amber-100/50' 
                                : 'border-transparent hover:border-slate-300 focus:border-slate-900 focus:bg-white'
                            }`}
                          />
                          {coordIssue && (
                            <div className="text-[10px] text-amber-700 font-sans mt-0.5">
                              Koordinat terbalik
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-2 text-center whitespace-nowrap font-sans">
                          {coordIssue ? (
                            <button
                              onClick={() => handleFixInvertedCoordinates(rec)}
                              className="px-2 py-1 text-[10px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors cursor-pointer shadow-2xs"
                              title="Tukar urutan Longitude,Latitude menjadi Latitude,Longitude"
                            >
                              Tukar Lat/Long
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-400">Tervalidasi</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: GENERATE MASTER DATA WORKSPACE */}
      {operationMode === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generator Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
              <Settings2 className="w-4 h-4 text-slate-600" />
              <span>Parameter Generator {currentConfig.name.split('(')[0].trim()}</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Installation FL (TPLNR Induk)
                </label>
                <input
                  type="text"
                  value={genInstallationFl}
                  onChange={(e) => setGenInstallationFl(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Contoh: 1011-ARS-000000001"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Prefix Nomor EQ
                  </label>
                  <input
                    type="text"
                    value={genPrefix}
                    onChange={(e) => setGenPrefix(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Jumlah Generate
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={genQuantity}
                    onChange={(e) => setGenQuantity(parseInt(e.target.value) || 1)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  {currentConfig.specLabel}
                </label>
                <input
                  type="text"
                  value={genSpec}
                  onChange={(e) => setGenSpec(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Pabrikan / Merk
                  </label>
                  <input
                    type="text"
                    value={genManufacturer}
                    onChange={(e) => setGenManufacturer(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Plant (SWERK)
                  </label>
                  <input
                    type="text"
                    value={genPlant}
                    onChange={(e) => setGenPlant(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Work Center
                  </label>
                  <input
                    type="text"
                    value={genWorkCenter}
                    onChange={(e) => setGenWorkCenter(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Cost Center
                  </label>
                  <input
                    type="text"
                    value={genCostCenter}
                    onChange={(e) => setGenCostCenter(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Base Latitude
                  </label>
                  <input
                    type="text"
                    value={genBaseLat}
                    onChange={(e) => setGenBaseLat(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                    Base Longitude
                  </label>
                  <input
                    type="text"
                    value={genBaseLong}
                    onChange={(e) => setGenBaseLong(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={handleGenerateBatch}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Generate {genQuantity} Unit {currentConfig.name.split('(')[0].trim()}</span>
              </button>
            </div>
          </div>

          {/* Right Area: Preview Grid & Transfer Actions */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="text-sm font-bold text-slate-900">
                    Preview Master Data Equipment ({currentConfig.name.split('(')[0].trim()})
                  </div>
                  <div className="text-xs text-slate-500">
                    {generatedPreviewRows.length > 0 
                      ? `${generatedPreviewRows.length} unit siap dipindahkan ke lembar kerja atau diekspor ke SAP PM`
                      : 'Belum ada baris di-generate. Isi parameter di sebelah kiri lalu klik tombol generate.'
                    }
                  </div>
                </div>

                {generatedPreviewRows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadCsv(generatedPreviewRows, 'Generated')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh CSV (;)</span>
                    </button>

                    <button
                      onClick={handleTransferToActiveList}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Salin ke Lembar Kerja</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="mt-4 border border-slate-200 rounded-lg overflow-x-auto max-h-[380px] scrollbar-thin">
                {generatedPreviewRows.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    Pratinjau kosong. Klik "Generate Unit" untuk membuat dataset equipment baru.
                  </div>
                ) : (
                  <table className="w-full text-[11px] text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">#</th>
                        <th className="p-2 border-r border-slate-200">Equipment Number</th>
                        <th className="p-2 border-r border-slate-200">EQTYP</th>
                        <th className="p-2 border-r border-slate-200">Description</th>
                        <th className="p-2 border-r border-slate-200">Installation FL (TPLNR)</th>
                        <th className="p-2 border-r border-slate-200">Technical ID</th>
                        <th className="p-2">Koordinat (Lat,Long)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {generatedPreviewRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-2 text-slate-400 border-r border-slate-100">{idx + 1}</td>
                          <td className="p-2 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                            {row.equipmentNumber}
                          </td>
                          <td className="p-2 text-center text-slate-700 font-bold border-r border-slate-100">
                            {row.category}
                          </td>
                          <td className="p-2 font-sans text-slate-700 border-r border-slate-100 truncate max-w-[200px]">
                            {row.description}
                          </td>
                          <td className="p-2 text-blue-700 font-semibold border-r border-slate-100 whitespace-nowrap">
                            {row.functionalLocation}
                          </td>
                          <td className="p-2 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                            {row.technicalIdentNo}
                          </td>
                          <td className="p-2 text-slate-500 whitespace-nowrap">
                            {row.latLong}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Format SAP PM Equipment master data: Delimitasi titik koma (;) UTF-8 BOM.</span>
              </div>
              <div className="text-[11px] text-slate-400">
                15 Kolom Standar Migrasi
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
