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
import CrosstabSection from '../components/CrosstabSection'

const PD3I_OPTIONS = [
  { key: 'difteri_kasus', label: 'Difteri — Jumlah Kasus' },
  { key: 'campak_kasus', label: 'Campak — Jumlah Kasus' },
  { key: 'pertusis_kasus', label: 'Pertusis — Jumlah Kasus' },
  { key: 'afp_rate', label: 'AFP Rate (per 100.000 anak <15 th)' },
  { key: 'klb_24jam_pct', label: 'KLB Ditangani <24 Jam (%)' },
]

const PTM_OPTIONS = [
  { key: 'hipertensi_laki', label: 'Hipertensi — Laki-laki' },
  { key: 'hipertensi_perempuan', label: 'Hipertensi — Perempuan' },
  { key: 'dm_terdiagnosis', label: 'Diabetes Melitus Terdiagnosis' },
  { key: 'dm_terkendali_pct', label: 'DM Terkendali (%)' },
  { key: 'jiwa_skizofrenia', label: 'Gangguan Jiwa — Skizofrenia' },
  { key: 'jiwa_psikotik', label: 'Gangguan Jiwa — Psikotik Akut' },
]

export default function PD3I() {
  const { data: penyakitPD3I, loading, error } = useDashboardData()
  const ptm = penyakitPD3I

  const [kab, setKab] = useState('all')
  const [tahun, setTahun] = useState('2025')
  const [pd3iIndic, setPd3iIndic] = useState('difteri_kasus')
  const [ptmIndic, setPtmIndic] = useState('hipertensi_laki')
  const [activeSection, setActiveSection] = useState<'pd3i' | 'ptm'>('pd3i')

  const pd3iData = useMemo(() => kab === 'all' ? penyakitPD3I.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : penyakitPD3I.filter(d => d.kabupaten === kab), [kab, penyakitPD3I])
  const ptmData = useMemo(() => kab === 'all' ? ptm.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : ptm.filter(d => d.kabupaten === kab), [kab, ptm])

  // PD3I stats
  const totDifteri = pd3iData.reduce((s, d) => s + (d.difteri_kasus as number), 0)
  const totCampak = pd3iData.reduce((s, d) => s + (d.campak_kasus as number), 0)
  const totPertusis = pd3iData.reduce((s, d) => s + (d.pertusis_kasus as number), 0)
  const avgKLB = pd3iData.length ? pd3iData.reduce((s, d) => s + (d.klb_24jam_pct as number), 0) / pd3iData.length : 0
  const avgAFP = pd3iData.length ? pd3iData.reduce((s, d) => s + (d.afp_rate as number), 0) / pd3iData.length : 0

  // PTM stats
  const totHipertensi = ptmData.reduce((s, d) => s + (d.hipertensi_laki as number) + (d.hipertensi_perempuan as number), 0)
  const totDM = ptmData.reduce((s, d) => s + (d.dm_terdiagnosis as number), 0)
  const avgDMTerkendali = ptmData.length ? ptmData.reduce((s, d) => s + (d.dm_terkendali_pct as number), 0) / ptmData.length : 0
  const totSkizo = ptmData.reduce((s, d) => s + (d.jiwa_skizofrenia as number), 0)

  const pd3iChart = [...pd3iData].sort((a, b) => (b[pd3iIndic] as number) - (a[pd3iIndic] as number)).slice(0, 15)
  const ptmChart = [...ptmData].sort((a, b) => (b[ptmIndic] as number) - (a[ptmIndic] as number)).slice(0, 15)

  const pd3iStats = descStats(pd3iData.map(d => d[pd3iIndic] as number))
  const ptmStats = descStats(ptmData.map(d => d[ptmIndic] as number))
  const pd3iLabel = PD3I_OPTIONS.find(o => o.key === pd3iIndic)?.label ?? pd3iIndic
  const ptmLabel = PTM_OPTIONS.find(o => o.key === ptmIndic)?.label ?? ptmIndic

  // Hipertensi gender comparison
  const hipertensiGender = ptmData.slice(0, 10).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    laki: d.hipertensi_laki,
    perempuan: d.hipertensi_perempuan,
  }))

  const pd3iInsights = [
    `Total kasus Difteri: ${totDifteri} | Campak: ${totCampak} | Pertusis: ${totPertusis}.`,
    `Rata-rata AFP Rate: ${avgAFP.toFixed(2)} per 100.000 anak <15 tahun.`,
    `Rata-rata KLB ditangani dalam 24 jam: ${avgKLB.toFixed(1)}% ${avgKLB >= 100 ? '(semua KLB tertangani)' : '(belum semua KLB tertangani tepat waktu)'}.`,
  ]

  const ptmInsights = [
    `Total hipertensi (L+P): ${totHipertensi.toLocaleString('id-ID')} kasus.`,
    `Total DM terdiagnosis: ${totDM.toLocaleString('id-ID')} | DM terkendali: ${avgDMTerkendali.toFixed(1)}% rata-rata.`,
    `Total skizofrenia: ${totSkizo.toLocaleString('id-ID')} kasus.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} tahun={tahun} onKab={setKab} onTahun={setTahun} />

      {/* Section toggle */}
      <div className="flex gap-2">
        {[{ id: 'pd3i', label: 'Penyakit Dapat Dicegah dengan Imunisasi (PD3I)' }, { id: 'ptm', label: 'Penyakit Tidak Menular (PTM)' }].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id as any)}
            className="px-4 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{ background: activeSection === s.id ? '#0FB0AA' : '#F3F4F6', color: activeSection === s.id ? '#fff' : '#6B7280' }}>
            {s.label}
          </button>
        ))}
      </div>

      {activeSection === 'pd3i' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Kasus Difteri" value={totDifteri.toLocaleString('id-ID')} icon="⚠️" color="#f97316" />
            <KPICard title="Kasus Campak" value={totCampak.toLocaleString('id-ID')} icon="🔴" color="#ef4444" />
            <KPICard title="Kasus Pertusis" value={totPertusis.toLocaleString('id-ID')} icon="😮‍💨" color="#8b5cf6" />
            <KPICard title="KLB <24 Jam" value={avgKLB.toFixed(1) + '%'} sub="Rata-rata penanganan" icon="🚨" color="#0FB0AA" trend={avgKLB >= 100 ? 'up' : 'down'} trendVal={avgKLB >= 100 ? 'Semua tertangani' : 'Perlu perbaikan'} />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>PD3I per Kabupaten/Kota</h3>
              <select value={pd3iIndic} onChange={e => setPd3iIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {PD3I_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pd3iChart} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={pd3iIndic} name={pd3iLabel} radius={[0, 6, 6, 0]}>
                  {pd3iChart.map((_, i) => <Cell key={i} fill={i === 0 ? '#f97316' : '#fcd9b0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <StatPanel stats={pd3iStats} label={pd3iLabel} />
          <InsightBox insights={pd3iInsights} />
          <CrosstabSection
            data={pd3iData}
            variables={PD3I_OPTIONS}
            defaultRowVar="difteri_kasus"
            defaultColVar="campak_kasus"
            title="Analisis Crosstab PD3I"
          />
          <DataTable data={pd3iData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'difteri_kasus', label: 'Difteri' },
            { key: 'campak_kasus', label: 'Campak' },
            { key: 'pertusis_kasus', label: 'Pertusis' },
            { key: 'afp_rate', label: 'AFP Rate', format: v => v?.toFixed(2) },
            { key: 'klb_24jam_pct', label: 'KLB <24jam (%)', format: v => v?.toFixed(1) },
          ]} />
        </>
      )}

      {activeSection === 'ptm' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Hipertensi (L+P)" value={totHipertensi.toLocaleString('id-ID')} icon="❤️" color="#ef4444" />
            <KPICard title="Diabetes Melitus" value={totDM.toLocaleString('id-ID')} sub="Terdiagnosis" icon="🩸" color="#f97316" />
            <KPICard title="DM Terkendali" value={avgDMTerkendali.toFixed(1) + '%'} sub="Rata-rata" icon="✅" color="#0FB0AA" trend={avgDMTerkendali >= 60 ? 'up' : 'down'} trendVal={avgDMTerkendali >= 60 ? 'Cukup baik' : 'Perlu peningkatan'} />
            <KPICard title="Skizofrenia" value={totSkizo.toLocaleString('id-ID')} sub="Kasus" icon="🧠" color="#8b5cf6" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Hipertensi Laki-laki vs Perempuan (10 Terbesar)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hipertensiGender} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1e3).toFixed(0)+'rb'} />
                <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="laki" name="Hipertensi L" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
                <Bar dataKey="perempuan" name="Hipertensi P" fill="#CBD92C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator PTM per Kabupaten/Kota</h3>
              <select value={ptmIndic} onChange={e => setPtmIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {PTM_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ptmChart} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={ptmIndic} name={ptmLabel} radius={[0, 6, 6, 0]}>
                  {ptmChart.map((_, i) => <Cell key={i} fill={i === 0 ? '#8b5cf6' : '#c4b5fd'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <StatPanel stats={ptmStats} label={ptmLabel} />
          <InsightBox insights={ptmInsights} />
          <CrosstabSection
            data={ptmData}
            variables={PTM_OPTIONS}
            defaultRowVar="hipertensi_laki"
            defaultColVar="dm_terdiagnosis"
            title="Analisis Crosstab PTM"
          />
          <DataTable data={ptmData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'hipertensi_laki', label: 'Hipertensi L', format: v => v?.toLocaleString('id-ID') },
            { key: 'hipertensi_perempuan', label: 'Hipertensi P', format: v => v?.toLocaleString('id-ID') },
            { key: 'dm_terdiagnosis', label: 'DM Diagnosis', format: v => v?.toLocaleString('id-ID') },
            { key: 'dm_terkendali_pct', label: 'DM Terkendali (%)', format: v => v?.toFixed(1) },
            { key: 'jiwa_skizofrenia', label: 'Skizofrenia', format: v => v?.toLocaleString('id-ID') },
          ]} />
        </>
      )}
    </div>
  )
}
