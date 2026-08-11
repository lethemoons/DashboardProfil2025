import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, ScatterChart, Scatter
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'

const OPTIONS = [
  { key: 'tbc_kasus', label: 'TBC — Jumlah Kasus' },
  { key: 'tbc_sukses_pct', label: 'TBC — Sukses Pengobatan (%)' },
  { key: 'pneumonia_balita', label: 'Pneumonia Balita' },
  { key: 'odhiv_baru', label: 'ODHIV Baru Ditemukan' },
  { key: 'arv_pct', label: 'ODHIV Mendapat ARV (%)' },
  { key: 'diare_semua_umur', label: 'Diare Semua Umur' },
  { key: 'diare_balita', label: 'Diare Balita' },
  { key: 'hepatitis_bumil_reaktif', label: 'Hepatitis Bumil Reaktif' },
  { key: 'kusta_pb', label: 'Kusta PB (Pausi Basiler)' },
  { key: 'kusta_mb', label: 'Kusta MB (Multi Basiler)' },
]

export default function PenyakitMenular() {
  const { data: penyakitMenular, loading, error } = useDashboardData()

  const [kab, setKab] = useState('all')
    const [indic, setIndic] = useState('tbc_kasus')
  const [corrX, setCorrX] = useState('tbc_kasus')
  const [corrY, setCorrY] = useState('diare_semua_umur')

  const data = useMemo(() => kab === 'all' ? penyakitMenular.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : penyakitMenular.filter(d => d.kabupaten === kab), [kab, penyakitMenular])

  const totTBC = data.reduce((s, d) => s + (d.tbc_kasus as number), 0)
  const avgTBCSukses = data.length ? data.reduce((s, d) => s + (d.tbc_sukses_pct as number), 0) / data.length : 0
  const totODHIV = data.reduce((s, d) => s + (d.odhiv_baru as number), 0)
  const avgARV = data.length ? data.reduce((s, d) => s + (d.arv_pct as number), 0) / data.length : 0
  const totDiare = data.reduce((s, d) => s + (d.diare_semua_umur as number), 0)
  const totKusta = data.reduce((s, d) => s + (d.kusta_pb as number) + (d.kusta_mb as number), 0)

  const chartData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number)).slice(0, 15)
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = OPTIONS.find(o => o.key === indic)?.label ?? indic
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  // TBC breakdown chart
  const tbcChartData = [...data].sort((a, b) => (b.tbc_kasus as number) - (a.tbc_kasus as number)).slice(0, 12).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    kasus: d.tbc_kasus,
    sukses_pct: d.tbc_sukses_pct,
  }))

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} tertinggi pada ${indicLabel}: ${(maxKab[indic] as number).toLocaleString('id-ID')}.`,
  ] : []

  const scatterInsights = [
    `Korelasi ${OPTIONS.find(o => o.key === corrX)?.label?.split(' —')[0]} vs ${OPTIONS.find(o => o.key === corrY)?.label?.split(' —')[0]}: r = ${r.toFixed(3)}.`,
  ]

  const statInsights = [
    `Total kasus TBC Jawa Timur: ${totTBC.toLocaleString('id-ID')} | Rata-rata sukses pengobatan: ${avgTBCSukses.toFixed(1)}% ${avgTBCSukses >= 85 ? '(≥ target 85% WHO)' : '(< target 85% WHO)'}.`,
    `ODHIV baru ditemukan: ${totODHIV.toLocaleString('id-ID')} | Mendapat ARV rata-rata: ${avgARV.toFixed(1)}%.`,
    `Total diare semua umur: ${totDiare.toLocaleString('id-ID')} | Total kusta (PB+MB): ${totKusta.toLocaleString('id-ID')}.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} onKab={setKab} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Kasus TBC" value={totTBC.toLocaleString('id-ID')} sub="Semua Tipe" icon="🫁" color="#ef4444" />
        <KPICard title="Sukses Pengobatan TBC" value={avgTBCSukses.toFixed(1) + '%'} sub="Rata-rata" icon="✅" color="#0FB0AA" trend={avgTBCSukses >= 85 ? 'up' : 'down'} trendVal={avgTBCSukses >= 85 ? 'Target WHO tercapai' : 'Belum capai target 85%'} />
        <KPICard title="ODHIV Baru" value={totODHIV.toLocaleString('id-ID')} sub="Ditemukan" icon="🔴" color="#8b5cf6" />
        <KPICard title="Kasus Diare" value={totDiare.toLocaleString('id-ID')} sub="Semua Umur" icon="💧" color="#06B5D0" />
      </div>

      {/* TBC dua indikator */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>TBC — Kasus & Sukses Pengobatan (12 Tertinggi)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={tbcChartData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="kasus" name="Kasus TBC" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar yAxisId="right" dataKey="sukses_pct" name="Sukses (%)" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Penyakit Menular Langsung</h3>
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
              {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : i < 5 ? '#f97316' : '#fca5a5'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}

      {/* Korelasi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analisis Korelasi</h3>
          <select value={corrX} onChange={e => setCorrX(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select value={corrY} onChange={e => setCorrY(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0FB0AA' }}>r = {r.toFixed(3)}</span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ScatterChart margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="y" type="number" tick={{ fontSize: 11 }} />
            <Tooltip content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload
              return <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs"><div className="font-semibold mb-1">{p.name}</div><div>X: {p.x?.toLocaleString('id-ID')}</div><div>Y: {p.y?.toLocaleString('id-ID')}</div></div>
            }} />
            <Scatter data={scatterData} fill="#ef4444" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

      <StatPanel stats={stats} label={indicLabel} />
      {statInsights.length > 0 && <InsightBox insights={statInsights} />}

      <CrosstabSection
        data={data}
        variables={OPTIONS}
        defaultRowVar="tbc_kasus"
        defaultColVar="diare_semua_umur"
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'tbc_kasus', label: 'TBC Kasus', format: v => v?.toLocaleString('id-ID') },
        { key: 'tbc_sukses_pct', label: 'TBC Sukses (%)', format: v => v?.toFixed(1) },
        { key: 'odhiv_baru', label: 'ODHIV Baru' },
        { key: 'arv_pct', label: 'ARV (%)', format: v => v?.toFixed(1) },
        { key: 'diare_semua_umur', label: 'Diare', format: v => v?.toLocaleString('id-ID') },
        { key: 'kusta_pb', label: 'Kusta PB' },
        { key: 'kusta_mb', label: 'Kusta MB' },
      ]} />
    </div>
  )
}
