import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, CartesianGrid, Legend, Cell
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import { KABUPATEN_LIST } from '../data/kabupaten'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import RankChart from '../components/RankChart'
import CrosstabSection from '../components/CrosstabSection'

const COLORS = ['#0F8F8B', '#9EAF24', '#078FA5', '#f97316', '#8b5cf6']
const fmt = (v: number) => v >= 1e6 ? (v / 1e6).toFixed(2) + ' jt' : v.toLocaleString('id-ID')

const INDICATOR_OPTIONS = [
  { key: 'jumlah_penduduk_desa_+_kelurahan', label: 'Jumlah Penduduk' },
  { key: 'jumlah_rumah_tangga_desa_+_kelurahan', label: 'Jumlah Rumah Tangga' },
  { key: 'kepadatan_penduduk_per_km2_desa_+_kelurahan', label: 'Kepadatan (org/km²)' },
  { key: 'luas_wilayah_km2', label: 'Luas Wilayah (km²)' },
  { key: 'jumlah_desa_+_kelurahan', label: 'Jumlah Desa & Kelurahan' },
]

export default function GambaranUmum() {
  const [mapIndicator, setMapIndicator] = useState('jumlah_penduduk_desa_+_kelurahan');
  const { data: demografi, loading, error } = useDashboardData()
  const [indicator, setIndicator] = useState('jumlah_penduduk_desa_+_kelurahan')
  const [corrX, setCorrX] = useState('jumlah_penduduk_desa_+_kelurahan')
  const [corrY, setCorrY] = useState('kepadatan_penduduk_per_km2_desa_+_kelurahan')

  const data = useMemo(() => demografi.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [demografi])

  const totalPenduduk = data.reduce((s, d) => s + ((d['jumlah_penduduk_desa_+_kelurahan'] as number) || 0), 0)
  const totalLuas = data.reduce((s, d) => s + ((d['luas_wilayah_km2'] as number) || 0), 0)
  const totalRumahTangga = data.reduce((s, d) => s + ((d['jumlah_rumah_tangga_desa_+_kelurahan'] as number) || 0), 0)
  const totalDesaKelurahan = data.reduce((s, d) => s + ((d['jumlah_desa_+_kelurahan'] as number) || 0), 0)

  const sortedData = [...data].sort((a, b) => (b[indicator] as number) - (a[indicator] as number))
  const top10Data = sortedData.slice(0, 10)
  const bottom10Data = sortedData.length > 10 ? sortedData.slice(-10) : []
  const statsVals = data.map(d => d[indicator] as number)
  const stats = descStats(statsVals)

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))
  const rLabel = Math.abs(r) > 0.7 ? 'kuat' : Math.abs(r) > 0.4 ? 'sedang' : 'lemah'
  const rDir = r > 0 ? 'positif' : 'negatif'

  const maxKab = data.length ? data.reduce((a, b) => (a[indicator] as number) > (b[indicator] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indicator] as number) < (b[indicator] as number) ? a : b) : null
  const indLabel = INDICATOR_OPTIONS.find(o => o.key === indicator)?.label ?? indicator

  const scatterInsights = [
    `Terdapat korelasi ${rDir} yang ${rLabel} (${r.toFixed(2)}) antara ${INDICATOR_OPTIONS.find(o => o.key === corrX)?.label} dan ${INDICATOR_OPTIONS.find(o => o.key === corrY)?.label}.`
  ]

  const statInsights = stats ? [
    `Rata-rata ${indLabel} se-Jawa Timur adalah ${fmt(Math.round(stats.mean))}, dengan nilai tengah (median) sebesar ${fmt(Math.round(stats.median))}.`
  ] : []

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KPICard title="Jumlah Kab/Kota" value={data.length.toString()} sub="Wilayah" color="#8b5cf6" />
        <KPICard title="Total Penduduk" value={fmt(totalPenduduk)} sub="Jiwa" color="#0F8F8B" />
        <KPICard title="Jumlah Rumah Tangga" value={fmt(totalRumahTangga)} sub="KK" color="#9EAF24" />
        <KPICard title="Luas Wilayah" value={fmt(Math.round(totalLuas))} sub="km²" color="#078FA5" />
        <KPICard title="JUMLAH DESA & KELURAHAN" value={fmt(totalDesaKelurahan)} sub="Total" color="#f97316" />
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
              {INDICATOR_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ChoroplethMap 
          data={data} 
          indicatorKey={mapIndicator} 
          indicatorLabel={INDICATOR_OPTIONS.find(o => o.key === mapIndicator)?.label || ''} 
        />
      </div>

      {/* Charts */}
      <RankChart
        data={data}
        indicators={INDICATOR_OPTIONS}
        defaultIndicator="jumlah_penduduk_desa_+_kelurahan"
        title="Ranking Kabupaten/Kota"
      />

      {/* Scatter correlation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analisis Korelasi</h3>
          <select value={corrX} onChange={e => setCorrX(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {INDICATOR_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select value={corrY} onChange={e => setCorrY(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {INDICATOR_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="ml-auto text-xs font-mono bg-teal-50 text-teal-700 px-3 py-1 rounded-full">r = {r.toFixed(3)}</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="x" type="number" name={corrX} tick={{ fontSize: 11 }} tickFormatter={v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'jt' : v} />
            <YAxis dataKey="y" type="number" name={corrY} tick={{ fontSize: 11 }} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload
              return (
                <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs">
                  <div className="font-semibold text-gray-700 mb-1">{p.name}</div>
                  <div className="text-gray-500">{corrX}: {fmt(p.x)}</div>
                  <div className="text-gray-500">{corrY}: {fmt(p.y)}</div>
                </div>
              )
            }} />
            <Scatter data={scatterData} fill="#0F8F8B" fillOpacity={0.7} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <InsightBox insights={scatterInsights} />

      <StatPanel
        stats={stats}
        label={indLabel}
        rightElement={
          <select value={indicator} onChange={e => setIndicator(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {INDICATOR_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />

      {statInsights.length > 0 && <InsightBox insights={statInsights} />}

      <CrosstabSection
        data={data}
        variables={INDICATOR_OPTIONS}
        defaultRowVar="jumlah_penduduk_desa_+_kelurahan"
        defaultColVar="kepadatan_penduduk_per_km2_desa_+_kelurahan"
      />

      <DataTable
        data={data}
        columns={[
          { key: 'kabupaten', label: 'Kabupaten/Kota' },
          { key: 'luas_wilayah_km2', label: 'Luas Wilayah (km²)', format: v => v?.toLocaleString('id-ID') },
          { key: 'jumlah_desa_+_kelurahan', label: 'Desa & Kelurahan', format: v => v?.toLocaleString('id-ID') },
          { key: 'jumlah_penduduk_desa_+_kelurahan', label: 'Jumlah Penduduk', format: v => v?.toLocaleString('id-ID') },
          { key: 'jumlah_rumah_tangga_desa_+_kelurahan', label: 'Rumah Tangga', format: v => v?.toLocaleString('id-ID') },
          { key: 'kepadatan_penduduk_per_km2_desa_+_kelurahan', label: 'Kepadatan/km²', format: v => v?.toLocaleString('id-ID') },
        ]}
      />
    </div>
  )
}
