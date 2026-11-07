import React, { useState } from 'react';
import { FLRowRecord } from '../types/flTypes';
import { autoRepairRow, repairPlanSectionFromCityName, syncPlantSectionWithFLCode } from '../services/repairService';
import { extractDigit6to8 } from '../services/validationService';
import { ShieldCheck, Wrench, CheckCircle2, ArrowRight, MapPin, KeyRound, Sparkles } from 'lucide-react';

interface ScanningRepairPanelProps {
  records: FLRowRecord[];
  onRepairRow: (record: FLRowRecord) => void;
  onRepairAll: () => void;
  onValidatePlanSection: () => void;
  onValidateFLVsPlantSection: () => void;
  onRunValidation: () => void;
  onApplyFuzzyCity?: (record: FLRowRecord) => void;
}

export const ScanningRepairPanel: React.FC<ScanningRepairPanelProps> = ({
  records,
  onRepairRow,
  onRepairAll,
  onValidatePlanSection,
  onValidateFLVsPlantSection,
  onRunValidation,
  onApplyFuzzyCity
}) => {
  const [selectedRuleFilter, setSelectedRuleFilter] = useState<string>('ALL');

  // Collect all repairable issues across records
  const allIssues = records.flatMap(rec => 
    rec.issues.map(issue => ({
      record: rec,
      issue
    }))
  );

  const typoIssues = allIssues.filter(i => i.record.fuzzyCitySuggestion && i.issue.field === 'city');
  const hierarchyIssues = allIssues.filter(i => i.issue.rule === 'RULE_HIERARCHY_VIOLATION');

  const filteredIssues = selectedRuleFilter === 'ALL'
    ? allIssues
    : selectedRuleFilter === 'TYPO_FUZZY'
    ? typoIssues
    : allIssues.filter(i => i.issue.rule === selectedRuleFilter);

  // Stats for the two main buttons
  const planSectionMismatchCount = records.filter(r => {
    const d = extractDigit6to8(r.data.functionalLocation);
    return d && r.data.plantSection !== d;
  }).length;

  const missingCityIdCount = records.filter(r => !r.data.cityIdGenerated).length;

  return (
    <div className="space-y-4">
      {/* 2 Primary Action Cards for User's 2 Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BUTTON 1 CARD */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="text-xs font-bold text-slate-900">
                Tombol 1: Validate Plan Section
              </h3>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded font-semibold border border-blue-200">
              City Name → City ID (AH)
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Meng-generate City ID dari City Name (LOV) ke Kolom baru <strong className="font-mono">AH</strong>, lalu secara otomatis mengisi <strong className="font-mono">Plan Section (H)</strong>, <strong className="font-mono">Planning Plant (F)</strong>, <strong className="font-mono">Maint Plant (I)</strong>, <strong className="font-mono">Work Center (J)</strong>, dan <strong className="font-mono">Cost Center (K)</strong>. Kolom AE diset <strong className="font-mono">ID</strong>.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              {missingCityIdCount > 0 ? `${missingCityIdCount} baris belum di-generate` : 'Semua baris terisi'}
            </span>
            <button
              onClick={onValidatePlanSection}
              className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Validate & Sync Plan Section</span>
            </button>
          </div>
        </div>

        {/* BUTTON 2 CARD */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-xs font-bold text-slate-900">
                Tombol 2: Validate FL 3-Digit vs Plant Section
              </h3>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
              planSectionMismatchCount > 0
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}>
              {planSectionMismatchCount > 0 ? `${planSectionMismatchCount} Mismatch` : '100% Cocok'}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Memeriksa apakah 3-digit di kolom <strong className="font-mono">Plant Section (H)</strong> sudah sama persis dengan 3-digit (posisi digit 6-8) pada kolom <strong className="font-mono">Functional Location (A)</strong>. Kolom A adalah Primary Key dan tidak diubah.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              {planSectionMismatchCount > 0 ? `${planSectionMismatchCount} baris tidak sinkron` : 'Semua baris sinkron'}
            </span>
            <button
              onClick={onValidateFLVsPlantSection}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Validate FL 3-Digit vs Plant Section</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Rule */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 w-full min-w-0">
        <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs">
          <button
            onClick={() => setSelectedRuleFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Semua Temuan ({allIssues.length})
          </button>

          <button
            onClick={() => setSelectedRuleFilter('RULE_HIERARCHY_VIOLATION')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_HIERARCHY_VIOLATION'
                ? 'bg-rose-900 text-white font-bold shadow-2xs'
                : 'bg-white border border-rose-300 text-rose-800 hover:bg-rose-50'
            }`}
          >
            Hierarchy Violation ({hierarchyIssues.length})
          </button>

          <button
            onClick={() => setSelectedRuleFilter('RULE_DUPLICATE_PK')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_DUPLICATE_PK'
                ? 'bg-rose-900 text-white shadow-2xs'
                : 'bg-white border border-rose-200 text-rose-800 hover:bg-rose-50'
            }`}
          >
            Duplikat PK
          </button>

          {typoIssues.length > 0 && (
            <button
              onClick={() => setSelectedRuleFilter('TYPO_FUZZY')}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer shrink-0 ${
                selectedRuleFilter === 'TYPO_FUZZY'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Typo Kota ({typoIssues.length})</span>
            </button>
          )}

          <button
            onClick={() => setSelectedRuleFilter('RULE_2_DIGIT_6_8_VS_PLAN')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_2_DIGIT_6_8_VS_PLAN'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            FL 3-Digit vs Plan Section
          </button>

          <button
            onClick={() => setSelectedRuleFilter('RULE_3_CITY_NAME_TO_CITY_ID')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_3_CITY_NAME_TO_CITY_ID'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Generate City ID (AH)
          </button>

          <button
            onClick={() => setSelectedRuleFilter('RULE_4_PLAN_SECTION_SYNC')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_4_PLAN_SECTION_SYNC'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Sinkron Plan Section (LOV)
          </button>

          <button
            onClick={() => setSelectedRuleFilter('RULE_1_SUPERIOR_FL')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_1_SUPERIOR_FL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Superior (D) vs FL (A)
          </button>

          <button
            onClick={() => setSelectedRuleFilter('RULE_8_COORDINATES')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedRuleFilter === 'RULE_8_COORDINATES'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-white border border-amber-200 text-amber-900 hover:bg-amber-50'
            }`}
          >
            Koordinat (Lat/Long)
          </button>
        </div>

        {allIssues.length > 0 && (
          <button
            onClick={onRepairAll}
            className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-2xs cursor-pointer"
          >
            <Wrench className="w-3.5 h-3.5 text-emerald-400" />
            <span>Perbaiki Semua ({allIssues.length})</span>
          </button>
        )}
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            Tidak Ada Isu Pada Filter Ini
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Semua baris data functional location telah mematuhi aturan ini.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredIssues.map(({ record, issue }, idx) => {
            const currentValue = record.data[issue.field] || '(kosong)';
            
            // Preview repair
            let proposedValue = issue.suggestedFix || '-';
            if (issue.rule === 'RULE_2_DIGIT_6_8_VS_PLAN') {
              const res = syncPlantSectionWithFLCode(record);
              proposedValue = res.updatedRecord.data[issue.field] || proposedValue;
            } else if (issue.rule === 'RULE_3_CITY_NAME_TO_CITY_ID' || issue.rule === 'RULE_4_PLAN_SECTION_SYNC') {
              const res = repairPlanSectionFromCityName(record);
              proposedValue = res.updatedRecord.data[issue.field] || proposedValue;
            } else {
              const res = autoRepairRow(record);
              proposedValue = res.updatedRecord.data[issue.field] || proposedValue;
            }

            return (
              <div
                key={`${issue.id}_${idx}`}
                className="bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        Baris #{record.rowIndex}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        Kolom {issue.columnLetter} ({String(issue.field)})
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                          issue.severity === 'error'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {issue.rule.replace(/_/g, ' ')}
                      </span>
                      {issue.field === 'functionalLocation' && (
                        <span className="text-[10px] font-mono bg-slate-900 text-white px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                          <KeyRound className="w-2.5 h-2.5" />
                          <span>PK (Immutable)</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      {issue.message}
                    </p>

                    <div className="flex items-center gap-3 pt-0.5 text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400">Saat ini:</span>
                        <span className="line-through text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          {currentValue}
                        </span>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-slate-400">Usulan Perbaikan:</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          {proposedValue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {record.fuzzyCitySuggestion && issue.field === 'city' && onApplyFuzzyCity ? (
                      <button
                        onClick={() => onApplyFuzzyCity(record)}
                        className="px-3 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Terapkan Typo</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onRepairRow(record)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>Terapkan</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
