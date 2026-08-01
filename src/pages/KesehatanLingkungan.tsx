import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'

const KESLING_OPTIONS = [
  { key: 'air_minum_memenuhi_syarat_pct', label: 'Air Minum Memenuhi Syarat (%)' },
  { key: 'sanitasi_aman_pct', label: 'Sanitasi Aman (%)' },
  { key: 'sanitasi_layak_pct', label: 'Sanitasi Layak (%)' },
  { key: 'babs_pct', label: 'BABS (%)' },
  { key: 'stop_babs_kk_pct', label: 'Stop BABS KK (%)' },
  { key: 'stbm_5pilar_pct', label: 'STBM 5 Pilar (%)' },
  { key: 'tfu_memenuhi_syarat_pct', label: 'TFU Memenuhi Syarat (%)' },
  { key: 'tpp_memenuhi_syarat_pct', label: 'TPP Memenuhi Syarat (%)' },
  { key: 'kualitas_udara_ms_pct', label: 'Kualitas Udara MS (%)' },
]

export default function KesehatanLingkungan() {
  const { data: kesling, loading, error } = useDashboardData()

  const [kab, setKab] = useState('all')
  const [tahun, setTahun] = useState('2025')
  const [indic, setIndic] = useState('air_minum_memenuhi_syarat_pct')

  const data = useMemo(() => kab === 'all' ? kesling.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : kesling.filter(d => d.kabupaten === kab), [kab, kesling])

  const avgAir = data.length ? data.reduce((s, d) => s + (d.air_minum_memenuhi_syarat_pct as number), 0) / data.length : 0
  const avgSanitasi = data.length ? data.reduce((s, d) => s + (d.sanitasi_aman_pct as number), 0) / data.length : 0
  const avgBABS = data.length ? data.reduce((s, d) => s + (d.babs_pct as number), 0) / data.length : 0
  const avgSTBM = data.length ? data.reduce((s, d) => s + (d.stbm_5pilar_pct as number), 0) / data.length : 0

  const chartData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number)).slice(0, 15)
  const stats = descStats(data.map(d => d[indic] as number))
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null
  const indicLabel = KESLING_OPTIONS.find(o => o.key === indic)?.label ?? indic

  // Radar data for single kabupaten or province avg
  const radarData = [
    { subject: 'Air Minum', value: avgAir },
    { subject: 'Sanitasi Aman', value: avgSanitasi },
    { subject: 'Stop BABS', value: data.length ? data.reduce((s, d) => s + (d.stop_babs_kk_pct as number), 0) / data.length : 0 },
    { subject: 'STBM', value: avgSTBM },
    { subject: 'TFU', value: data.length ? data.reduce((s, d) => s + (d.tfu_memenuhi_syarat_pct as number), 0) / data.length : 0 },
    { subject: 'TPP', value: data.length ? data.reduce((s, d) => s + (d.tpp_memenuhi_syarat_pct as number), 0) / data.length : 0 },
  ]

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} memiliki ${indicLabel} tertinggi (${(maxKab[indic] as number).toFixed(1)}%).`,
    `${minKab.kabupaten} memiliki ${indicLabel} terendah (${(minKab[indic] as number).toFixed(1)}%).`,
  ] : []

  const statInsights = [
    `Rata-rata akses air minum memenuhi syarat: ${avgAir.toFixed(1)}%.`,
    `Rata-rata BABS: ${avgBABS.toFixed(1)}% — perlu perhatian khusus pada kabupaten dengan BABS tinggi.`,
    `Rata-rata cakupan STBM 5 Pilar: ${avgSTBM.toFixed(1)}%.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} tahun={tahun} onKab={setKab} onTahun={setTahun} kabupaten={''} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Air Minum Layak" value={avgAir.toFixed(1) + '%'} sub="Rata-rata" icon="💧" color="#06B5D0" />
        <KPICard title="Sanitasi Aman" value={avgSanitasi.toFixed(1) + '%'} sub="Rata-rata" icon="🚿" color="#0FB0AA" />
        <KPICard title="Masih BABS" value={avgBABS.toFixed(1) + '%'} sub="Rata-rata" icon="⚠️" color="#f97316" />
        <KPICard title="STBM 5 Pilar" value={avgSTBM.toFixed(1) + '%'} sub="Rata-rata" icon="🌿" color="#CBD92C" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Kesehatan Lingkungan</h3>
              <select value={indic} onChange={e => setIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {KESLING_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={indic} radius={[0, 6, 6, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#06B5D0' : i < 5 ? '#0FB0AA' : '#93c5c3'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}
        </div>

        {/* Radar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm h-fit">
          <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Profil Lingkungan</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#f3f4f6" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="Rata-rata" dataKey="value" stroke="#0FB0AA" fill="#0FB0AA" fillOpacity={0.25} />
              <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grouped comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Air Minum vs Sanitasi vs BABS (Top 10)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.slice(0, 10).map(d => ({
            kabupaten: d.kabupaten.replace('Kota ',''),
            air: d.air_minum_memenuhi_syarat_pct,
            sanitasi: d.sanitasi_aman_pct,
            babs: d.babs_pct,
          }))} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="air" name="Air Minum (%)" fill="#06B5D0" radius={[3, 3, 0, 0]} />
            <Bar dataKey="sanitasi" name="Sanitasi Aman (%)" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
            <Bar dataKey="babs" name="BABS (%)" fill="#f97316" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <StatPanel stats={stats} label={indicLabel} format={v => v.toFixed(1) + '%'} />
      {statInsights.length > 0 && <InsightBox insights={statInsights} />}

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'air_minum_memenuhi_syarat_pct', label: 'Air Minum (%)', format: v => v?.toFixed(1) },
        { key: 'sanitasi_aman_pct', label: 'Sanitasi Aman (%)', format: v => v?.toFixed(1) },
        { key: 'babs_pct', label: 'BABS (%)', format: v => v?.toFixed(1) },
        { key: 'stbm_5pilar_pct', label: 'STBM 5 Pilar (%)', format: v => v?.toFixed(1) },
        { key: 'tfu_memenuhi_syarat_pct', label: 'TFU (%)', format: v => v?.toFixed(1) },
        { key: 'kualitas_udara_ms_pct', label: 'Kualitas Udara (%)', format: v => v?.toFixed(1) },
      ]} />
    </div>
  )
}
