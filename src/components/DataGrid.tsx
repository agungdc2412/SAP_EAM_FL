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
  MapPin,
  FileText,
  GitFork
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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs space-y-0">
      {/* Table Data Viewport */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            {/* Clean Single-Tier Column Header matching mockup */}
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold">
              <th className="py-2.5 px-3 w-10 text-center text-slate-400 font-mono">#</th>
              <th className="py-2.5 px-3 w-28">Status</th>
              
              {/* Primary Columns with SAP Letters */}
              <th className="py-2.5 px-3 min-w-[230px]">
                <span>Functional location </span>
                <span className="font-mono text-[11px] text-slate-400 font-normal">A</span>
              </th>
              
              <th className="py-2.5 px-3 min-w-[140px]">
                <span>Superior </span>
                <span className="font-mono text-[11px] text-slate-400 font-normal">D</span>
              </th>

              {/* Location & Section Columns */}
              <th className="py-2.5 px-3 min-w-[160px]">
                <span>Kota </span>
                <span className="font-mono text-[11px] text-slate-400 font-normal">AB</span>
              </th>

              <th className="py-2.5 px-3 min-w-[90px]">
                <span>City </span>
                <span className="font-mono text-[11px] text-slate-400 font-normal">AH</span>
              </th>

              <th className="py-2.5 px-3 min-w-[90px]">
                <span>Plan </span>
                <span className="font-mono text-[11px] text-slate-400 font-normal">H</span>
              </th>

              {/* Titik Koordinat Column */}
              <th className="py-2.5 px-3 min-w-[160px]">
                <span>Koordinat </span>
                <span className="font-mono text-[11px] text-slate-400 font-normal">N</span>
              </th>

              {/* Actions Header */}
              <th className="py-2.5 px-3 text-right min-w-[110px]">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-sans">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
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
                      className={`transition-colors ${
                        record.isDuplicatePk
                          ? 'bg-[#fee2e2]/60 hover:bg-[#fee2e2]/80'
                          : record.hasErrors
                          ? 'bg-rose-50/25 hover:bg-rose-50/45'
                          : record.isRepaired
                          ? 'bg-blue-50/20 hover:bg-blue-50/35'
                          : 'bg-white hover:bg-slate-50/70'
                      }`}
                    >
                      {/* 1. Index */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono tabular-nums">
                        {record.rowIndex}
                      </td>

                      {/* 2. Status Pill Badge */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {record.isDuplicatePk ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#fee2e2] text-[#991b1b] border border-[#fecdd3]"
                            title={`Duplikat PK dengan baris #${record.duplicateWithRows?.join(', #')}`}
                          >
                            <FileText className="w-3 h-3 text-[#dc2626]" />
                            <span>Duplikat</span>
                          </span>
                        ) : record.fuzzyCitySuggestion ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"
                            title={`Saran typo: ${record.fuzzyCitySuggestion.cityHomepass}`}
                          >
                            <Sparkles className="w-3 h-3 text-[#d97706]" />
                            <span>Typo</span>
                          </span>
                        ) : supIssue?.rule === 'RULE_HIERARCHY_VIOLATION' ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"
                            title="Superior FL tidak konsisten dengan Col A"
                          >
                            <GitFork className="w-3 h-3 text-[#d97706]" />
                            <span>Hierarki</span>
                          </span>
                        ) : record.hasErrors ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            <span>Perlu Aksi</span>
                          </span>
                        ) : record.isRepaired ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Check className="w-3 h-3 text-blue-600" />
                            <span>Sync</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Valid</span>
                          </span>
                        )}
                      </td>

                      {/* 3. Col A: Functional location A */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span 
                              className={`px-2.5 py-1 rounded-md font-mono text-xs border ${
                                record.isDuplicatePk
                                  ? 'bg-white text-slate-900 border-rose-300 font-semibold shadow-2xs'
                                  : 'bg-white text-slate-900 border-slate-200 shadow-2xs'
                              }`}
                              title="Primary Key (Immutable - Terkunci)"
                            >
                              {record.data.functionalLocation || '(kosong)'}
                            </span>
                          </div>
                          {record.isDuplicatePk && (
                            <span className="text-[11px] text-rose-600 font-sans mt-0.5 font-normal">
                              Sama dengan baris {record.duplicateWithRows?.join(', ')}
                            </span>
                          )}
                          {!record.isDuplicatePk && supIssue?.rule === 'RULE_HIERARCHY_VIOLATION' && (
                            <span className="text-[11px] text-amber-700 font-sans mt-0.5 font-normal">
                              Superior FL tidak cocok
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Col D: Superior D */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          {renderEditableCell(
                            record,
                            'superiorFunctLoc',
                            <span className={`font-mono text-xs ${supIssue ? 'text-rose-700 font-semibold' : 'text-slate-800'}`}>
                              {record.data.superiorFunctLoc || <span className="text-slate-400 italic">belum</span>}
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

                      {/* 5. Col AB: Kota AB */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col">
                          {renderEditableCell(
                            record,
                            'city',
                            <span
                              className="font-medium text-xs text-slate-800 uppercase tracking-wide truncate max-w-[180px] inline-block"
                              title={record.data.city}
                            >
                              {record.data.city || <span className="text-slate-400 italic font-normal lowercase">belum</span>}
                            </span>
                          )}
                          {record.fuzzyCitySuggestion && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-amber-800 font-sans">
                                Saran: <strong className="font-semibold">{record.fuzzyCitySuggestion.cityHomepass}</strong>
                              </span>
                              {onApplyFuzzyCity && (
                                <button
                                  onClick={() => onApplyFuzzyCity(record)}
                                  className="text-[10px] px-1.5 py-0.2 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium cursor-pointer"
                                  title="Terapkan perbaikan nama kota"
                                >
                                  Terapkan
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 6. Col AH: City AH */}
                      <td className="py-2.5 px-3">
                        {renderEditableCell(
                          record,
                          'cityIdGenerated',
                          record.data.cityIdGenerated ? (
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 shadow-2xs font-semibold">
                              {record.data.cityIdGenerated}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-slate-400 italic">belum</span>
                          ),
                          true
                        )}
                      </td>

                      {/* 7. Col H: Plan H */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          {renderEditableCell(
                            record,
                            'plantSection',
                            record.data.plantSection ? (
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 shadow-2xs font-semibold">
                                {record.data.plantSection}
                              </span>
                            ) : (
                              <span className="font-mono text-xs text-slate-400 italic">belum</span>
                            ),
                            true
                          )}
                          {!isDigitMatch && flDigit6to8 && record.data.plantSection && (
                            <span className="text-[10px] text-rose-600 font-mono" title={`Digit 6-8 FL Kolom A adalah ${flDigit6to8}`}>
                              ≠ {flDigit6to8}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8. Col N: Koordinat N */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-between gap-1">
                          {renderEditableCell(
                            record,
                            'latLong',
                            <span className={`font-mono text-xs ${
                              coordIssue?.severity === 'error'
                                ? 'text-rose-700 font-semibold'
                                : coordIssue?.severity === 'warning'
                                ? 'text-amber-800 font-semibold'
                                : 'text-slate-700'
                            }`}>
                              {record.data.latLong || <span className="text-slate-400 italic">belum</span>}
                            </span>,
                            true
                          )}
                          {coordIssue?.canAutoFix && coordIssue.suggestedFix && (
                            <button
                              onClick={() => onUpdateCell(record, 'latLong', coordIssue.suggestedFix!)}
                              className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-medium transition-colors cursor-pointer"
                              title={`Perbaiki format: ${coordIssue.suggestedFix}`}
                            >
                              {coordIssue.message.includes('terbalik') ? 'Balik' : 'Perbaiki'}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 9. Aksi */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {record.hasErrors && (
                            <button
                              onClick={() => onRepairRow(record)}
                              className="px-2 py-1 text-[11px] font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs cursor-pointer"
                              title="Perbaiki masalah pada baris ini"
                            >
                              Perbaiki
                            </button>
                          )}

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
                            title="Lihat 35 kolom lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleRow(record.id)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                            title="Detail temuan audit"
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
                        <td colSpan={9} className="p-3 border-t border-slate-200">
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
