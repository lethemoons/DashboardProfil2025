import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, ScatterChart, Scatter, ComposedChart, Line
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'

const OPTIONS = [
  { key: 'dbd_kasus', label: 'DBD — Jumlah Kasus' },
  { key: 'dbd_cfr', label: 'DBD — CFR / Case Fatality Rate (%)' },
  { key: 'malaria_positif', label: 'Malaria Positif' },
  { key: 'filariasis_kronis', label: 'Filariasis Kronis' },
]

export default function TularVektor() {
  const { data: penyakitPD3I, loading, error } = useDashboardData()

  const [kab, setKab] = useState('all')
  const [tahun, setTahun] = useState('2025')
  const [indic, setIndic] = useState('dbd_kasus')

  const data = useMemo(() => kab === 'all' ? penyakitPD3I.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : penyakitPD3I.filter(d => d.kabupaten === kab), [kab, penyakitPD3I])

  const totDBD = data.reduce((s, d) => s + (d.dbd_kasus as number), 0)
  const avgCFR = data.length ? data.reduce((s, d) => s + (d.dbd_cfr as number), 0) / data.length : 0
  const totMalaria = data.reduce((s, d) => s + (d.malaria_positif as number), 0)
  const totFilariasis = data.reduce((s, d) => s + (d.filariasis_kronis as number), 0)

  const chartData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number)).slice(0, 15)
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = OPTIONS.find(o => o.key === indic)?.label ?? indic
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  // DBD kasus + CFR dual axis
  const dbdDual = [...data].sort((a, b) => (b.dbd_kasus as number) - (a.dbd_kasus as number)).slice(0, 12).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    kasus: d.dbd_kasus,
    cfr: d.dbd_cfr,
  }))

  // Correlation DBD kasus vs CFR
  const scatterData = data.map(d => ({ x: d.dbd_kasus as number, y: d.dbd_cfr as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} tertinggi untuk ${indicLabel}: ${(maxKab[indic] as number).toLocaleString('id-ID')}.`,
  ] : []

  const scatterInsights = [
    `Korelasi kasus DBD vs CFR: r = ${r.toFixed(3)} (${Math.abs(r) > 0.7 ? 'kuat' : Math.abs(r) > 0.4 ? 'sedang' : 'lemah'}).`,
  ]

  const statInsights = [
    `Total kasus DBD Jawa Timur: ${totDBD.toLocaleString('id-ID')} kasus.`,
    `Rata-rata CFR DBD: ${avgCFR.toFixed(2)}% — ${avgCFR <= 1 ? 'masih dalam batas toleransi (≤1%)' : 'melebihi batas toleransi CFR 1%'}.`,
    `Total malaria positif: ${totMalaria.toLocaleString('id-ID')} | Filariasis kronis: ${totFilariasis.toLocaleString('id-ID')} kasus.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} tahun={tahun} onKab={setKab} onTahun={setTahun} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Kasus DBD" value={totDBD.toLocaleString('id-ID')} sub="Demam Berdarah Dengue" icon="🦟" color="#ef4444" />
        <KPICard title="CFR DBD Rata-rata" value={avgCFR.toFixed(2) + '%'} sub="Case Fatality Rate" icon="📊" color={avgCFR > 1 ? '#ef4444' : '#0FB0AA'} trend={avgCFR <= 1 ? 'up' : 'down'} trendVal={avgCFR <= 1 ? 'Batas CFR ≤1% terpenuhi' : 'CFR melebihi batas 1%'} />
        <KPICard title="Malaria Positif" value={totMalaria.toLocaleString('id-ID')} sub="Kasus" icon="🦠" color="#f97316" />
        <KPICard title="Filariasis Kronis" value={totFilariasis.toLocaleString('id-ID')} sub="Kasus" icon="🌊" color="#06B5D0" />
      </div>

      {/* DBD dual axis */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>DBD — Kasus & CFR per Kabupaten/Kota (12 Tertinggi)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={dbdDual} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" domain={[0, 5]} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="kasus" name="Kasus DBD" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="cfr" name="CFR (%)" stroke="#CBD92C" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Main chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Penyakit Tular Vektor & Zoonotik</h3>
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : i < 3 ? '#f97316' : '#fca5a5'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}

      {/* Korelasi DBD kasus vs CFR */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Korelasi Kasus DBD vs CFR</h3>
          <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0FB0AA' }}>r = {r.toFixed(3)}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="x" type="number" name="Kasus DBD" tick={{ fontSize: 11 }} label={{ value: 'Kasus DBD', position: 'insideBottom', offset: -5, fontSize: 11 }} />
            <YAxis dataKey="y" type="number" name="CFR" tick={{ fontSize: 11 }} label={{ value: 'CFR (%)', angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload
              return <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs"><div className="font-semibold mb-1">{p.name}</div><div>Kasus: {p.x?.toLocaleString('id-ID')}</div><div>CFR: {p.y?.toFixed(2)}%</div></div>
            }} />
            <Scatter data={scatterData} fill="#ef4444" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

      <StatPanel stats={stats} label={indicLabel} />
      {statInsights.length > 0 && <InsightBox insights={statInsights} />}
      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'dbd_kasus', label: 'Kasus DBD', format: v => v?.toLocaleString('id-ID') },
        { key: 'dbd_cfr', label: 'CFR DBD (%)', format: v => v?.toFixed(2) },
        { key: 'malaria_positif', label: 'Malaria Positif' },
        { key: 'filariasis_kronis', label: 'Filariasis Kronis' },
      ]} />
    </div>
  )
}
