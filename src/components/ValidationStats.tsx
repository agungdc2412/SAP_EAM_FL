import React from 'react';
import { ValidationSummary } from '../types/flTypes';
import { AlertCircle, CheckCircle2, RefreshCw, Layers, ShieldCheck, MapPin, Building2, KeyRound } from 'lucide-react';

interface ValidationStatsProps {
  summary: ValidationSummary;
  onFilterRule?: (ruleKey: string | null) => void;
  activeRuleFilter?: string | null;
}

export const ValidationStats: React.FC<ValidationStatsProps> = ({
  summary,
  onFilterRule,
  activeRuleFilter
}) => {
  const { totalRows, validRows, errorRows, repairedRows, ruleStats } = summary;
  const totalIssues = Object.values(ruleStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total Baris Migrasi</span>
            <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-1.5 py-0.5 rounded font-semibold inline-flex items-center gap-1">
              <KeyRound className="w-2.5 h-2.5" />
              <span>Col A PK</span>
            </span>
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">{totalRows}</span>
            <span className="text-xs text-slate-400">Master Record</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Baris Valid (Sesuai)</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 font-mono tabular-nums">{validRows}</span>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{totalRows > 0 ? Math.round((validRows / totalRows) * 100) : 0}%</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Perlu Perbaikan</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600 font-mono tabular-nums">{errorRows}</span>
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{totalIssues} Temuan</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg">
          <div className="text-xs font-medium text-slate-500">Telah Diperbaiki</div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-blue-600 font-mono tabular-nums">{repairedRows}</span>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tersinkronisasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Core Rule Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Rule 1 */}
        <button
          onClick={() => onFilterRule && onFilterRule(activeRuleFilter === 'RULE_1_SUPERIOR_FL' ? null : 'RULE_1_SUPERIOR_FL')}
          className={`p-3 text-left rounded-lg border transition-all ${
            activeRuleFilter === 'RULE_1_SUPERIOR_FL'
              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Aturan 1: Superior (D)</span>
            <Layers className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-xs text-slate-600 line-clamp-1">vs PK FL (A) & Lev2</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className={`text-xs font-mono font-bold tabular-nums ${
              ruleStats.rule1SuperiorMismatch > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {ruleStats.rule1SuperiorMismatch > 0 ? `${ruleStats.rule1SuperiorMismatch} Mismatch` : 'Sesuai'}
            </span>
          </div>
        </button>

        {/* Rule 2 */}
        <button
          onClick={() => onFilterRule && onFilterRule(activeRuleFilter === 'RULE_2_DIGIT_6_8_VS_PLAN' ? null : 'RULE_2_DIGIT_6_8_VS_PLAN')}
          className={`p-3 text-left rounded-lg border transition-all ${
            activeRuleFilter === 'RULE_2_DIGIT_6_8_VS_PLAN'
              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Aturan 2: FL 3-Digit (A)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-xs text-slate-600 line-clamp-1">vs Plan Section (H)</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className={`text-xs font-mono font-bold tabular-nums ${
              ruleStats.rule2DigitMismatch > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {ruleStats.rule2DigitMismatch > 0 ? `${ruleStats.rule2DigitMismatch} Mismatch` : 'Sesuai'}
            </span>
          </div>
        </button>

        {/* Rule 3 */}
        <button
          onClick={() => onFilterRule && onFilterRule(activeRuleFilter === 'RULE_3_CITY_NAME_TO_CITY_ID' ? null : 'RULE_3_CITY_NAME_TO_CITY_ID')}
          className={`p-3 text-left rounded-lg border transition-all ${
            activeRuleFilter === 'RULE_3_CITY_NAME_TO_CITY_ID'
              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Aturan 3: City ID (AH)</span>
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-xs text-slate-600 line-clamp-1">Generate via LOV 111</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className={`text-xs font-mono font-bold tabular-nums ${
              ruleStats.rule3CityIdMissingOrInvalid > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {ruleStats.rule3CityIdMissingOrInvalid > 0 ? `${ruleStats.rule3CityIdMissingOrInvalid} Belum Gen` : 'Lengkap'}
            </span>
          </div>
        </button>

        {/* Rule 4 */}
        <button
          onClick={() => onFilterRule && onFilterRule(activeRuleFilter === 'RULE_4_PLAN_SECTION_SYNC' ? null : 'RULE_4_PLAN_SECTION_SYNC')}
          className={`p-3 text-left rounded-lg border transition-all ${
            activeRuleFilter === 'RULE_4_PLAN_SECTION_SYNC'
              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Aturan 4: Plan Section (H)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-xs text-slate-600 line-clamp-1">Sync LOV City ID</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className={`text-xs font-mono font-bold tabular-nums ${
              ruleStats.rule4PlanSyncIssues > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {ruleStats.rule4PlanSyncIssues > 0 ? `${ruleStats.rule4PlanSyncIssues} Belum Sync` : 'Sinkron'}
            </span>
          </div>
        </button>

        {/* Rule 5 */}
        <button
          onClick={() => onFilterRule && onFilterRule(activeRuleFilter === 'RULE_5_SAP_HIERARCHY' ? null : 'RULE_5_SAP_HIERARCHY')}
          className={`p-3 text-left rounded-lg border transition-all ${
            activeRuleFilter === 'RULE_5_SAP_HIERARCHY'
              ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Aturan 5: SAP Hierarki</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1 text-xs text-slate-600 line-clamp-1">Plant, WC, CC & AE (ID)</div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Status</span>
            <span className={`text-xs font-mono font-bold tabular-nums ${
              ruleStats.rule5HierarchyInconsistency > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {ruleStats.rule5HierarchyInconsistency > 0 ? `${ruleStats.rule5HierarchyInconsistency} Selisih` : 'Sesuai'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
