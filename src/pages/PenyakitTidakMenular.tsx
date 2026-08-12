import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import RiskClusteringMap from '../components/RiskClusteringMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats } from '../utils/stats'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'

const PTM_OPTIONS = [
  { key: 'hipertensi_laki', label: 'Hipertensi — Laki-laki' },
  { key: 'hipertensi_perempuan', label: 'Hipertensi — Perempuan' },
  { key: 'dm_terdiagnosis', label: 'Diabetes Melitus Terdiagnosis' },
  { key: 'dm_terkendali_pct', label: 'DM Terkendali (%)' },
  { key: 'jiwa_skizofrenia', label: 'Gangguan Jiwa — Skizofrenia' },
  { key: 'jiwa_psikotik', label: 'Gangguan Jiwa — Psikotik Akut' },
]

export default function PenyakitTidakMenular() {
  const [mapIndicator, setMapIndicator] = useState('hipertensi_laki');
  const { data: ptm, loading, error } = useDashboardData()

  const [ptmIndic, setPtmIndic] = useState('hipertensi_laki')
  const [indicFilter, setIndicFilter] = useState('10')
  const [genderFilter, setGenderFilter] = useState('10')

  const ptmData = useMemo(() => ptm.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [ptm])

  // PTM stats
  const totHipertensi = ptmData.reduce((s, d) => s + (d.hipertensi_laki as number) + (d.hipertensi_perempuan as number), 0)
  const totDM = ptmData.reduce((s, d) => s + (d.dm_terdiagnosis as number), 0)
  const avgDMTerkendali = ptmData.length ? ptmData.reduce((s, d) => s + (d.dm_terkendali_pct as number), 0) / ptmData.length : 0
  const totSkizo = ptmData.reduce((s, d) => s + (d.jiwa_skizofrenia as number), 0)

  const ptmSorted = [...ptmData].sort((a, b) => (b[ptmIndic] as number) - (a[ptmIndic] as number))
  const ptmChart = indicFilter === 'all' ? ptmSorted : ptmSorted.slice(0, Number(indicFilter))

  const ptmStats = descStats(ptmData.map(d => d[ptmIndic] as number))
  const ptmLabel = PTM_OPTIONS.find(o => o.key === ptmIndic)?.label ?? ptmIndic

  // Hipertensi gender comparison
  const hipertensiGenderSorted = [...ptmData].sort((a, b) => ((b.hipertensi_laki as number) + (b.hipertensi_perempuan as number)) - ((a.hipertensi_laki as number) + (a.hipertensi_perempuan as number)))
  const hipertensiGender = (genderFilter === 'all' ? hipertensiGenderSorted : hipertensiGenderSorted.slice(0, Number(genderFilter))).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    laki: d.hipertensi_laki,
    perempuan: d.hipertensi_perempuan,
  }))

  const ptmInsights = [
    `Total hipertensi (L+P): ${totHipertensi.toLocaleString('id-ID')} kasus.`,
    `Total DM terdiagnosis: ${totDM.toLocaleString('id-ID')} | DM terkendali: ${avgDMTerkendali.toFixed(1)}% rata-rata.`,
    `Total skizofrenia: ${totSkizo.toLocaleString('id-ID')} kasus.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Kasus Hipertensi" value={totHipertensi.toLocaleString('id-ID')} sub="Penderita mendapat pelayanan 96.5%" icon="❤️" color="#0F8F8B" />
        <KPICard title="Diabetes Melitus" value={totDM.toLocaleString('id-ID')} sub="Terdiagnosis" icon="🩸" color="#0F8F8B" />
        <KPICard title="DM Terkendali" value="342.113" sub="Persentase 37.7%" icon="✅" color="#0F8F8B" />
        <KPICard title="HPV+ & IVA+" value="96.4%" sub="Persentase Skrining" icon="🔬" color="#0F8F8B" />
        <KPICard title="SADANIS (30-69 Thn)" value="28.2%" sub="Skrining Payudara" icon="🎗️" color="#0F8F8B" />
        <KPICard title="USG Payudara (30-69 Thn)" value="0.1%" sub="Skrining Payudara" icon="🩺" color="#0F8F8B" />
        <KPICard title="Pelayanan Jiwa Berat" value="93.1%" sub="Persentase Pelayanan" icon="🧠" color="#0F8F8B" />
      </div>

      {/* CHOROPLETH MAP SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-2 mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Peta Sebaran Provinsi Jawa Timur</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Indikator:</span>
            <select 
              value={mapIndicator} 
              onChange={e => setMapIndicator(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0F8F8B] bg-gray-50 text-gray-700 max-w-[200px] truncate"
            >
              {PTM_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ChoroplethMap 
          data={ptmData} 
          indicatorKey={mapIndicator} 
          indicatorLabel={PTM_OPTIONS.find(o => o.key === mapIndicator)?.label || ''} 
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Hipertensi Laki-laki vs Perempuan</h3>
          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Keseluruhan</option>
          </select>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: genderFilter === 'all' ? 1200 : (genderFilter === '20' ? 800 : '100%'), height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hipertensiGender} margin={{ bottom: 40 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} interval={0} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1e3).toFixed(0) + 'rb'} />
                <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="laki" name="Hipertensi Laki-laki" fill="#078FA5" radius={[3, 3, 0, 0]} />
                <Bar dataKey="perempuan" name="Hipertensi Perempuan" fill="#9EAF24" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator PTM per Kabupaten/Kota</h3>
          <div className="flex items-center gap-3">
            <select value={ptmIndic} onChange={e => setPtmIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {PTM_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <select value={indicFilter} onChange={e => setIndicFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Keseluruhan</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: indicFilter === 'all' ? 800 : '100%', height: indicFilter === 'all' ? 800 : (indicFilter === '20' ? 600 : 400) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ptmChart} layout="vertical" margin={{ left: 110, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 10 }} width={100} interval={0} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey={ptmIndic} name={ptmLabel} fill="#0F8F8B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <StatPanel
        stats={ptmStats}
        label={ptmLabel}
        rightElement={
          <select value={ptmIndic} onChange={e => setPtmIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {PTM_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />
      <InsightBox insights={ptmInsights} />
      <CrosstabSection
        data={ptmData}
        variables={PTM_OPTIONS}
        defaultRowVar="hipertensi_laki"
        defaultColVar="dm_terdiagnosis"
        title="Analisis Crosstab PTM"
      />
      
      <RiskClusteringMap 
        title="Analisis Klasterisasi Pemetaan Risiko Penyakit Tidak Menular"
        data={ptmData} 
        variables={['hipertensi_laki', 'dm_terkendali_pct']} 
        directions={[-1, -1]} 
        variableLabels={['Pelayanan Hipertensi Laki-laki', 'DM Terkendali (%)']} 
      />

      <DataTable data={ptmData} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'hipertensi_laki', label: 'Hipertensi L', format: v => v?.toLocaleString('id-ID') },
        { key: 'hipertensi_perempuan', label: 'Hipertensi P', format: v => v?.toLocaleString('id-ID') },
        { key: 'dm_terdiagnosis', label: 'DM Diagnosis', format: v => v?.toLocaleString('id-ID') },
        { key: 'dm_terkendali_pct', label: 'DM Terkendali (%)', format: v => v?.toFixed(1) },
        { key: 'jiwa_skizofrenia', label: 'Skizofrenia', format: v => v?.toLocaleString('id-ID') },
      ]} />
    </div>
  )
}
