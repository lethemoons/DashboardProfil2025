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

const IBU_OPTIONS = [
  { key: 'k1_pct', label: 'Cakupan K1 (%)' },
  { key: 'k6_pct', label: 'Cakupan K6 (%)' },
  { key: 'persalinan_fasyankes_pct', label: 'Persalinan di Fasyankes (%)' },
  { key: 'fe_tablet_pct', label: 'Tablet FE Ibu Hamil (%)' },
  { key: 'bumil_kek_pct', label: 'Bumil KEK (%)' },
  { key: 'kb_aktif_pct', label: 'KB Aktif Modern (%)' },
  { key: 'td2plus_pct', label: 'Imunisasi Td2+ (%)' },
  { key: 'asi_eksklusif_pct', label: 'ASI Eksklusif (%)' },
]

export default function KesehatanIbu() {
  const { data: kesehatanIbu, loading, error } = useDashboardData()

  const [kab, setKab] = useState('all')
    const [indic, setIndic] = useState('k1_pct')
  const [corrX, setCorrX] = useState('k1_pct')
  const [corrY, setCorrY] = useState('persalinan_fasyankes_pct')

  const data = useMemo(() => kab === 'all' ? kesehatanIbu.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : kesehatanIbu.filter(d => d.kabupaten === kab), [kab, kesehatanIbu])

  const totKematianIbu = data.reduce((s, d) =>
    s + (d.kematian_ibu_hamil as number) + (d.kematian_ibu_bersalin as number) + (d.kematian_ibu_nifas as number), 0)
  const avgK1 = data.length ? data.reduce((s, d) => s + (d.k1_pct as number), 0) / data.length : 0
  const avgK6 = data.length ? data.reduce((s, d) => s + (d.k6_pct as number), 0) / data.length : 0
  const avgFasyankes = data.length ? data.reduce((s, d) => s + (d.persalinan_fasyankes_pct as number), 0) / data.length : 0
  const avgKB = data.length ? data.reduce((s, d) => s + (d.kb_aktif_pct as number), 0) / data.length : 0
  const avgKEK = data.length ? data.reduce((s, d) => s + (d.bumil_kek_pct as number), 0) / data.length : 0

  const chartData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number)).slice(0, 15)
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = IBU_OPTIONS.find(o => o.key === indic)?.label ?? indic
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  const kematianDetail = [
    { label: 'Saat Hamil', value: data.reduce((s, d) => s + (d.kematian_ibu_hamil as number), 0), color: '#ef4444' },
    { label: 'Saat Bersalin', value: data.reduce((s, d) => s + (d.kematian_ibu_bersalin as number), 0), color: '#f97316' },
    { label: 'Saat Nifas', value: data.reduce((s, d) => s + (d.kematian_ibu_nifas as number), 0), color: '#fbbf24' },
  ]

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} tertinggi pada ${indicLabel}: ${(maxKab[indic] as number).toFixed(1)}%.`,
    `${minKab.kabupaten} terendah: ${(minKab[indic] as number).toFixed(1)}% — perlu perhatian khusus.`,
  ] : []

  const scatterInsights = [
    `Korelasi: Terdapat hubungan antara ${corrX.toUpperCase()} dan ${corrY.toUpperCase()} dengan r = ${r.toFixed(3)}.`,
  ]

  const statInsights = [
    `Total kematian ibu: ${totKematianIbu} kasus (hamil: ${kematianDetail[0].value}, bersalin: ${kematianDetail[1].value}, nifas: ${kematianDetail[2].value}).`,
    `Rata-rata K1: ${avgK1.toFixed(1)}% | K6: ${avgK6.toFixed(1)}% | Persalinan Fasyankes: ${avgFasyankes.toFixed(1)}%.`,
    `Rata-rata KB aktif: ${avgKB.toFixed(1)}% | Bumil KEK: ${avgKEK.toFixed(1)}%.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} onKab={setKab} />

      {/* Kematian ibu cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Kematian Ibu" value={totKematianIbu} sub="Hamil + Bersalin + Nifas" icon="❤️" color="#ef4444" />
        <KPICard title="K1 Rata-rata" value={avgK1.toFixed(1) + '%'} sub="Cakupan Kunjungan Pertama" icon="🤰" color="#0FB0AA" trend={avgK1 >= 95 ? 'up' : 'down'} trendVal={avgK1 >= 95 ? 'Target tercapai' : 'Perlu peningkatan'} />
        <KPICard title="K6 Rata-rata" value={avgK6.toFixed(1) + '%'} sub="Kunjungan Lengkap" icon="📋" color="#06B5D0" trend={avgK6 >= 90 ? 'up' : 'down'} trendVal={avgK6 >= 90 ? 'Target tercapai' : 'Perlu peningkatan'} />
        <KPICard title="Bumil KEK" value={avgKEK.toFixed(1) + '%'} sub="Rata-rata" icon="⚠️" color="#f97316" trend={avgKEK <= 10 ? 'up' : 'down'} trendVal={avgKEK <= 10 ? 'Baik' : 'Perlu intervensi'} />
      </div>

      {/* Kematian ibu breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kematian Ibu per Kabupaten/Kota</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={[...data].sort((a, b) =>
            ((b.kematian_ibu_hamil as number) + (b.kematian_ibu_bersalin as number) + (b.kematian_ibu_nifas as number)) -
            ((a.kematian_ibu_hamil as number) + (a.kematian_ibu_bersalin as number) + (a.kematian_ibu_nifas as number))
          ).slice(0, 12).map(d => ({
            kabupaten: d.kabupaten.replace('Kota ', ''),
            hamil: d.kematian_ibu_hamil,
            bersalin: d.kematian_ibu_bersalin,
            nifas: d.kematian_ibu_nifas,
          }))} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="hamil" name="Saat Hamil" stackId="a" fill="#ef4444" />
            <Bar dataKey="bersalin" name="Saat Bersalin" stackId="a" fill="#f97316" />
            <Bar dataKey="nifas" name="Saat Nifas" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cakupan layanan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Pelayanan Ibu</h3>
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {IBU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
            <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]}>
              {chartData.map((d, i) => {
                const v = d[indic] as number
                const isKEK = indic === 'bumil_kek_pct'
                const ok = isKEK ? v <= 15 : v >= 80
                return <Cell key={i} fill={ok ? '#0FB0AA' : '#f97316'} />
              })}
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
            {IBU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select value={corrY} onChange={e => setCorrY(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {IBU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
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
              return <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs"><div className="font-semibold mb-1">{p.name}</div><div>X: {p.x?.toFixed(1)}%</div><div>Y: {p.y?.toFixed(1)}%</div></div>
            }} />
            <Scatter data={scatterData} fill="#0FB0AA" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

      <StatPanel stats={stats} label={indicLabel} format={v => v.toFixed(1) + '%'} />
      {statInsights.length > 0 && <InsightBox insights={statInsights} />}

      <CrosstabSection
        data={data}
        variables={IBU_OPTIONS}
        defaultRowVar="k1_pct"
        defaultColVar="persalinan_fasyankes_pct"
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'k1_pct', label: 'K1 (%)', format: v => v?.toFixed(1) },
        { key: 'k6_pct', label: 'K6 (%)', format: v => v?.toFixed(1) },
        { key: 'persalinan_fasyankes_pct', label: 'Persalinan Fasyankes (%)', format: v => v?.toFixed(1) },
        { key: 'bumil_kek_pct', label: 'Bumil KEK (%)', format: v => v?.toFixed(1) },
        { key: 'kb_aktif_pct', label: 'KB Aktif (%)', format: v => v?.toFixed(1) },
        { key: 'kematian_ibu_hamil', label: 'Mati Hamil' },
        { key: 'kematian_ibu_bersalin', label: 'Mati Bersalin' },
        { key: 'kematian_ibu_nifas', label: 'Mati Nifas' },
      ]} />
    </div>
  )
}
