import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell, ScatterChart, Scatter
, LabelList } from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'
import { useAuth } from '../contexts/AuthContext'

const MENULAR_OPTIONS = [
  { key: 'tbc_kasus', label: 'TBC - Kasus' },
  { key: 'tbc_sukses_pct', label: 'TBC - Sukses Pengobatan (%)' },
  { key: 'pneumonia_balita', label: 'Pneumonia Balita' },
  { key: 'odhiv_baru', label: 'ODHIV Baru' },
  { key: 'diare_semua_umur', label: 'Diare Semua Umur' },
  { key: 'kusta_mb', label: 'Kusta MB' },
]

const VEKTOR_OPTIONS = [
  { key: 'dbd_kasus', label: 'DBD - Kasus' },
  { key: 'dbd_cfr', label: 'DBD - CFR (%)' },
  { key: 'malaria_positif', label: 'Malaria Positif' },
  { key: 'filariasis_kronis', label: 'Filariasis Kronis' },
]

const PTM_OPTIONS = [
  { key: 'hipertensi_laki', label: 'Hipertensi Laki-laki' },
  { key: 'hipertensi_perempuan', label: 'Hipertensi Perempuan' },
  { key: 'dm_terdiagnosis', label: 'Diabetes Melitus' },
  { key: 'dm_terkendali_pct', label: 'DM Terkendali (%)' },
  { key: 'jiwa_skizofrenia', label: 'Skizofrenia' },
]

