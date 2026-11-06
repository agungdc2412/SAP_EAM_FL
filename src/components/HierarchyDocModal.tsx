import React from 'react';
import { BookOpen, CheckCircle2, KeyRound } from 'lucide-react';
import { FL_COLUMNS } from '../types/flTypes';

export const HierarchyDocModal: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-slate-800" />
          <h2 className="text-base font-bold text-slate-900">
            Dokumentasi Hierarki Functional Location (SAP PM Blueprint)
          </h2>
        </div>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          Struktur Functional Location (FL) disusun berdasarkan standar hierarki berjenjang (Lev 1 hingga Lev 4).
          <strong className="text-slate-900"> Kolom A (Functional Location) adalah Primary Key yang tidak boleh diubah (Immutable)</strong>. Seluruh perbaikan dilakukan pada kolom lainnya (Kolom H, D, F, I, J, K, AH, AE).
        </p>
      </div>

      {/* 2 Main Validation Buttons Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <span className="text-xs font-bold text-slate-900">Tombol 1: Validate Plan Section</span>
          </div>
          <p className="text-xs text-slate-600">
            Mencocokkan nama kota di <code className="font-mono font-semibold">Kolom AB (City)</code> ke referensi LOV 111 kota:
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Menghasilkan kode City ID 3-digit ke kolom baru <strong className="font-mono">AH (City ID LOV)</strong></li>
            <li>Mengisi <strong className="font-mono">Plan Section (Kolom H)</strong> = City ID</li>
            <li>Mengisi <strong className="font-mono">Planning Plant (F)</strong> & <strong className="font-mono">Maint Plant (I)</strong> = Plant LOV</li>
            <li>Mengisi <strong className="font-mono">Work Center (J)</strong> & <strong className="font-mono">Cost Center (K)</strong> = LOV</li>
            <li>Memastikan <strong className="font-mono">Kolom AE (Country)</strong> bernilai <strong>ID</strong></li>
          </ul>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <span className="text-xs font-bold text-slate-900">Tombol 2: Validate FL 3-Digit vs Plant Section</span>
          </div>
          <p className="text-xs text-slate-600">
            Memverifikasi apakah 3 karakter pada <code className="font-mono font-semibold">Kolom A (posisi digit 6-8)</code> sudah sama dengan 3 karakter di <code className="font-mono font-semibold">Kolom H (Plant Section)</code>:
          </p>
          <ul className="text-xs text-slate-600 list-disc list-inside space-y-1 pl-1">
            <li>Contoh: <code className="font-mono">1011-LBP-T00014433...</code> → 3-digit adalah <strong>LBP</strong></li>
            <li>Jika Kolom H berbeda (misal <strong>KDL</strong>), sistem akan memperbarui Kolom H menjadi <strong>LBP</strong></li>
            <li>Kolom A adalah Primary Key dan tidak pernah disentuh/dimutasi</li>
            <li>Sinkronisasi Superior FL (Kolom D) juga disesuaikan ke parent Kolom A</li>
          </ul>
        </div>
      </div>

      {/* Complete Dictionary of SAP PM Columns */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Kamus Data Kolom Migrasi SAP PM (A – AI)
          </h3>
          <span className="text-xs text-slate-500 font-mono">Termasuk Kolom Baru AH</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold">
              <tr>
                <th className="py-2 px-3 w-16">Kolom</th>
                <th className="py-2 px-3">Nama Kolom (Field Name)</th>
                <th className="py-2 px-3 w-28">Maks Karakter</th>
                <th className="py-2 px-3">Keterangan / Aturan Khusus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {FL_COLUMNS.map((col) => (
                <tr key={col.key} className={`hover:bg-slate-50 ${col.key === 'cityIdGenerated' ? 'bg-blue-50/40' : ''}`}>
                  <td className="py-1.5 px-3 font-mono font-bold text-slate-900">{col.letter}</td>
                  <td className="py-1.5 px-3 font-medium text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span>{col.title}</span>
                      {col.key === 'functionalLocation' && (
                        <span className="text-[9px] bg-slate-900 text-white font-mono px-1 rounded flex items-center gap-0.5">
                          <KeyRound className="w-2.5 h-2.5" />
                          <span>PK Immutable</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-1.5 px-3 font-mono text-slate-600">{col.charLength} char</td>
                  <td className="py-1.5 px-3 text-slate-500">{col.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
