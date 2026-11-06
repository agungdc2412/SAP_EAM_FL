import React, { useState } from 'react';
import { LOV_DATABASE, LovItem } from '../data/lovDatabase';
import { Search, Database, Copy, Check } from 'lucide-react';

export const LovDatabaseModal: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const plants = Array.from(new Set(LOV_DATABASE.map(item => item.plant))).sort();

  const filteredItems = LOV_DATABASE.filter(item => {
    const matchesPlant = selectedPlant === 'ALL' || item.plant === selectedPlant;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.cityHomepass.toLowerCase().includes(q) ||
      item.cityId.toLowerCase().includes(q) ||
      item.plant.toLowerCase().includes(q) ||
      item.workCenter.toLowerCase().includes(q) ||
      item.costCenter.toLowerCase().includes(q);
    
    return matchesPlant && matchesSearch;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Database Referensi LOV (111 Konfigurasi Kota & Plant)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi Level 2 General resmi untuk validasi Plant-City, Work Center, dan Cost Center.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Plant filter */}
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">Semua Plant ({LOV_DATABASE.length})</option>
            {plants.map(p => (
              <option key={p} value={p}>Plant {p}</option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari Kota / City ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-md w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-slate-200 rounded-md">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-700 uppercase font-semibold">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">City Homepass (Nama Kota/Kab)</th>
              <th className="py-2.5 px-3">City ID (3 Digit)</th>
              <th className="py-2.5 px-3">Plant (Lev 1)</th>
              <th className="py-2.5 px-3">Work Center</th>
              <th className="py-2.5 px-3">Cost Center</th>
              <th className="py-2.5 px-3 text-right">Salin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => (
              <tr key={`${item.cityId}_${idx}`} className="hover:bg-slate-50 transition-colors">
                <td className="py-2 px-3 text-slate-400 font-mono tabular-nums">{idx + 1}</td>
                <td className="py-2 px-3 font-medium text-slate-900">{item.cityHomepass}</td>
                <td className="py-2 px-3">
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.cityId}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-slate-700">{item.plant}</td>
                <td className="py-2 px-3 font-mono text-slate-700">{item.workCenter}</td>
                <td className="py-2 px-3 font-mono text-slate-700">{item.costCenter}</td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleCopy(`${item.plant}-${item.cityId}`)}
                    className="p-1 text-slate-400 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
                    title={`Salin Lev2: ${item.plant}-${item.cityId}`}
                  >
                    {copiedCode === `${item.plant}-${item.cityId}` ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
