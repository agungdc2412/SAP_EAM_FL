import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  CheckCheck, 
  Search, 
  Filter, 
  AlertCircle, 
  Database, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { FLRowRecord, FunclocModule, MODULE_CONFIGS } from '../types/flTypes';
import { fuzzyMatchSniCityName, findSniByCityName } from '../data/sniDatabase';
import { fuzzyMatchCityName, findLovByCityName } from '../data/lovDatabase';

interface ReferenceFuzzyModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: FLRowRecord[];
  module: FunclocModule;
  onApplySingleSuggestion: (recordId: string, suggestion: { cityName: string; cityId: string; plant?: string }) => void;
  onApplyAllSuggestions: (suggestions: Array<{ recordId: string; cityName: string; cityId: string; plant?: string }>) => void;
}

export interface DiscrepancyItem {
  recordId: string;
  rowIndex: number;
  flCode: string;
  currentCityName: string;
  currentCityId: string;
  recommendedCityName: string;
  recommendedCityId: string;
  recommendedPlant: string;
  similarity: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceTable: 'SNI' | 'ZFS04';
  isExactMatch: boolean;
}

export const ReferenceFuzzyModal: React.FC<ReferenceFuzzyModalProps> = ({
  isOpen,
  onClose,
  records,
  module,
  onApplySingleSuggestion,
  onApplyAllSuggestions
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [confidenceFilter, setConfidenceFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const moduleConfig = MODULE_CONFIGS[module];

  // Analyze all records for discrepancies with the active reference database
  const discrepancies: DiscrepancyItem[] = useMemo(() => {
    const list: DiscrepancyItem[] = [];

    records.forEach(rec => {
      const cityName = rec.data.city?.trim() || '';
      if (!cityName) return;

      if (module === 'ZFS01') {
        const exactSni = findSniByCityName(cityName);
        if (!exactSni) {
          // Check fuzzy matching against 424 SNI items
          const match = fuzzyMatchSniCityName(cityName);
          if (match && match.similarity < 0.999) {
            list.push({
              recordId: rec.id,
              rowIndex: rec.rowIndex,
              flCode: rec.data.functionalLocation,
              currentCityName: cityName,
              currentCityId: rec.data.cityIdGenerated || rec.data.plantSection || '-',
              recommendedCityName: match.sniItem.citySni,
              recommendedCityId: match.sniItem.cityId,
              recommendedPlant: match.sniItem.plant,
              similarity: match.similarity,
              confidence: match.confidence,
              sourceTable: 'SNI',
              isExactMatch: false
            });
          }
        }
      } else {
        const exactLov = findLovByCityName(cityName);
        if (!exactLov) {
          // Check fuzzy matching against 111 LOV items
          const match = fuzzyMatchCityName(cityName);
          if (match && match.similarity < 0.999) {
            list.push({
              recordId: rec.id,
              rowIndex: rec.rowIndex,
              flCode: rec.data.functionalLocation,
              currentCityName: cityName,
              currentCityId: rec.data.cityIdGenerated || rec.data.plantSection || '-',
              recommendedCityName: match.lovItem.cityHomepass,
              recommendedCityId: match.lovItem.cityId,
              recommendedPlant: match.lovItem.plant,
              similarity: match.similarity,
              confidence: match.confidence,
              sourceTable: 'ZFS04',
              isExactMatch: false
            });
          }
        }
      }
    });

    return list;
  }, [records, module]);

  // Filtered list
  const filteredDiscrepancies = useMemo(() => {
    return discrepancies.filter(item => {
      if (confidenceFilter !== 'ALL' && item.confidence !== confidenceFilter) {
        return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.currentCityName.toLowerCase().includes(q) ||
          item.recommendedCityName.toLowerCase().includes(q) ||
          item.recommendedCityId.toLowerCase().includes(q) ||
          item.flCode.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [discrepancies, confidenceFilter, searchQuery]);

  const unappliedCount = useMemo(() => {
    return discrepancies.filter(d => !appliedIds.has(d.recordId)).length;
  }, [discrepancies, appliedIds]);

  if (!isOpen) return null;

  const handleApplySingle = (item: DiscrepancyItem) => {
    onApplySingleSuggestion(item.recordId, {
      cityName: item.recommendedCityName,
      cityId: item.recommendedCityId,
      plant: item.recommendedPlant
    });
    setAppliedIds(prev => new Set([...prev, item.recordId]));
  };

  const handleApplyAll = () => {
    const toApply = filteredDiscrepancies
      .filter(d => !appliedIds.has(d.recordId))
      .map(d => ({
        recordId: d.recordId,
        cityName: d.recommendedCityName,
        cityId: d.recommendedCityId,
        plant: d.recommendedPlant
      }));

    if (toApply.length > 0) {
      onApplyAllSuggestions(toApply);
      setAppliedIds(prev => {
        const next = new Set(prev);
        toApply.forEach(x => next.add(x.recordId));
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-200 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Fuzzy Matching & Deteksi Perbedaan Data Referensi
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Modul: {moduleConfig.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mendeteksi ketidaksesuaian penulisan nama kota di dataset terhadap master <strong>{moduleConfig.referenceSource}</strong> menggunakan algoritma Bigram & Levenshtein.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Ditemukan <strong className="font-bold">{discrepancies.length} baris</strong> nama kota yang memiliki perbedaan/typo dengan master referensi aktif. Perubahan hanya memperbarui <strong>Kolom AB (City Name)</strong>, <strong>Kolom AH (City ID)</strong>, dan hierarki SAP terkait. <strong>Kolom A (Primary Key) tidak pernah diubah</strong>.
            </span>
          </div>
          {unappliedCount > 0 && (
            <button
              onClick={handleApplyAll}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Terapkan Semua Saran ({unappliedCount})</span>
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama kota, ID, atau FL..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Keyakinan:</span>
            </span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setConfidenceFilter('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  confidenceFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({discrepancies.length})
              </button>
              <button
                onClick={() => setConfidenceFilter('HIGH')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  confidenceFilter === 'HIGH'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tinggi &gt;85%
              </button>
              <button
                onClick={() => setConfidenceFilter('MEDIUM')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  confidenceFilter === 'MEDIUM'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sedang 60-85%
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-auto p-6">
          {filteredDiscrepancies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Tidak Ada Perbedaan Ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {discrepancies.length === 0
                  ? `Semua nama kota pada dataset sudah cocok 100% dengan master ${moduleConfig.referenceSource}.`
                  : 'Tidak ada hasil yang cocok dengan kriteria filter saat ini.'}
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3">Functional Location (Col A)</th>
                    <th className="py-2.5 px-3">Nama Kota Dataset (Col AB)</th>
                    <th className="py-2.5 px-3">Rekomendasi Referensi ({moduleConfig.shortName})</th>
                    <th className="py-2.5 px-3 text-center">City ID</th>
                    <th className="py-2.5 px-3 text-center">Skor Kecocokan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredDiscrepancies.map(item => {
                    const isApplied = appliedIds.has(item.recordId);
                    return (
                      <tr key={item.recordId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {item.rowIndex}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                          {item.flCode}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {item.currentCityName}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {item.recommendedCityName}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {item.recommendedCityId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            item.confidence === 'HIGH'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {Math.round(item.similarity * 100)}% ({item.confidence})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isApplied ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                              <Check className="w-3 h-3" />
                              <span>Diterapkan</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApplySingle(item)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            >
                              Terapkan
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Database className="w-3.5 h-3.5" />
            <span>
              Total Referensi Aktif: <strong>{moduleConfig.totalReferenceCount} entri</strong> ({moduleConfig.referenceSource})
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
