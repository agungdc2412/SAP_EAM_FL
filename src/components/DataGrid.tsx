import React, { useState, useMemo } from 'react';
import { FLRowRecord, FLRowData, FL_COLUMNS } from '../types/flTypes';
import { 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  KeyRound, 
  Check, 
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  AlertTriangle,
  Sparkles,
  Pencil,
  X,
  MapPin
} from 'lucide-react';
import { extractDigit6to8 } from '../services/validationService';

interface DataGridProps {
  records: FLRowRecord[];
  onRepairRow: (record: FLRowRecord) => void;
  onSyncPlanSection: (record: FLRowRecord) => void;
  onSyncFLDigit: (record: FLRowRecord) => void;
  onApplyFuzzyCity?: (record: FLRowRecord) => void;
  onUpdateCell: (record: FLRowRecord, field: keyof FLRowData, newValue: string) => void;
  onResetRow: (record: FLRowRecord) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({
  records,
  onRepairRow,
  onSyncPlanSection,
  onSyncFLDigit,
  onApplyFuzzyCity,
  onUpdateCell,
  onResetRow
}) => {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [detailRecord, setDetailRecord] = useState<FLRowRecord | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Reset to page 1 if total records change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [records.length]);

  const toggleRow = (id: string) => {
    setExpandedRowId(prev => prev === id ? null : id);
  };

  const getCellIssue = (record: FLRowRecord, field: keyof FLRowData) => {
    return record.issues.find(i => i.field === field);
  };

  const isFieldRepaired = (record: FLRowRecord, field: keyof FLRowData) => {
    return record.repairedFields.includes(field);
  };

