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

const ANAK_OPTIONS = [
  { key: 'stunting_pct', label: 'Prevalensi Stunting (%)' },
  { key: 'gizi_kurang_pct', label: 'Gizi Kurang (%)' },
  { key: 'gizi_buruk_pct', label: 'Gizi Buruk (%)' },
  { key: 'bblr_pct', label: 'BBLR — Bayi Berat Lahir Rendah (%)' },
  { key: 'imunisasi_dasar_lengkap_pct', label: 'Imunisasi Dasar Lengkap (%)' },
  { key: 'imunisasi_campak_pct', label: 'Imunisasi Campak/Rubela (%)' },
  { key: 'imunisasi_dpt_pct', label: 'Imunisasi DPT-HB-Hib (%)' },
  { key: 'asi_eksklusif_pct', label: 'ASI Eksklusif 0–6 Bulan (%)' },
  { key: 'vitamin_a_pct', label: 'Vitamin A Balita (%)' },
  { key: 'kn1_pct', label: 'Kunjungan Neonatus KN1 (%)' },
  { key: 'kn_lengkap_pct', label: 'KN Lengkap (%)' },
]

export default function KesehatanAnak() {
  const { data: kesehatanAnak, loading, error } = useDashboardData()

  const [kab, setKab] = useState('all')
    const [indic, setIndic] = useState('stunting_pct')
  const [corrX, setCorrX] = useState('stunting_pct')
  const [corrY, setCorrY] = useState('gizi_kurang_pct')

  const data = useMemo(() => kab === 'all' ? kesehatanAnak.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : kesehatanAnak.filter(d => d.kabupaten === kab), [kab, kesehatanAnak])

  const totKematianNeonatal = data.reduce((s, d) => s + (d.kematian_neonatal as number), 0)
  const totKematianBayi = data.reduce((s, d) => s + (d.kematian_bayi as number), 0)
  const totKematianBalita = data.reduce((s, d) => s + (d.kematian_balita as number), 0)
  const avgStunting = data.length ? data.reduce((s, d) => s + (d.stunting_pct as number), 0) / data.length : 0
  const avgImunisasi = data.length ? data.reduce((s, d) => s + (d.imunisasi_dasar_lengkap_pct as number), 0) / data.length : 0
  const avgASI = data.length ? data.reduce((s, d) => s + (d.asi_eksklusif_pct as number), 0) / data.length : 0

  const chartData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number)).slice(0, 15)
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = ANAK_OPTIONS.find(o => o.key === indic)?.label ?? indic
  const isNegativeIndic = ['stunting_pct', 'gizi_kurang_pct', 'gizi_buruk_pct', 'bblr_pct'].includes(indic)
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  const chartInsights = maxKab && minKab ? [
    `${isNegativeIndic ? maxKab.kabupaten + ' tertinggi (perlu prioritas)' : minKab.kabupaten + ' terendah (perlu perhatian)'}: ${isNegativeIndic ? (maxKab[indic] as number).toFixed(1) : (minKab[indic] as number).toFixed(1)}%.`,
  ] : []

  const scatterInsights = [
    `Korelasi ${ANAK_OPTIONS.find(o => o.key === corrX)?.label?.split(' ')[0]} vs ${ANAK_OPTIONS.find(o => o.key === corrY)?.label?.split(' ')[0]}: r = ${r.toFixed(3)}.`,
  ]

  const statInsights = [
    `Total kematian neonatal: ${totKematianNeonatal} | bayi: ${totKematianBayi} | balita: ${totKematianBalita}.`,
    `Rata-rata prevalensi stunting: ${avgStunting.toFixed(1)}% — ${avgStunting > 20 ? 'masih di atas batas WHO (20%)' : 'sudah di bawah batas WHO 20%'}.`,
    `Rata-rata imunisasi dasar lengkap: ${avgImunisasi.toFixed(1)}% | ASI eksklusif: ${avgASI.toFixed(1)}%.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} onKab={setKab} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Kematian Neonatal" value={totKematianNeonatal.toLocaleString('id-ID')} sub="Kasus" icon="💔" color="#ef4444" />
        <KPICard title="Kematian Bayi" value={totKematianBayi.toLocaleString('id-ID')} sub="Kasus" icon="👶" color="#f97316" />
        <KPICard title="Stunting Rata-rata" value={avgStunting.toFixed(1) + '%'} icon="📏" color={avgStunting > 20 ? '#f97316' : '#0FB0AA'} trend={avgStunting > 20 ? 'down' : 'up'} trendVal={avgStunting > 20 ? 'Di atas target WHO 20%' : 'Di bawah target WHO 20%'} />
        <KPICard title="Imunisasi Dasar Lengkap" value={avgImunisasi.toFixed(1) + '%'} sub="Rata-rata" icon="💉" color="#0FB0AA" trend={avgImunisasi >= 95 ? 'up' : 'down'} trendVal={avgImunisasi >= 95 ? 'Target tercapai' : 'Perlu peningkatan'} />
      </div>

      {/* Kematian anak stacked */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kematian Neonatal, Bayi & Balita per Kabupaten/Kota</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={[...data].sort((a, b) =>
            ((b.kematian_neonatal as number) + (b.kematian_bayi as number) + (b.kematian_balita as number)) -
            ((a.kematian_neonatal as number) + (a.kematian_bayi as number) + (a.kematian_balita as number))
          ).slice(0, 12).map(d => ({
            kabupaten: d.kabupaten.replace('Kota ', ''),
            neonatal: d.kematian_neonatal,
            bayi: d.kematian_bayi,
            balita: d.kematian_balita,
          }))} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="neonatal" name="Neonatal" stackId="a" fill="#ef4444" />
            <Bar dataKey="bayi" name="Bayi" stackId="a" fill="#f97316" />
            <Bar dataKey="balita" name="Balita" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Kesehatan Anak</h3>
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
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
                const bad = isNegativeIndic ? v > 20 : v < 80
                return <Cell key={i} fill={bad ? '#f97316' : '#0FB0AA'} />
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
            {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select value={corrY} onChange={e => setCorrY(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0FB0AA' }}>r = {r.toFixed(3)} — {Math.abs(r) > 0.7 ? 'kuat' : Math.abs(r) > 0.4 ? 'sedang' : 'lemah'}</span>
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
            <Scatter data={scatterData} fill="#06B5D0" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

      <StatPanel stats={stats} label={indicLabel} format={v => v.toFixed(1) + '%'} />
      {statInsights.length > 0 && <InsightBox insights={statInsights} />}

      <CrosstabSection
        data={data}
        variables={ANAK_OPTIONS}
        defaultRowVar="stunting_pct"
        defaultColVar="gizi_kurang_pct"
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'stunting_pct', label: 'Stunting (%)', format: v => v?.toFixed(1) },
        { key: 'gizi_kurang_pct', label: 'Gizi Kurang (%)', format: v => v?.toFixed(1) },
        { key: 'gizi_buruk_pct', label: 'Gizi Buruk (%)', format: v => v?.toFixed(1) },
        { key: 'bblr_pct', label: 'BBLR (%)', format: v => v?.toFixed(1) },
        { key: 'imunisasi_dasar_lengkap_pct', label: 'Imunisasi (%)', format: v => v?.toFixed(1) },
        { key: 'kematian_neonatal', label: 'Mati Neonatal' },
        { key: 'kematian_bayi', label: 'Mati Bayi' },
        { key: 'kematian_balita', label: 'Mati Balita' },
      ]} />
    </div>
  )
}
