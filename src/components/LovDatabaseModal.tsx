import React, { useState } from 'react';
import { LOV_DATABASE } from '../data/lovDatabase';
import { SNI_DATABASE } from '../data/sniDatabase';
import { Search, Database, Copy, Check, Layers } from 'lucide-react';
import { FunclocModule } from '../types/flTypes';

interface LovDatabaseModalProps {
  initialModule?: FunclocModule;
}

export const LovDatabaseModal: React.FC<LovDatabaseModalProps> = ({ initialModule = 'ZFS04' }) => {
  const [activeTab, setActiveTab] = useState<'SNI' | 'ZFS04'>(
    initialModule === 'ZFS01' ? 'SNI' : 'ZFS04'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<string>('ALL');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeData = activeTab === 'SNI' ? SNI_DATABASE : LOV_DATABASE;

  const plants = Array.from(new Set(activeData.map(item => item.plant))).sort();

  const filteredItems = activeData.filter(item => {
    const matchesPlant = selectedPlant === 'ALL' || item.plant === selectedPlant;
    const q = searchQuery.toLowerCase();
    const cityName = 'citySni' in item ? (item as any).citySni : (item as any).cityHomepass;
    const matchesSearch = 
      cityName.toLowerCase().includes(q) ||
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
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Master Data Referensi Wilayah & Konfigurasi SAP
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi Level 2 resmi untuk pemetaan Plant, City ID, Work Center, dan Cost Center.
          </p>
        </div>

        {/* Database Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold self-start lg:self-center">
          <button
            onClick={() => {
              setActiveTab('SNI');
              setSelectedPlant('ALL');
            }}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'SNI'
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Referensi SNI (424 Kota/Kab · ZFS01)</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('ZFS04');
              setSelectedPlant('ALL');
            }}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'ZFS04'
                ? 'bg-blue-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>LOV Homepass (111 Kota · ZFS04)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Menampilkan <strong>{filteredItems.length}</strong> dari <strong>{activeData.length}</strong> entri konfigurasi {activeTab === 'SNI' ? 'SNI Nasional' : 'LOV Homepass'}.
        </div>

        <div className="flex items-center gap-2">
          {/* Plant filter */}
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="ALL">Semua Plant ({activeData.length})</option>
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

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-slate-200 rounded-md">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 text-slate-700 uppercase font-semibold">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">
                {activeTab === 'SNI' ? 'Nama Kota / Kabupaten SNI' : 'City Homepass'}
              </th>
              <th className="py-2.5 px-3">City ID (3 Digit)</th>
              <th className="py-2.5 px-3">Plant (Lev 1)</th>
              <th className="py-2.5 px-3">Work Center</th>
              <th className="py-2.5 px-3">Cost Center</th>
              <th className="py-2.5 px-3 text-right">Salin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, idx) => {
              const cityName = 'citySni' in item ? (item as any).citySni : (item as any).cityHomepass;
              return (
                <tr key={`${item.cityId}_${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3 text-slate-400 font-mono tabular-nums">{idx + 1}</td>
                  <td className="py-2 px-3 font-medium text-slate-900">{cityName}</td>
                  <td className="py-2 px-3">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      {item.cityId}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-700">{item.plant}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{item.workCenter}</td>
                  <td className="py-2 px-3 font-mono text-slate-700">{item.costCenter}</td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => handleCopy(`${item.plant}-${item.cityId}`)}
                      className="p-1 text-slate-400 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