  // Inline editing state
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof FLRowData } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleStartEdit = (record: FLRowRecord, field: keyof FLRowData) => {
    if (field === 'functionalLocation') return; // Primary Key strictly immutable
    setEditingCell({ rowId: record.id, field });
    setEditValue(record.data[field] || '');
  };

  const handleSaveEdit = (record: FLRowRecord) => {
    if (!editingCell) return;
    onUpdateCell(record, editingCell.field, editValue.trim());
    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const renderEditableCell = (
    record: FLRowRecord,
    field: keyof FLRowData,
    displayContent: React.ReactNode,
    isMono = false,
    extraClass = ''
  ) => {
    const isEditing = editingCell?.rowId === record.id && editingCell?.field === field;
    const isPk = field === 'functionalLocation';

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 min-w-[120px] z-10" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(record);
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className={`w-full px-1.5 py-0.5 text-xs bg-white border border-blue-500 rounded shadow-xs focus:outline-none ring-1 ring-blue-500 font-medium text-slate-900 ${
              isMono ? 'font-mono' : 'font-sans'
            }`}
          />
          <button
            onClick={() => handleSaveEdit(record)}
            className="p-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors shrink-0"
            title="Simpan (Enter)"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="p-1 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors shrink-0"
            title="Batal (Esc)"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    return (
      <div
        onDoubleClick={() => !isPk && handleStartEdit(record, field)}
        className={`group/cell relative flex items-center justify-between gap-1 rounded px-1 -mx-1 py-0.5 transition-colors ${
          !isPk ? 'cursor-pointer hover:bg-slate-200/50 hover:ring-1 hover:ring-slate-300' : ''
        } ${extraClass}`}
        title={isPk ? 'Primary Key (Immutable - tidak dapat diubah)' : 'Klik 2x atau klik ikon pensil untuk edit manual'}
      >
        <div className="truncate w-full">{displayContent}</div>
        {!isPk && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStartEdit(record, field);
            }}
            className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-slate-400 hover:text-slate-800 rounded transition-opacity shrink-0"
            title="Edit nilai langsung"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    );
  };

  // Pagination calculation
  const totalRecords = records.length;
  const isAllPages = pageSize === -1;
  const totalPages = isAllPages ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    if (isAllPages) return records;
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return records.slice(startIndex, startIndex + pageSize);
  }, [records, safeCurrentPage, pageSize, isAllPages]);

  const startRowIndex = totalRecords === 0 ? 0 : isAllPages ? 1 : (safeCurrentPage - 1) * pageSize + 1;
  const endRowIndex = isAllPages ? totalRecords : Math.min(safeCurrentPage * pageSize, totalRecords);

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs space-y-0">
      {/* Table Data Viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Top Multi-Column Category Header */}
            <tr className="bg-slate-100/90 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <th colSpan={2} className="py-1.5 px-3 text-center border-r border-slate-200">Baris & Status</th>
              <th colSpan={2} className="py-1.5 px-3 border-r border-slate-200 text-slate-800">
                Identitas Functional Location (Col A = Primary Key)
              </th>
              <th colSpan={3} className="py-1.5 px-3 border-r border-slate-200 bg-blue-50/50 text-blue-900">
                Wilayah & Seksi (LOV Mapping)
              </th>
              <th colSpan={1} className="py-1.5 px-3 border-r border-slate-200 bg-amber-50/60 text-amber-950">
                Titik Koordinat (GIS)
              </th>
              <th colSpan={4} className="py-1.5 px-3 border-r border-slate-200 text-slate-700">
                Organisasi Pemeliharaan SAP PM
              </th>
              <th className="py-1.5 px-3 text-right">Aksi Sinkronisasi</th>
            </tr>

            {/* Column Header Names */}
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <th className="py-2.5 px-3 w-10 text-center text-slate-400 font-mono">#</th>
              <th className="py-2.5 px-3 w-28">Status</th>
              
              {/* Primary Columns */}
              <th className="py-2.5 px-3 min-w-[270px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500">Col A</span>
                  <span>Functional Location (PK)</span>
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[190px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500">Col D</span>
                  <span>Superior FunctLoc</span>
                </div>
              </th>

              {/* Location & Section Columns */}
              <th className="py-2.5 px-3 min-w-[170px] bg-blue-50/20">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-blue-700">Col AB</span>
                  <span>City (Nama Kota)</span>
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[125px] bg-blue-50/40 font-bold text-blue-950">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-blue-800">Col AH</span>
                  <span>City ID (LOV)</span>
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[120px] bg-blue-50/20">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-blue-700">Col H</span>
                  <span>Plan Section</span>
                </div>
              </th>

              {/* Titik Koordinat Column */}
              <th className="py-2.5 px-3 min-w-[170px] bg-amber-50/30 text-amber-950 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-amber-800">Col N</span>
                  <span>Lat & Long (Koordinat)</span>
                </div>
              </th>

              {/* SAP Org Columns */}
              <th className="py-2.5 px-3 min-w-[80px]">
                <span className="font-mono text-[10px] font-bold text-slate-500 mr-1">Col F</span>
                <span>Plant</span>
              </th>
              <th className="py-2.5 px-3 min-w-[95px]">
                <span className="font-mono text-[10px] font-bold text-slate-500 mr-1">Col J</span>
                <span>Work Ctr</span>
              </th>
              <th className="py-2.5 px-3 min-w-[95px]">
                <span className="font-mono text-[10px] font-bold text-slate-500 mr-1">Col K</span>
                <span>Cost Ctr</span>
              </th>
              <th className="py-2.5 px-3 min-w-[65px]">
                <span className="font-mono text-[10px] font-bold text-slate-500 mr-1">Col AE</span>
                <span>Negara</span>
              </th>

              {/* Actions Header */}
              <th className="py-2.5 px-3 text-right min-w-[140px]">Sinkronisasi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-sans">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-10 text-center text-slate-500">
                  Tidak ada baris data yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => {
                const isExpanded = expandedRowId === record.id;
                const flDigit6to8 = extractDigit6to8(record.data.functionalLocation);
                const planIssue = getCellIssue(record, 'plantSection');
                const supIssue = getCellIssue(record, 'superiorFunctLoc');
                const coordIssue = getCellIssue(record, 'latLong');
                const plantIssue = getCellIssue(record, 'planningPlant') || getCellIssue(record, 'maintPlant');
                const wcIssue = getCellIssue(record, 'workCenter');
                const ccIssue = getCellIssue(record, 'costCenter');
                const isDigitMatch = flDigit6to8 && record.data.plantSection === flDigit6to8;

                return (
                  <React.Fragment key={record.id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition-colors ${
                        record.isDuplicatePk
                          ? 'bg-rose-100/30'
                          : record.hasErrors
                          ? 'bg-rose-50/20'
                          : record.isRepaired
                          ? 'bg-blue-50/20'
                          : ''
                      }`}
                    >
                      {/* Index */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {record.rowIndex}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {record.isDuplicatePk ? (
                          <span 
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300"
                            title={`Duplikat PK dengan baris #${record.duplicateWithRows?.join(', #')}`}
                          >
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Duplikat PK</span>
                          </span>
                        ) : record.hasErrors ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>{record.issues.filter(i => i.severity === 'error').length} Isu</span>
                          </span>
                        ) : record.isRepaired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                            <span>Sync</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Valid</span>
                          </span>
                        )}
                      </td>

                      {/* Col A: Functional Location (PK Immutable) */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 font-mono text-xs">
                            <span 
                              className={`px-1.5 py-0.5 rounded font-semibold border ${
                                record.isDuplicatePk
                                  ? 'bg-rose-100 text-rose-950 border-rose-300 font-bold'
                                  : 'bg-slate-100 text-slate-900 border-slate-200'
                              }`}
                              title="Primary Key (Immutable - Terkunci)"
                            >
                              {record.data.functionalLocation || '(kosong)'}
                            </span>
                          </div>
                          {record.isDuplicatePk && (
                            <span className="text-[10px] text-rose-700 font-sans font-semibold mt-0.5">
                              Duplikat di baris: #{record.duplicateWithRows?.join(', #')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col D: Superior FunctLoc (Editable) */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          {renderEditableCell(
                            record,
                            'superiorFunctLoc',
                            <span className={`font-mono text-xs ${supIssue ? 'text-rose-700 font-semibold' : 'text-slate-700'}`}>
                              {record.data.superiorFunctLoc || <span className="text-slate-400 italic">(kosong)</span>}
                            </span>,
                            true
                          )}
                          {isFieldRepaired(record, 'superiorFunctLoc') && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              {record.originalData.superiorFunctLoc}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col AB: City Name (Editable) */}
                      <td className="py-2.5 px-3 bg-blue-50/10">
                        <div className="flex flex-col gap-1">
                          {renderEditableCell(
                            record,
                            'city',
                            <span
                              className={`font-medium truncate max-w-[170px] inline-block ${
                                record.fuzzyCitySuggestion ? 'text-amber-800 font-semibold' : 'text-slate-800'
                              }`}
                              title={record.data.city}
                            >
                              {record.data.city || <span className="text-slate-400 italic">(kosong)</span>}
                            </span>
                          )}
                          {record.fuzzyCitySuggestion && (
                            <div className="p-1.5 bg-amber-50/90 border border-amber-200 rounded text-[11px] shadow-2xs space-y-1">
                              <div className="flex items-center gap-1 text-amber-900 font-semibold text-[10px]">
                                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Typo? Saran LOV:</span>
                              </div>
                              <div className="font-mono font-bold text-slate-900 text-[11px] leading-tight">
                                "{record.fuzzyCitySuggestion.cityHomepass}"
                              </div>
                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                <span className="text-[10px] font-mono text-amber-800">
                                  ID: {record.fuzzyCitySuggestion.cityId} ({Math.round(record.fuzzyCitySuggestion.similarity * 100)}%)
                                </span>
                                {onApplyFuzzyCity && (
                                  <button
                                    onClick={() => onApplyFuzzyCity(record)}
                                    className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Terapkan nama kota dan sinkronkan ID LOV"
                                  >
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Terapkan</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col AH: City ID Generated (Editable) */}
                      <td className="py-2.5 px-3 bg-blue-50/20">
                        <div className="flex flex-col">
                          {renderEditableCell(
                            record,
                            'cityIdGenerated',
                            <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded inline-block w-fit ${
                              !record.data.cityIdGenerated
                                ? 'bg-rose-100 text-rose-900'
                                : isFieldRepaired(record, 'cityIdGenerated')
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-blue-100 text-blue-900'
                            }`}>
                              {record.data.cityIdGenerated || <span className="italic font-normal text-rose-700">Belum Gen</span>}
                            </span>,
                            true
                          )}
                        </div>
                      </td>

                      {/* Col H: Plan Section (Editable) */}
                      <td className="py-2.5 px-3 bg-blue-50/10">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            {renderEditableCell(
                              record,
                              'plantSection',
                              <span className={`font-mono font-bold text-xs px-1.5 py-0.5 rounded inline-block w-fit ${
                                planIssue
                                  ? 'bg-rose-100 text-rose-900'
                                  : isFieldRepaired(record, 'plantSection')
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-slate-800 bg-slate-100'
                              }`}>
                                {record.data.plantSection || <span className="italic font-normal text-slate-400">-</span>}
                              </span>,
                              true
                            )}
                            {!isDigitMatch && flDigit6to8 && (
                              <span className="text-[10px] text-rose-600 font-mono" title={`Digit 6-8 FL Kolom A adalah ${flDigit6to8}`}>
                                ≠ {flDigit6to8}
                              </span>
                            )}
                          </div>
                          {isFieldRepaired(record, 'plantSection') && (
                            <span className="text-[10px] text-slate-400 line-through font-mono">
                              {record.originalData.plantSection}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Col N: Titik Koordinat / Lat & Long (Editable + Auto-fix) */}
                      <td className="py-2.5 px-3 bg-amber-50/15">
                        <div className="flex flex-col gap-1">
                          {renderEditableCell(
                            record,
                            'latLong',
                            <span className={`font-mono text-xs ${
                              coordIssue?.severity === 'error'
                                ? 'text-rose-700 font-bold'
                                : coordIssue?.severity === 'warning'
                                ? 'text-amber-800 font-semibold'
                                : isFieldRepaired(record, 'latLong')
                                ? 'text-blue-700 font-medium'
                                : 'text-slate-700'
                            }`}>
                              {record.data.latLong || <span className="text-slate-400 italic">(kosong)</span>}
                            </span>,
                            true
                          )}

                          {coordIssue && (
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className={`text-[10px] font-mono px-1 rounded ${
                                coordIssue.severity === 'error'
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-amber-100 text-amber-800 font-semibold'
                              }`}>
                                {coordIssue.message.includes('terbalik') ? '⚠️ Terbalik' : '⚠️ Format'}
                              </span>
                              {coordIssue.canAutoFix && coordIssue.suggestedFix && (
                                <button
                                  onClick={() => onUpdateCell(record, 'latLong', coordIssue.suggestedFix!)}
                                  className="px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  title={`Perbaiki: ${coordIssue.suggestedFix}`}
                                >
                                  <MapPin className="w-2.5 h-2.5" />
                                  <span>{coordIssue.message.includes('terbalik') ? 'Balikkan' : 'Standar'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Col F: Plant (Editable) */}
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {renderEditableCell(
                          record,
                          'planningPlant',
                          <span className={plantIssue ? 'text-amber-700 font-semibold' : ''}>
                            {record.data.planningPlant || record.data.maintPlant || '-'}
                          </span>,
                          true
                        )}
                      </td>

                      {/* Col J: Work Center (Editable) */}
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {renderEditableCell(
                          record,
                          'workCenter',
                          <span className={wcIssue ? 'text-amber-700 font-semibold' : ''}>
                            {record.data.workCenter || '-'}
                          </span>,
                          true
                        )}
                      </td>

                      {/* Col K: Cost Center (Editable) */}
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {renderEditableCell(
                          record,
                          'costCenter',
                          <span className={ccIssue ? 'text-amber-700 font-semibold' : ''}>
                            {record.data.costCenter || '-'}
                          </span>,
                          true
                        )}
                      </td>

                      {/* Col AE: Country (Editable) */}
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {renderEditableCell(
                          record,
                          'country',
                          <span>{record.data.country || 'ID'}</span>,
                          true
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onSyncPlanSection(record)}
                            className="px-2 py-1 text-[11px] font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded transition-colors"
                            title="Generate City ID ke Kolom AH & sinkronkan Kolom H, F, I, J, K"
                          >
                            Sync LOV
                          </button>

                          <button
                            onClick={() => onSyncFLDigit(record)}
                            className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors border ${
                              isDigitMatch
                                ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-bold'
                            }`}
                            title={`Cocokkan Kolom H dengan 3-digit Kolom A (${flDigit6to8})`}
                          >
                            Sync FL
                          </button>

                          {record.isRepaired && (
                            <button
                              onClick={() => onResetRow(record)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
                              title="Kembalikan ke data asli"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setDetailRecord(record)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                            title="Buka 35 kolom lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleRow(record.id)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                            title="Audit isu baris ini"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Audit Findings */}
                    {isExpanded && (
                      <tr className="bg-slate-50/70">
                        <td colSpan={13} className="p-3 border-t border-slate-200">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                              <span>Audit Temuan Validasi Baris #{record.rowIndex}</span>
                              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                                <span>3-Digit FL (Col A): <strong>{flDigit6to8 || '-'}</strong></span>
                                <span>Plan Section (Col H): <strong>{record.data.plantSection || '-'}</strong></span>
                              </div>
                            </div>

                            {record.issues.length === 0 ? (
                              <div className="text-xs text-emerald-700 flex items-center gap-1.5 py-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Seluruh data valid dan sesuai standar blueprint SAP PM.</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {record.issues.map((issue) => (
                                  <div
                                    key={issue.id}
                                    className={`p-2 rounded bg-white border text-xs space-y-1 ${
                                      issue.rule === 'RULE_DUPLICATE_PK'
                                        ? 'border-rose-300 bg-rose-50/40'
                                        : 'border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-semibold">
                                      <span className="text-slate-900">
                                        Kolom {issue.columnLetter} ({String(issue.field)})
                                      </span>
                                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                                        issue.severity === 'error' ? 'text-rose-700 bg-rose-50' : 'text-amber-700 bg-amber-50'
                                      }`}>
                                        {issue.rule}
                                      </span>
                                    </div>
                                    <p className="text-slate-600">{issue.message}</p>
                                    {issue.suggestedFix && (
                                      <div className="text-[11px] font-mono text-slate-500">
                                        Nilai Rekomendasi: <strong className="text-slate-900">{issue.suggestedFix}</strong>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Controls */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Row range info & page size selector */}
        <div className="flex items-center gap-3 text-slate-600">
          <span>
            Menampilkan <strong className="font-mono text-slate-900">{startRowIndex}</strong> - <strong className="font-mono text-slate-900">{endRowIndex}</strong> dari <strong className="font-mono text-slate-900">{totalRecords}</strong> baris data
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-slate-500">Tampilkan:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setPageSize(val);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
              <option value={250}>250 baris</option>
              <option value={-1}>Semua ({totalRecords})</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        {!isAllPages && totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Halaman Pertama"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <span className="px-3 py-1 font-mono text-xs font-semibold text-slate-800">
              Hal {safeCurrentPage} dari {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
              title="Halaman Terakhir"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Full 35-Column Drawer / Modal */}
      {detailRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Seluruh 35 Kolom SAP — Baris #{detailRecord.rowIndex}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klik 2x pada kartu kolom mana pun untuk edit manual langsung. Kolom A (Primary Key) terkunci.
                </p>
              </div>
              <button
                onClick={() => setDetailRecord(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {FL_COLUMNS.map((col) => {
                  const val = detailRecord.data[col.key];
                  const origVal = detailRecord.originalData[col.key];
                  const isRepaired = val !== origVal;
                  const issue = detailRecord.issues.find(i => i.field === col.key);
                  const isPk = col.key === 'functionalLocation';
                  const isEditingThis = editingCell?.rowId === detailRecord.id && editingCell?.field === col.key;

                  return (
                    <div
                      key={col.key}
                      onDoubleClick={() => !isPk && handleStartEdit(detailRecord, col.key)}
                      className={`p-2.5 rounded border text-xs transition-colors ${
                        detailRecord.isDuplicatePk && isPk
                          ? 'border-rose-400 bg-rose-100/50'
                          : issue
                          ? 'border-rose-300 bg-rose-50/50'
                          : isRepaired
                          ? 'border-blue-300 bg-blue-50/50'
                          : isPk
                          ? 'border-slate-300 bg-slate-100/70'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded bg-slate-200 text-slate-700 inline-flex items-center justify-center font-bold text-[10px]">
                            {col.letter}
                          </span>
                          <span>{col.title}</span>
                          {isPk ? (
                            <span className="text-[9px] bg-slate-900 text-white font-mono px-1 rounded">PK</span>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(detailRecord, col.key)}
                              className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                              title="Edit kolom ini"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Max {col.charLength}</span>
                      </div>

                      {isEditingThis ? (
                        <div className="mt-1.5 flex items-center gap-1">
                          <input
                            type="text"
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                onUpdateCell(detailRecord, col.key, editValue.trim());
                                setDetailRecord(prev => prev ? {
                                  ...prev,
                                  data: { ...prev.data, [col.key]: editValue.trim() }
                                } : null);
                                setEditingCell(null);
                              }
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-full px-1.5 py-1 text-xs bg-white border border-blue-500 rounded font-mono shadow-xs focus:outline-none ring-1 ring-blue-500"
                          />
                          <button
                            onClick={() => {
                              onUpdateCell(detailRecord, col.key, editValue.trim());
                              setDetailRecord(prev => prev ? {
                                ...prev,
                                data: { ...prev.data, [col.key]: editValue.trim() }
                              } : null);
                              setEditingCell(null);
                            }}
                            className="p-1 text-emerald-700 bg-emerald-50 rounded border border-emerald-200"
                            title="Simpan"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingCell(null)}
                            className="p-1 text-slate-500 bg-slate-100 rounded border border-slate-300"
                            title="Batal"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 font-mono font-medium text-slate-900 break-all">
                          {val || <span className="text-slate-400 italic font-sans">(kosong)</span>}
                        </div>
                      )}

                      {isRepaired && (
                        <div className="mt-1 text-[10px] text-slate-500">
                          Sebelum: <span className="line-through">{origVal || '(kosong)'}</span>
                        </div>
                      )}
                      {issue && (
                        <div className="mt-1 text-[10px] text-rose-600 font-sans">
                          {issue.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  onRepairRow(detailRecord);
                  setDetailRecord(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
              >
                Sinkronkan Baris Ini
              </button>
              <button
                onClick={() => setDetailRecord(null)}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
