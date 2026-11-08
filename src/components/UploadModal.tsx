import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Check, AlertCircle } from 'lucide-react';
import { parseCSVText, exportToDelimitedCSV } from '../services/csvService';
import { getSampleRecords } from '../data/sampleDataset';
import { FLRowRecord, FunclocModule } from '../types/flTypes';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: FLRowRecord[]) => void;
  onStartStreamingFile: (file: File) => void;
  module?: FunclocModule;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onStartStreamingFile,
  module = 'ZFS01'
}) => {
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    onClose();
    onStartStreamingFile(file);
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    try {
      const records = parseCSVText(pasteText);
      if (records.length === 0) {
        setErrorMsg('Data yang ditempelkan tidak memiliki format kolom yang valid.');
        return;
      }
      onDataLoaded(records);
      onClose();
    } catch (err: any) {
      setErrorMsg('Gagal memproses data teks: ' + (err?.message || 'Error'));
    }
  };

  const handleDownloadTemplate = () => {
    const samples = getSampleRecords();
    exportToDelimitedCSV(samples, 'Template_Master_Data_FL_SAP.csv');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Impor Data Migrasi Functional Location
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Mendukung file CSV (delimited titik koma ; atau koma ,), Excel (.xlsx/.xls), atau tempel langsung.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              accept=".csv,.txt,.xlsx,.xls"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-600 shadow-2xs">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-slate-800">
              Klik untuk pilih file atau seret file ke sini
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              File CSV (delimiter ; / ,), XLSX, atau XLS
            </p>
          </div>

          {/* Paste Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Atau Tempel (Paste) Teks Tabel / CSV:
            </label>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Tempel baris data CSV atau tabel dari Excel di sini..."
              className="w-full text-xs font-mono p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            {pasteText && (
              <button
                onClick={handlePasteSubmit}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors"
              >
                Proses Data Tempelan
              </button>
            )}
          </div>

          {/* Template Download */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Butuh template kolom standar SAP?</span>
            <button
              onClick={handleDownloadTemplate}
              className="text-slate-900 hover:underline font-semibold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template CSV (;)</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};
