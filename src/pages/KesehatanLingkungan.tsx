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
import CrosstabSection from '../components/CrosstabSection'

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

  const [indic, setIndic] = useState('air_minum_memenuhi_syarat_pct')

  const [keslingFilter, setKeslingFilter] = useState('10')

  const data = useMemo(() => kesling.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [kesling])

  const chartSorted = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number))
  const chartData = keslingFilter === 'all' ? chartSorted : chartSorted.slice(0, Number(keslingFilter))
  const stats = descStats(data.map(d => d[indic] as number))
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null
  const indicLabel = KESLING_OPTIONS.find(o => o.key === indic)?.label ?? indic

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} mencatat angka tertinggi (${(maxKab[indic] as number).toFixed(1)}%). Kondisi ini sangat berdampak positif untuk menekan risiko penularan penyakit berbasis lingkungan di masyarakat.`,
    `${minKab.kabupaten} berada di angka terendah (${(minKab[indic] as number).toFixed(1)}%). Daerah ini memerlukan intervensi segera guna mencegah potensi wabah penyakit yang berkaitan erat dengan sanitasi dan kualitas lingkungan yang kurang memadai.`,
  ] : []

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <KPICard title="Air Minum Memenuhi Syarat" value="69.6%" sub="Rumah tangga dengan air minum yang memenuhi syarat 35%" icon="💧" color="#0FB0AA" />
        <KPICard title="Sanitasi Aman" value="6.75%" sub="Akses sanitasi layak sendiri 83.49%" icon="🚿" color="#0FB0AA" />
        <KPICard title="Desa/Kel 5 Pilar STBM" value="25.3%" sub="Cakupan" icon="🌿" color="#0FB0AA" />
        <KPICard title="TFU Pengawasan Standar" value="72.7%" sub="Fasilitas Umum" icon="🏢" color="#0FB0AA" />
        <KPICard title="TPP Memenuhi Syarat" value="79.7%" sub="Pengelolaan Pangan" icon="🍽️" color="#0FB0AA" />
        <KPICard title="Kualitas Udara" value="47.3%" sub="Memenuhi Syarat" icon="💨" color="#0FB0AA" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Kesehatan Lingkungan</h3>
          <div className="flex items-center gap-3">
            <select value={indic} onChange={e => setIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {KESLING_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <select value={keslingFilter} onChange={e => setKeslingFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Keseluruhan</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: keslingFilter === 'all' ? 800 : '100%', height: keslingFilter === 'all' ? 800 : (keslingFilter === '20' ? 600 : 400) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} interval={0} />
                <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={indic} fill="#0FB0AA" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}
      </div>

      <StatPanel
        stats={stats}
        label={indicLabel}
        format={v => v.toFixed(1) + '%'}
        rightElement={
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {KESLING_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />
      

      <CrosstabSection
        data={data}
        variables={KESLING_OPTIONS}
        defaultRowVar="air_minum_memenuhi_syarat_pct"
        defaultColVar="sanitasi_aman_pct"
      />

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
