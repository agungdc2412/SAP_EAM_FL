import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Download, 
  Copy, 
  RotateCcw, 
  CheckCircle2, 
  Building2, 
  Layers,
  MapPin,
  Calendar,
  Settings2,
  FileSpreadsheet
} from 'lucide-react';
import { FunclocModule, FLRowData, FLRowRecord, MODULE_CONFIGS } from '../types/flTypes';
import { SNI_DATABASE } from '../data/sniDatabase';
import { LOV_DATABASE } from '../data/lovDatabase';

interface FunctionalLocationGeneratorProps {
  currentModule: FunclocModule;
  onChangeModule: (mod: FunclocModule) => void;
  onSendToValidator: (generatedRecords: FLRowRecord[]) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const FunctionalLocationGenerator: React.FC<FunctionalLocationGeneratorProps> = ({
  currentModule,
  onChangeModule,
  onSendToValidator,
  onShowToast
}) => {
  // Generator form parameters
  const [planningPlant, setPlanningPlant] = useState('1011');
  const [selectedCityId, setSelectedCityId] = useState('ARS');
  const [customerName, setCustomerName] = useState('KCP Alahan Panjang');
  const [clusterBuilding, setClusterBuilding] = useState('STRBANKMA-01');
  const [startSequence, setStartSequence] = useState(1);
  const [rowCount, setRowCount] = useState(10);
  const [costCenter, setCostCenter] = useState('101OP02');
  const [workCenter, setWorkCenter] = useState('1011FOP1');
  const [circuitIdPrefix, setCircuitIdPrefix] = useState('CRT26060');
  const [streetAddress, setStreetAddress] = useState('Jl. Gajah Mada No. 5 Solok, SumBar');
  const [baseLat, setBaseLat] = useState('-0.982145');
  const [baseLong, setBaseLong] = useState('100.612034');

  // Preview generated rows
  const [generatedRows, setGeneratedRows] = useState<FLRowData[]>([]);

  // City options from reference databases
  const cityOptions = useMemo(() => {
    if (currentModule === 'ZFS01') {
      return SNI_DATABASE.slice(0, 50).map(s => ({
        id: s.cityId,
        name: s.citySni,
        plant: s.plant
      }));
    } else {
      return LOV_DATABASE.slice(0, 50).map(l => ({
        id: l.cityId,
        name: l.cityHomepass,
        plant: l.plant
      }));
    }
  }, [currentModule]);

  // Handle city selection
  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    const found = cityOptions.find(c => c.id === cityId);
    if (found && found.plant) {
      setPlanningPlant(found.plant);
    }
  };

  // Live syntax preview of FL string
  const sampleFlCode = useMemo(() => {
    const seqPadded = String(startSequence).padStart(9, '0');
    if (currentModule === 'ZFS01') {
      return `${planningPlant}-${selectedCityId}-${seqPadded}`;
    } else {
      return `${planningPlant}-${selectedCityId}-T00000001`;
    }
  }, [currentModule, planningPlant, selectedCityId, startSequence]);

  const sampleSuperiorFl = useMemo(() => {
    return `${planningPlant}-${selectedCityId}`;
  }, [planningPlant, selectedCityId]);

  // Execute Batch Generation
  const handleGenerate = () => {
    const rows: FLRowData[] = [];
    const cityObj = cityOptions.find(c => c.id === selectedCityId);
    const cityName = cityObj ? cityObj.name : 'KOTA PADANG';

    for (let i = 0; i < rowCount; i++) {
      const currentSeq = startSequence + i;
      const seqPadded = String(currentSeq).padStart(9, '0');
      const crtSeq = String(1000 + i);

      const flCode = currentModule === 'ZFS01' 
        ? `${planningPlant}-${selectedCityId}-${seqPadded}`
        : `${planningPlant}-${selectedCityId}-T${String(14430 + i).padStart(8, '0')}`;

      const supFl = `${planningPlant}-${selectedCityId}`;

      // Slight jitter to lat/long for realism
      const latFloat = parseFloat(baseLat) + (i * 0.00015);
      const longFloat = parseFloat(baseLong) + (i * 0.00012);
      const latLongStr = `${latFloat.toFixed(6)},${longFloat.toFixed(6)}`;

      rows.push({
        functionalLocation: flCode,
        structureIndicator: currentModule,
        description: `[${11190 + i}] ${customerName} Unit ${i + 1}`,
        superiorFunctLoc: supFl,
        startupDate: '05.07.2026',
        planningPlant: planningPlant,
        location: '',
        plantSection: selectedCityId,
        maintPlant: planningPlant,
        workCenter: workCenter,
        costCenter: costCenter,
        sortField: `P19000${40 + i}`,
        inventoryNo: `${circuitIdPrefix}${crtSeq}`,
        latLong: latLongStr,
        title: '',
        name1: '',
        name2: '',
        street5: clusterBuilding,
        street: streetAddress,
        street3: `[${11190 + i}] ${customerName}`,
        houseNumber: '',
        houseNumberSupplement: '',
        floor: '1',
        street2: '',
        street4: `${planningPlant}-${selectedCityId}-${clusterBuilding}`,
        otherCity: '',
        district: 'Kecamatan Pusat',
        city: cityName,
        postalCode: '',
        region: '',
        country: 'ID',
        telephone: '',
        telephoneExtension: '',
        cityIdGenerated: selectedCityId,
        status: 'AVBL'
      });
    }

    setGeneratedRows(rows);
    onShowToast(`Berhasil men-generate ${rows.length} baris Master Data Functional Location ${currentModule}.`, 'success');
  };

