import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'

const PD3I_OPTIONS = [
  { key: 'difteri_kasus', label: 'Difteri — Jumlah Kasus' },
  { key: 'campak_suspek_kasus', label: 'Suspek Campak — Jumlah Kasus' },
  { key: 'pertusis_kasus', label: 'Pertusis — Jumlah Kasus' },
  { key: 'afp_kasus', label: 'Kasus AFP (Non Polio) < 15 Tahun' },
  { key: 'klb_24jam_pct', label: 'KLB Ditangani <24 Jam (%)' },
]



export default function PD3I() {
  const { data: penyakitPD3I, loading, error } = useDashboardData()

  const [pd3iIndic, setPd3iIndic] = useState('difteri_kasus')
  const [pd3iFilter, setPd3iFilter] = useState('10')

  const pd3iData = useMemo(() => penyakitPD3I.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [penyakitPD3I])

  // PD3I stats
  const totDifteri = pd3iData.reduce((s, d) => s + (d.difteri_kasus as number), 0)
  const totCampakSuspek = pd3iData.reduce((s, d) => s + (d.campak_suspek_kasus as number), 0)
  const totPertusis = pd3iData.reduce((s, d) => s + (d.pertusis_kasus as number), 0)
  const avgKLB = pd3iData.length ? pd3iData.reduce((s, d) => s + (d.klb_24jam_pct as number), 0) / pd3iData.length : 0
  const avgAFP = pd3iData.length ? pd3iData.reduce((s, d) => s + (d.afp_kasus as number), 0) / pd3iData.length : 0

  const pd3iSorted = [...pd3iData].sort((a, b) => (b[pd3iIndic] as number) - (a[pd3iIndic] as number))
  const pd3iChart = pd3iFilter === 'all' ? pd3iSorted : pd3iSorted.slice(0, Number(pd3iFilter))

  const pd3iStats = descStats(pd3iData.map(d => d[pd3iIndic] as number))
  const pd3iLabel = PD3I_OPTIONS.find(o => o.key === pd3iIndic)?.label ?? pd3iIndic

  const pd3iInsights = [
    `Total kasus Difteri: ${totDifteri} | Suspek Campak: ${totCampakSuspek} | Pertusis: ${totPertusis}.`,
    `AFP Rate (Non Polio) < 15 Tahun sebesar 6.3 per 100.000 penduduk < 15 tahun.`,
    `KLB ditangani dalam 24 jam mencapai 100%.`,
  ]



  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <KPICard title="Kasus Difteri" value={totDifteri.toLocaleString('id-ID')} sub="CFR Difteri 2.2%" icon="⚠️" color="#0FB0AA" />
            <KPICard title="Kasus Pertusis" value={totPertusis.toLocaleString('id-ID')} sub="CFR Tetanus Neonatorum 52.6%" icon="😮‍💨" color="#0FB0AA" />
            <KPICard title="Kasus Suspek Campak" value={totCampakSuspek.toLocaleString('id-ID')} icon="🔴" color="#0FB0AA" />
            <KPICard title="AFP Rate (Non Polio) < 15 Thn" value="6.3" sub="per 100.000 penduduk < 15 tahun" icon="👶" color="#0FB0AA" />
            <KPICard title="KLB <24 Jam" value="100%" sub="Rata-rata penanganan" icon="🚨" color="#0FB0AA" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>PD3I per Kabupaten/Kota</h3>
              <div className="flex items-center gap-3">
                <select value={pd3iIndic} onChange={e => setPd3iIndic(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                  {PD3I_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
                <select value={pd3iFilter} onChange={e => setPd3iFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                  <option value="10">Top 10</option>
                  <option value="20">Top 20</option>
                  <option value="all">Keseluruhan</option>
                </select>
              </div>
            </div>
            <div className="w-full overflow-x-auto pb-4">
              <div style={{ minWidth: pd3iFilter === 'all' ? 800 : '100%', height: pd3iFilter === 'all' ? 800 : (pd3iFilter === '20' ? 600 : 400) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pd3iChart} layout="vertical" margin={{ left: 95, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey={pd3iIndic} name={pd3iLabel} fill="#0FB0AA" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <StatPanel
            stats={pd3iStats}
            label={pd3iLabel}
            rightElement={
              <select value={pd3iIndic} onChange={e => setPd3iIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
                {PD3I_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            }
          />
          <InsightBox insights={pd3iInsights} />

          <DataTable data={pd3iData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'difteri_kasus', label: 'Difteri' },
            { key: 'campak_suspek_kasus', label: 'Suspek Campak' },
            { key: 'pertusis_kasus', label: 'Pertusis' },
            { key: 'afp_kasus', label: 'Kasus AFP (Non Polio)', format: v => v?.toFixed(1) },
            { key: 'klb_24jam_pct', label: 'KLB <24jam (%)', format: v => v?.toFixed(1) },
          ]} />
    </div>
  )
}
