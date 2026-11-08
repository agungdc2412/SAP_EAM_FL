import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  Layers, 
  ShieldCheck, 
  Zap,
  Clock,
  Database,
  X
} from 'lucide-react';

export interface LoadingPresentationModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  stage?: string;
  currentCount?: number;
  totalCount?: number;
  percent?: number;
  speedRowsPerSec?: number;
  elapsedSeconds?: number;
  currentStepIndex?: number; // 0 to 4
  onCancel?: () => void;
}

export const LoadingPresentationModal: React.FC<LoadingPresentationModalProps> = ({
  isOpen,
  title = 'Memproses & Memvalidasi Master Data SAP PM',
  subtitle = 'Engine pemrosesan batch berkecepatan tinggi dengan proteksi memori ratusan ribu baris',
  stage = 'Menyiapkan berkas dan mengalokasikan memori...',
  currentCount = 0,
  totalCount = 0,
  percent = 0,
  speedRowsPerSec = 0,
  elapsedSeconds = 0,
  currentStepIndex = 1,
  onCancel
}) => {
  if (!isOpen) return null;

  const boundedPercent = Math.min(100, Math.max(0, Math.round(percent)));
  const isComplete = boundedPercent >= 100;

  // Format elapsed time MM:SS.s
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = (elapsedSeconds % 60).toFixed(1);
  const formattedTime = `${String(mins).padStart(2, '0')}:${secs.padStart(4, '0')}`;

  // Estimate remaining time
  const remainingRows = Math.max(0, totalCount - currentCount);
  const estimatedRemainingSec = speedRowsPerSec > 0 ? (remainingRows / speedRowsPerSec).toFixed(1) : '-';

  // 5 Pipeline Stages
  const stages = [
    { label: 'Ingesti Berkas & Aliran Batch', desc: 'Membaca potongan data tanpa membebani browser' },
    { label: 'Normalisasi 35 Kolom SAP PM', desc: 'Pemetaan field Kolom A - AI sesuai blueprint' },
    { label: 'Deteksi Duplikasi Primary Key', desc: 'Pengecekan keunikan Kolom A pada seluruh dataset' },
    { label: 'Validasi Hierarki & Koordinat N', desc: 'Uji format parent Col D ↔ A & desimal koordinat' },
    { label: 'Sinkronisasi SNI/LOV & Optimasi', desc: 'Penyusunan ringkasan dan indeks memori virtual' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col relative transform transition-all">
        {/* Animated Accent Top Bar */}
        <div className="h-2 w-full bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-500 animate-pulse" />

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md shrink-0">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Batch Engine v2.4
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>

          {onCancel && !isComplete && (
            <button
              onClick={onCancel}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Batalkan proses"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Hero Presentation Progress Area */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-bounce" />
                ) : (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                )}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status Pemrosesan
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {stage}
                  </div>
                </div>
              </div>

              {/* Big Percentage Counter */}
              <div className="text-right">
                <span className="text-3xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                  {boundedPercent}%
                </span>
              </div>
            </div>

            {/* Smooth Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-200 ease-out ${
                    isComplete 
                      ? 'bg-emerald-500' 
                      : 'bg-linear-to-r from-blue-600 to-indigo-600'
                  }`}
                  style={{ width: `${boundedPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                <span>0 baris</span>
                <span>{totalCount > 0 ? `${totalCount.toLocaleString()} total baris` : 'Menghitung total baris...'}</span>
              </div>
            </div>
          </div>

          {/* 4 Live Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Metric 1: Rows Processed */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Baris Diproses</span>
              </div>
              <div className="mt-1 text-base font-bold font-mono text-slate-900 tabular-nums truncate">
                {currentCount.toLocaleString()}
              </div>
            </div>

            {/* Metric 2: Speed */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Kecepatan</span>
              </div>
              <div className="mt-1 text-base font-bold font-mono text-slate-900 tabular-nums">
                {speedRowsPerSec > 0 ? `${speedRowsPerSec.toLocaleString()} /dtk` : '-'}
              </div>
            </div>

            {/* Metric 3: Elapsed Time */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Waktu Berjalan</span>
              </div>
              <div className="mt-1 text-base font-bold font-mono text-slate-900 tabular-nums">
                {formattedTime}
              </div>
            </div>

            {/* Metric 4: Estimated Remaining */}
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                <span>Sisa Estimasi</span>
              </div>
              <div className="mt-1 text-base font-bold font-mono text-slate-900 tabular-nums">
                {isComplete ? 'Selesai' : estimatedRemainingSec !== '-' ? `~${estimatedRemainingSec}s` : '...'}
              </div>
            </div>
          </div>

          {/* 5-Step Pipeline Presentation Stages */}
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tahapan Pipeline Validasi
            </div>
            <div className="space-y-2">
              {stages.map((st, sIdx) => {
                const isStepFinished = boundedPercent >= ((sIdx + 1) * 20);
                const isStepActive = !isStepFinished && boundedPercent >= (sIdx * 20);

                return (
                  <div 
                    key={sIdx} 
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      isStepActive 
                        ? 'bg-blue-50/70 border border-blue-200 text-slate-900 font-semibold' 
                        : isStepFinished 
                        ? 'text-slate-700 font-medium' 
                        : 'text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isStepFinished 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : isStepActive 
                          ? 'bg-blue-600 text-white animate-pulse' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isStepFinished ? '✓' : sIdx + 1}
                      </div>
                      <div>
                        <span>{st.label}</span>
                        <span className="hidden sm:inline text-slate-400 font-normal ml-2">
                          · {st.desc}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono shrink-0">
                      {isStepFinished ? (
                        <span className="text-emerald-700 font-bold">100%</span>
                      ) : isStepActive ? (
                        <span className="text-blue-700 font-bold">Sedang berjalan...</span>
                      ) : (
                        <span className="text-slate-400">Menunggu</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Proteksi Memori Aktif: Kolom A (Primary Key) tidak pernah dimutasi.</span>
          </div>

          {onCancel && !isComplete && (
            <button
              onClick={onCancel}
              className="text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
            >
              Batalkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