export default function PengendalianPenyakit({ sub = '6.1' }: { sub?: string }) {
  const { data: rawData, loading, error } = useDashboardData()
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<'menular' | 'pd3i' | 'vektor' | 'ptm'>(sub === '6.1' ? 'menular' : sub === '6.2' ? 'pd3i' : sub === '6.3' ? 'vektor' : 'ptm')
  const [menularIndic, setMenularIndic] = useState('tbc_kasus')
  const [vektorIndic, setVektorIndic] = useState('dbd_kasus')
  const [ptmIndic, setPtmIndic] = useState('hipertensi_laki')

  const menularData = useMemo(() => (rawData || []).filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [rawData])
  const pd3iData = useMemo(() => (rawData || []).filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [rawData])
  const ptmData = useMemo(() => (rawData || []).filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [rawData])



  const totTBC = menularData.reduce((s, d) => s + (d.tbc_kasus as number), 0)
  const avgTBCSukses = menularData.length ? menularData.reduce((s, d) => s + (d.tbc_sukses_pct as number), 0) / menularData.length : 0
  const totDBD = pd3iData.reduce((s, d) => s + (d.dbd_kasus as number), 0)
  const totHipertensi = ptmData.reduce((s, d) => s + (d.hipertensi_laki as number) + (d.hipertensi_perempuan as number), 0)

  const menularChart = [...menularData].sort((a, b) => (b[menularIndic] as number) - (a[menularIndic] as number)).slice(0, 15)
  const pd3iChart = [...pd3iData].sort((a, b) => (b.dbd_kasus as number) - (a.dbd_kasus as number)).slice(0, 12)
  const ptmChart = [...ptmData].sort((a, b) => (b[ptmIndic] as number) - (a[ptmIndic] as number)).slice(0, 15)

  const menularLabel = MENULAR_OPTIONS.find(o => o.key === menularIndic)?.label ?? menularIndic
  const stats = descStats(menularData.map(d => d[menularIndic] as number))
  const maxKab = menularData.length ? menularData.reduce((a, b) => (a[menularIndic] as number) > (b[menularIndic] as number) ? a : b) : null

  const menularChartInsights = maxKab ? [
    `${maxKab.kabupaten} memiliki ${menularLabel} tertinggi (${(maxKab[menularIndic] as number).toLocaleString('id-ID')}).`,
  ] : []

  const menularStatInsights = [
    `Total kasus TBC Jawa Timur: ${totTBC.toLocaleString('id-ID')} | Sukses pengobatan rata-rata: ${avgTBCSukses.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%.`,
    `Total kasus DBD: ${totDBD.toLocaleString('id-ID')}.`,
    `Total kasus hipertensi (L+P): ${totHipertensi.toLocaleString('id-ID')}.`,
  ]

  const TABS = [
    { id: 'menular', label: '6.1 Peny. Menular' },
    { id: 'pd3i', label: '6.2 PD3I' },
    { id: 'vektor', label: '6.3 Tular Vektor' },
    { id: 'ptm', label: 'PTM' },
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      <div className="flex gap-2 pb-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${tab === t.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500 hover:text-teal-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'menular' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Kasus TBC" value={totTBC.toLocaleString('id-ID')} icon="🫁" color="#f97316" />
            <KPICard title="Sukses Pengobatan TBC" value={avgTBCSukses.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} sub="Rata-rata" icon="✅" color="#0F8F8B" />
            <KPICard title="ODHIV Baru" value={menularData.reduce((s, d) => s + (d.odhiv_baru as number), 0).toLocaleString('id-ID')} icon="🔴" color="#ef4444" />
            <KPICard title="Diare Semua Umur" value={menularData.reduce((s, d) => s + (d.diare_semua_umur as number), 0).toLocaleString('id-ID')} icon="💧" color="#078FA5" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Penyakit Menular Langsung</h3>
              <select value={menularIndic} onChange={e => setMenularIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {MENULAR_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={menularChart} layout="vertical" margin={{ left: 95, right: 80 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={menularIndic} radius={[0, 6, 6, 0]}>
                  {menularChart.map((_, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : i < 5 ? '#fca5a5' : '#fee2e2'} />)}
                <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {menularChartInsights.length > 0 && <InsightBox insights={menularChartInsights} />}
          <StatPanel
            stats={stats}
            label={menularLabel}
            rightElement={
              <select value={menularIndic} onChange={e => setMenularIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
                {MENULAR_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            }
          />
          {menularStatInsights.length > 0 && <InsightBox insights={menularStatInsights} />}
          {isAdmin && (
            <CrosstabSection
              data={menularData}
              variables={MENULAR_OPTIONS}
              defaultRowVar="tbc_kasus"
              defaultColVar="diare_semua_umur"
              title="Analisis Crosstab Penyakit Menular"
            />
          )}
          <DataTable data={menularData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'tbc_kasus', label: 'TBC Kasus', format: v => v?.toLocaleString('id-ID') },
            { key: 'tbc_sukses_pct', label: 'TBC Sukses (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
            { key: 'odhiv_baru', label: 'ODHIV Baru', format: v => v?.toLocaleString('id-ID') },
            { key: 'diare_semua_umur', label: 'Diare', format: v => v?.toLocaleString('id-ID') },
            { key: 'kusta_mb', label: 'Kusta MB', format: v => v?.toLocaleString('id-ID') },
          ]} />
        </>
      )}

      {tab === 'pd3i' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard title="Total Kasus Difteri" value={pd3iData.reduce((s, d) => s + (d.difteri_kasus as number), 0)} icon="⚠️" color="#f97316" />
            <KPICard title="Kasus Campak" value={pd3iData.reduce((s, d) => s + (d.campak_kasus as number), 0)} icon="🔴" color="#ef4444" />
            <KPICard title="KLB <24 Jam" value={(pd3iData.reduce((s, d) => s + (d.klb_24jam_pct as number), 0) / Math.max(pd3iData.length, 1)).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} sub="Rata-rata" icon="🚨" color="#0F8F8B" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>DBD — Top Kabupaten</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pd3iChart} layout="vertical" margin={{ left: 95, right: 80 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="dbd_kasus" name="Kasus DBD" radius={[0, 6, 6, 0]}>
                  {pd3iChart.map((_, i) => <Cell key={i} fill={i === 0 ? '#ef4444' : '#fca5a5'} />)}
                <LabelList dataKey="dbd_kasus" position="right" style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBox insights={[
            `Total kasus DBD: ${totDBD.toLocaleString('id-ID')}.`,
            `Kasus malaria positif: ${pd3iData.reduce((s, d) => s + (d.malaria_positif as number), 0).toLocaleString('id-ID')}.`,
          ]} />
          {isAdmin && (
            <CrosstabSection
              data={pd3iData}
              title="Analisis Crosstab DBD & Imunisasi"
            />
          )}
          <DataTable data={pd3iData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'difteri_kasus', label: 'Difteri' },
            { key: 'campak_kasus', label: 'Campak' },
            { key: 'dbd_kasus', label: 'DBD', format: v => v?.toLocaleString('id-ID') },
            { key: 'dbd_cfr', label: 'DBD CFR (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
            { key: 'malaria_positif', label: 'Malaria Positif' },
            { key: 'klb_24jam_pct', label: 'KLB <24jam (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
          ]} />
        </>
      )}

      {tab === 'vektor' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Kasus DBD" value={totDBD.toLocaleString('id-ID')} icon="🦟" color="#ef4444" />
            <KPICard title="Malaria Positif" value={pd3iData.reduce((s, d) => s + (d.malaria_positif as number), 0).toLocaleString('id-ID')} icon="🦠" color="#f97316" />
            <KPICard title="Filariasis Kronis" value={pd3iData.reduce((s, d) => s + (d.filariasis_kronis as number), 0).toLocaleString('id-ID')} icon="🌊" color="#078FA5" />
            <KPICard title="DBD CFR Rata-rata" value={(pd3iData.reduce((s, d) => s + (d.dbd_cfr as number), 0) / Math.max(pd3iData.length, 1)).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'} icon="📊" color="#9EAF24" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Penyakit Tular Vektor</h3>
              <select value={vektorIndic} onChange={e => setVektorIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {VEKTOR_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[...pd3iData].sort((a, b) => (b[vektorIndic] as number) - (a[vektorIndic] as number)).slice(0, 15)} layout="vertical" margin={{ left: 95, right: 80 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={vektorIndic} radius={[0, 6, 6, 0]} fill="#ef4444" ><LabelList dataKey={vektorIndic} position="top" style={{ fontSize: 9, fill: '#374151', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBox insights={[`Total DBD: ${totDBD.toLocaleString('id-ID')} | Filariasis: ${pd3iData.reduce((s, d) => s + (d.filariasis_kronis as number), 0)} kasus.`]} />
          {isAdmin && (
            <CrosstabSection
              data={pd3iData}
              variables={VEKTOR_OPTIONS}
              defaultRowVar="dbd_kasus"
              defaultColVar="dbd_cfr"
              title="Analisis Crosstab Penyakit Tular Vektor"
            />
          )}
        </>
      )}

      {tab === 'ptm' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Hipertensi Total" value={totHipertensi.toLocaleString('id-ID')} icon="❤️" color="#ef4444" />
            <KPICard title="DM Terdiagnosis" value={ptmData.reduce((s, d) => s + (d.dm_terdiagnosis as number), 0).toLocaleString('id-ID')} icon="🩸" color="#f97316" />
            <KPICard title="DM Terkendali" value={(ptmData.reduce((s, d) => s + (d.dm_terkendali_pct as number), 0) / Math.max(ptmData.length, 1)).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} sub="Rata-rata" icon="✅" color="#0F8F8B" />
            <KPICard title="Skizofrenia" value={ptmData.reduce((s, d) => s + (d.jiwa_skizofrenia as number), 0).toLocaleString('id-ID')} icon="🧠" color="#8b5cf6" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Penyakit Tidak Menular</h3>
              <select value={ptmIndic} onChange={e => setPtmIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {PTM_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ptmChart} layout="vertical" margin={{ left: 95, right: 80 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={ptmIndic} radius={[0, 6, 6, 0]}>
                  {ptmChart.map((_, i) => <Cell key={i} fill={i === 0 ? '#8b5cf6' : '#c4b5fd'} />)}
                <LabelList dataKey="value" position="right" style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBox insights={[
            `Total kasus hipertensi (L+P): ${totHipertensi.toLocaleString('id-ID')}.`,
            `Total DM terdiagnosis: ${ptmData.reduce((s, d) => s + (d.dm_terdiagnosis as number), 0).toLocaleString('id-ID')}.`,
          ]} />
          {isAdmin && (
            <CrosstabSection
              data={ptmData}
              variables={PTM_OPTIONS}
              defaultRowVar="hipertensi_laki"
              defaultColVar="dm_terdiagnosis"
              title="Analisis Crosstab Penyakit Tidak Menular"
            />
          )}
          <DataTable data={ptmData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'hipertensi_laki', label: 'Hipertensi L', format: v => v?.toLocaleString('id-ID') },
            { key: 'hipertensi_perempuan', label: 'Hipertensi P', format: v => v?.toLocaleString('id-ID') },
            { key: 'dm_terdiagnosis', label: 'DM Diagnosis', format: v => v?.toLocaleString('id-ID') },
            { key: 'dm_terkendali_pct', label: 'DM Terkendali (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
            { key: 'jiwa_skizofrenia', label: 'Skizofrenia', format: v => v?.toLocaleString('id-ID') },
          ]} />
        </>
      )}
    </div>
  )
}