  // Transfer generated rows to active validator
  const handleSendToValidator = () => {
    if (generatedRows.length === 0) return;

    const newRecords: FLRowRecord[] = generatedRows.map((data, idx) => ({
      id: `gen_fl_${Date.now()}_${idx}`,
      rowIndex: idx + 1,
      data: { ...data },
      originalData: { ...data },
      issues: [],
      repairedFields: [],
      hasErrors: false,
      hasWarnings: false,
      isDuplicatePk: false,
      isRepaired: false
    }));

    onSendToValidator(newRecords);
    onShowToast(`Data ${generatedRows.length} baris telah dipindahkan ke Lembar Kerja Validasi.`, 'success');
  };

  // Download directly as Semicolon-delimited CSV
  const handleDownloadCsv = () => {
    if (generatedRows.length === 0) return;

    const headers = [
      'Functional Location',
      'Structure indicator',
      'Description',
      'Superior FunctLoc.',
      'Start-up date',
      'Planning Plant',
      'Location (Maint Plant)',
      'Plant Section (Kabupaten/Kota)',
      'Maint. Plant',
      'Work Center',
      'Cost Center',
      'Sort Field (Project ID)',
      'Inventory No. (CRT ID)',
      'Latitude and Longitude',
      'Title',
      'Name 1',
      'Name 2',
      'Street 5 (Cluster/Building)',
      'Street (Street Name)',
      'Street 3 (Additional Info)',
      'House Number',
      'House Number Supplement (Block Code)',
      'Floor',
      'Street 2 (RT RW)',
      'Street 4 (Additional Info)',
      'Other City (Kelurahan/Desa)',
      'District (Kecamatan)',
      'City',
      'Postal Code',
      'Region (Province Code)',
      'Country',
      'Telephone (without country code)',
      'Telephone Extension'
    ];

    const rows = generatedRows.map(r => [
      r.functionalLocation,
      r.structureIndicator,
      r.description,
      r.superiorFunctLoc,
      r.startupDate,
      r.planningPlant,
      r.location,
      r.plantSection,
      r.maintPlant,
      r.workCenter,
      r.costCenter,
      r.sortField,
      r.inventoryNo,
      r.latLong,
      r.title,
      r.name1,
      r.name2,
      r.street5,
      r.street,
      r.street3,
      r.houseNumber,
      r.houseNumberSupplement,
      r.floor,
      r.street2,
      r.street4,
      r.otherCity,
      r.district,
      r.city,
      r.postalCode,
      r.region,
      r.country,
      r.telephone,
      r.telephoneExtension
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(';'),
      ...rows.map(row => row.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Generated_FL_${currentModule}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`File CSV template (; ) berhasil diunduh.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Structure Indicator Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-900 text-white">
                SAP PM MASTER DATA GENERATOR
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Standard Blueprint: {MODULE_CONFIGS[currentModule].code}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Generate Master Data Functional Location
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Buat struktur hierarki Functional Location secara otomatis dengan validasi bawaan penomoran, kode kota SNI/LOV, dan plant SAP.
            </p>
          </div>

          {/* Module Selector Pill */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => onChangeModule('ZFS01')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                currentModule === 'ZFS01'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ZFS01 - Non Broadband
            </button>
            <button
              onClick={() => onChangeModule('ZFS04')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                currentModule === 'ZFS04'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ZFS04 - Broadband / OSP
            </button>
          </div>
        </div>

        {/* Live Syntax Breakdown Box */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Format Kolom A (Primary Key):
            </div>
            <div className="font-mono text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">{planningPlant}</span>
              <span className="text-slate-400">-</span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">{selectedCityId}</span>
              <span className="text-slate-400">-</span>
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                {currentModule === 'ZFS01' ? String(startSequence).padStart(9, '0') : 'T00000001'}
              </span>
            </div>
          </div>

          <div className="space-y-1 sm:text-right">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Superior FL (Kolom D):
            </div>
            <div className="font-mono text-sm font-bold text-slate-900">
              <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded">{sampleSuperiorFl}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generator Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
            <Settings2 className="w-4 h-4 text-slate-600" />
            <span>Parameter Generator</span>
          </div>

          {/* Plant & City Section */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Wilayah / Kota SNI (Plant Section H)
              </label>
              <select
                value={selectedCityId}
                onChange={(e) => handleSelectCity(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {cityOptions.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Plant (F & I)
                </label>
                <input
                  type="text"
                  value={planningPlant}
                  onChange={(e) => setPlanningPlant(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Jumlah Baris
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={rowCount}
                  onChange={(e) => setRowCount(parseInt(e.target.value) || 1)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Nomor Urut Mulai
                </label>
                <input
                  type="number"
                  min="1"
                  value={startSequence}
                  onChange={(e) => setStartSequence(parseInt(e.target.value) || 1)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Work Center (J)
                </label>
                <input
                  type="text"
                  value={workCenter}
                  onChange={(e) => setWorkCenter(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Cost Center (K)
              </label>
              <input
                type="text"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                Nama Customer / Deskripsi
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder="Contoh: KCP Alahan Panjang"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Base Latitude
                </label>
                <input
                  type="text"
                  value={baseLat}
                  onChange={(e) => setBaseLat(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
                  Base Longitude
                </label>
                <input
                  type="text"
                  value={baseLong}
                  onChange={(e) => setBaseLong(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate {rowCount} Baris Master Data</span>
            </button>
          </div>
        </div>

        {/* Right Area: Preview Grid & Export Actions */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="text-sm font-bold text-slate-900">
                  Preview Hasil Master Data Functional Location
                </div>
                <div className="text-xs text-slate-500">
                  {generatedRows.length > 0 
                    ? `${generatedRows.length} baris siap dipindahkan atau diekspor`
                    : 'Belum ada baris di-generate. Klik tombol "Generate Baris Master Data" di sebelah kiri.'
                  }
                </div>
              </div>

              {generatedRows.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCsv}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh CSV (;)</span>
                  </button>

                  <button
                    onClick={handleSendToValidator}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Salin ke Lembar Kerja</span>
                  </button>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="mt-4 border border-slate-200 rounded-lg overflow-x-auto max-h-[380px] scrollbar-thin">
              {generatedRows.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  Pratinjau tabel kosong. Tentukan parameter lalu klik tombol generate.
                </div>
              ) : (
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2 border-r border-slate-200">#</th>
                      <th className="p-2 border-r border-slate-200">Col A (Functional Location)</th>
                      <th className="p-2 border-r border-slate-200">Col D (Superior FL)</th>
                      <th className="p-2 border-r border-slate-200">Col H (Plant Section)</th>
                      <th className="p-2 border-r border-slate-200">Col C (Description)</th>
                      <th className="p-2 border-r border-slate-200">Col AB (City)</th>
                      <th className="p-2">Col N (Coordinates)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {generatedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80">
                        <td className="p-2 text-slate-400 border-r border-slate-100">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          {row.functionalLocation}
                        </td>
                        <td className="p-2 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                          {row.superiorFunctLoc}
                        </td>
                        <td className="p-2 text-emerald-700 font-bold border-r border-slate-100">
                          {row.plantSection}
                        </td>
                        <td className="p-2 font-sans text-slate-700 border-r border-slate-100 truncate max-w-[180px]">
                          {row.description}
                        </td>
                        <td className="p-2 font-sans text-slate-700 border-r border-slate-100">
                          {row.city}
                        </td>
                        <td className="p-2 text-slate-500 whitespace-nowrap">
                          {row.latLong}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Quick Guidelines Card */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Hierarki Superior FL (D) dijamin selalu cocok dengan prefix Kolom A (A starts with D + '-').</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Format SAP Standard PM
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
