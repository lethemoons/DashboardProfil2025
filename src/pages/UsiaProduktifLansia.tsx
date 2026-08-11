import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell
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
  { key: 'produktif_laki', label: 'Usia Produktif Laki-laki' },
  { key: 'produktif_perempuan', label: 'Usia Produktif Perempuan' },
  { key: 'lansia_dilayani', label: 'Lansia Dilayani (60+)' },
  { key: 'catin_laki', label: 'Calon Pengantin Laki-laki' },
  { key: 'catin_perempuan', label: 'Calon Pengantin Perempuan' },
  { key: 'posyandu_lansia', label: 'Posyandu Lansia (unit)' },
]

export default function UsiaProduktifLansia() {
  const { data: usiaProduktif, loading, error } = useDashboardData()

  const [indic, setIndic] = useState('lansia_dilayani')

  const data = useMemo(() => usiaProduktif.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [usiaProduktif])

  const totLaki = data.reduce((s, d) => s + (d.produktif_laki as number), 0)
  const totPerempuan = data.reduce((s, d) => s + (d.produktif_perempuan as number), 0)
  const totLansia = data.reduce((s, d) => s + (d.lansia_dilayani as number), 0)
  const totPosyanduLansia = data.reduce((s, d) => s + (d.posyandu_lansia as number), 0)
  const totCatin = data.reduce((s, d) => s + (d.catin_laki as number) + (d.catin_perempuan as number), 0)

  const chartData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number)).slice(0, 15)
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = OPTIONS.find(o => o.key === indic)?.label ?? indic
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  // Gender comparison top 10
  const genderData = data.slice(0, 10).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    laki: d.produktif_laki,
    perempuan: d.produktif_perempuan,
  }))

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} memiliki ${indicLabel} tertinggi (${(maxKab[indic] as number).toLocaleString('id-ID')}).`,
  ] : []

  const statInsights = [
    `Total usia produktif (L+P): ${(totLaki + totPerempuan).toLocaleString('id-ID')} jiwa.`,
    `Total lansia (60+) dilayani: ${totLansia.toLocaleString('id-ID')} | Posyandu lansia: ${totPosyanduLansia.toLocaleString('id-ID')} unit.`,
    `Total calon pengantin terlayani: ${totCatin.toLocaleString('id-ID')} orang.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Usia Produktif L" value={(totLaki / 1e6).toFixed(2) + ' jt'} sub="Jiwa" icon="👨" color="#0FB0AA" />
        <KPICard title="Usia Produktif P" value={(totPerempuan / 1e6).toFixed(2) + ' jt'} sub="Jiwa" icon="👩" color="#06B5D0" />
        <KPICard title="Lansia Dilayani" value={totLansia.toLocaleString('id-ID')} sub="Usia 60+" icon="👴" color="#CBD92C" />
        <KPICard title="Posyandu Lansia" value={totPosyanduLansia.toLocaleString('id-ID')} sub="Unit" icon="🌿" color="#8b5cf6" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pelayanan Usia Produktif & Lansia</h3>
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1e6 ? (v / 1e6).toFixed(1) + 'jt' : v?.toLocaleString('id-ID')} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
            <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]}>
              {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#0FB0AA' : i < 3 ? '#06B5D0' : '#93c5c3'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}

      {/* Gender comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Usia Produktif Laki-laki vs Perempuan (10 Kab Terbesar)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={genderData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1e3).toFixed(0) + 'rb'} />
            <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="laki" name="Laki-laki" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
            <Bar dataKey="perempuan" name="Perempuan" fill="#CBD92C" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <StatPanel
        stats={stats}
        label={indicLabel}
        rightElement={
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />
      

      <CrosstabSection
        data={data}
        variables={OPTIONS}
        defaultRowVar="lansia_dilayani"
        defaultColVar="posyandu_lansia"
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'produktif_laki', label: 'Produktif L', format: v => v?.toLocaleString('id-ID') },
        { key: 'produktif_perempuan', label: 'Produktif P', format: v => v?.toLocaleString('id-ID') },
        { key: 'lansia_dilayani', label: 'Lansia Dilayani', format: v => v?.toLocaleString('id-ID') },
        { key: 'catin_laki', label: 'Catin L', format: v => v?.toLocaleString('id-ID') },
        { key: 'catin_perempuan', label: 'Catin P', format: v => v?.toLocaleString('id-ID') },
        { key: 'posyandu_lansia', label: 'Posyandu Lansia', format: v => v?.toLocaleString('id-ID') },
      ]} />
    </div>
  )
}
