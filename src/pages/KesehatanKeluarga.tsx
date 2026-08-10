import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ScatterChart, Scatter, Cell
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
  { key: 'fe_tablet_pct', label: 'Tablet FE (%)' },
  { key: 'bumil_kek_pct', label: 'Bumil KEK (%)' },
  { key: 'kb_aktif_pct', label: 'KB Aktif (%)' },
]

const ANAK_OPTIONS = [
  { key: 'imunisasi_dasar_lengkap_pct', label: 'Imunisasi Dasar Lengkap (%)' },
  { key: 'stunting_pct', label: 'Prevalensi Stunting (%)' },
  { key: 'gizi_kurang_pct', label: 'Gizi Kurang (%)' },
  { key: 'gizi_buruk_pct', label: 'Gizi Buruk (%)' },
  { key: 'asi_eksklusif_pct', label: 'ASI Eksklusif (%)' },
  { key: 'vitamin_a_pct', label: 'Vitamin A (%)' },
  { key: 'bblr_pct', label: 'BBLR (%)' },
]

export default function KesehatanKeluarga({ sub = '5.1' }: { sub?: string }) {
  const [kab, setKab] = useState('all')
  const [tahun, setTahun] = useState('2025')
  const [ibuIndic, setIbuIndic] = useState('k1_pct')
  const [anakIndic, setAnakIndic] = useState('stunting_pct')
  const [tab, setTab] = useState<'ibu' | 'anak' | 'lansia'>('ibu')

  const ibuData = useMemo(() => kab === 'all' ? kesehatanIbu.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : kesehatanIbu.filter(d => d.kabupaten === kab), [kab, kesehatanIbu])
  const anakData = useMemo(() => kab === 'all' ? kesehatanAnak.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : kesehatanAnak.filter(d => d.kabupaten === kab), [kab, kesehatanAnak])
  const lansiaData = useMemo(() => kab === 'all' ? usiaProduktif.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : usiaProduktif.filter(d => d.kabupaten === kab), [kab, usiaProduktif])

  const totKematianIbu = ibuData.reduce((s, d) => s + (d.kematian_ibu_hamil as number) + (d.kematian_ibu_bersalin as number) + (d.kematian_ibu_nifas as number), 0)
  const avgK1 = ibuData.length ? ibuData.reduce((s, d) => s + (d.k1_pct as number), 0) / ibuData.length : 0
  const totKematianAnak = anakData.reduce((s, d) => s + (d.kematian_neonatal as number) + (d.kematian_bayi as number), 0)
  const avgStunting = anakData.length ? anakData.reduce((s, d) => s + (d.stunting_pct as number), 0) / anakData.length : 0

  const ibuChartData = [...ibuData].sort((a, b) => (b[ibuIndic] as number) - (a[ibuIndic] as number)).slice(0, 15)
  const anakChartData = [...anakData].sort((a, b) => (b[anakIndic] as number) - (a[anakIndic] as number)).slice(0, 15)

  const ibuStats = descStats(ibuData.map(d => d[ibuIndic] as number))
  const anakStats = descStats(anakData.map(d => d[anakIndic] as number))
  const ibuLabel = IBU_OPTIONS.find(o => o.key === ibuIndic)?.label ?? ibuIndic
  const anakLabel = ANAK_OPTIONS.find(o => o.key === anakIndic)?.label ?? anakIndic

  const maxIbu = ibuData.length ? ibuData.reduce((a, b) => (a[ibuIndic] as number) > (b[ibuIndic] as number) ? a : b) : null
  const minIbu = ibuData.length ? ibuData.reduce((a, b) => (a[ibuIndic] as number) < (b[ibuIndic] as number) ? a : b) : null

  const ibuChartInsights = maxIbu && minIbu ? [
    `${maxIbu.kabupaten} memiliki ${ibuLabel} tertinggi (${(maxIbu[ibuIndic] as number).toFixed(1)}%).`,
  ] : []

  const ibuStatInsights = [
    `Kematian ibu total (hamil + bersalin + nifas): ${totKematianIbu} kasus.`,
    `Rata-rata cakupan K1: ${avgK1.toFixed(1)}%.`,
  ]

  const TABS = [
    { id: 'ibu', label: '5.1 Kesehatan Ibu' },
    { id: 'anak', label: '5.2 Kesehatan Anak' },
    { id: 'lansia', label: '5.3 Usia Produktif & Lansia' },
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <FilterBar kab={kab} tahun={tahun} onKab={setKab} onTahun={setTahun} kabupaten={''} />

      {/* Sub-tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? 'bg-teal-500 text-white' : 'text-gray-500 hover:text-teal-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ibu' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Kematian Ibu" value={totKematianIbu} sub="Total (hamil+bersalin+nifas)" icon="💔" color="#ef4444" />
            <KPICard title="Cakupan K1" value={avgK1.toFixed(1) + '%'} sub="Rata-rata" icon="🤰" color="#0FB0AA" />
            <KPICard title="KB Aktif" value={(ibuData.reduce((s, d) => s + (d.kb_aktif_pct as number), 0) / Math.max(ibuData.length, 1)).toFixed(1) + '%'} sub="Rata-rata" icon="🔵" color="#06B5D0" />
            <KPICard title="Bumil KEK" value={(ibuData.reduce((s, d) => s + (d.bumil_kek_pct as number), 0) / Math.max(ibuData.length, 1)).toFixed(1) + '%'} sub="Rata-rata" icon="⚠️" color="#f97316" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Kesehatan Ibu</h3>
              <select value={ibuIndic} onChange={e => setIbuIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {IBU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ibuChartData} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={ibuIndic} radius={[0, 6, 6, 0]}>
                  {ibuChartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#0FB0AA' : '#93c5c3'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {ibuChartInsights.length > 0 && <InsightBox insights={ibuChartInsights} />}
          <StatPanel stats={ibuStats} label={ibuLabel} format={v => v.toFixed(1) + '%'} />
          <InsightBox insights={ibuStatInsights} />
          <CrosstabSection
            data={ibuData}
            variables={IBU_OPTIONS}
            defaultRowVar="k1_pct"
            defaultColVar="persalinan_fasyankes_pct"
            title="Analisis Crosstab Kesehatan Ibu"
          />
          <DataTable data={ibuData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'k1_pct', label: 'K1 (%)', format: v => v?.toFixed(1) },
            { key: 'k6_pct', label: 'K6 (%)', format: v => v?.toFixed(1) },
            { key: 'persalinan_fasyankes_pct', label: 'Persalinan Fasyankes (%)', format: v => v?.toFixed(1) },
            { key: 'bumil_kek_pct', label: 'Bumil KEK (%)', format: v => v?.toFixed(1) },
            { key: 'kb_aktif_pct', label: 'KB Aktif (%)', format: v => v?.toFixed(1) },
          ]} />
        </>
      )}

      {tab === 'anak' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Kematian Neonatal+Bayi" value={totKematianAnak} icon="💔" color="#ef4444" />
            <KPICard title="Prevalensi Stunting" value={avgStunting.toFixed(1) + '%'} sub="Rata-rata" icon="📏" color="#f97316" />
            <KPICard title="Imunisasi Dasar" value={(anakData.reduce((s, d) => s + (d.imunisasi_dasar_lengkap_pct as number), 0) / Math.max(anakData.length, 1)).toFixed(1) + '%'} sub="Rata-rata" icon="💉" color="#0FB0AA" />
            <KPICard title="ASI Eksklusif" value={(anakData.reduce((s, d) => s + (d.asi_eksklusif_pct as number), 0) / Math.max(anakData.length, 1)).toFixed(1) + '%'} sub="Rata-rata" icon="🍼" color="#CBD92C" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Kesehatan Anak</h3>
              <select value={anakIndic} onChange={e => setAnakIndic(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={anakChartData} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
                <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={anakIndic} radius={[0, 6, 6, 0]}>
                  {anakChartData.map((_, i) => <Cell key={i} fill={i === 0 ? '#f97316' : '#fcd9b0'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <StatPanel stats={anakStats} label={anakLabel} format={v => v.toFixed(1) + '%'} />
          <InsightBox insights={[
            `Rata-rata stunting: ${avgStunting.toFixed(1)}%.`,
            `Total kematian neonatal + bayi: ${totKematianAnak} kasus di wilayah yang dipilih.`,
          ]} />
          <CrosstabSection
            data={anakData}
            variables={ANAK_OPTIONS}
            defaultRowVar="stunting_pct"
            defaultColVar="gizi_kurang_pct"
            title="Analisis Crosstab Kesehatan Anak"
          />
          <DataTable data={anakData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'stunting_pct', label: 'Stunting (%)', format: v => v?.toFixed(1) },
            { key: 'gizi_kurang_pct', label: 'Gizi Kurang (%)', format: v => v?.toFixed(1) },
            { key: 'imunisasi_dasar_lengkap_pct', label: 'Imunisasi (%)', format: v => v?.toFixed(1) },
            { key: 'kematian_neonatal', label: 'Kematian Neonatal' },
            { key: 'kematian_bayi', label: 'Kematian Bayi' },
          ]} />
        </>
      )}

      {tab === 'lansia' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard title="Usia Produktif Laki-laki" value={lansiaData.reduce((s, d) => s + (d.produktif_laki as number), 0).toLocaleString('id-ID')} icon="👨" color="#0FB0AA" />
            <KPICard title="Usia Produktif Perempuan" value={lansiaData.reduce((s, d) => s + (d.produktif_perempuan as number), 0).toLocaleString('id-ID')} icon="👩" color="#06B5D0" />
            <KPICard title="Lansia Dilayani" value={lansiaData.reduce((s, d) => s + (d.lansia_dilayani as number), 0).toLocaleString('id-ID')} icon="👴" color="#CBD92C" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pelayanan Usia Produktif & Lansia</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={lansiaData.slice(0, 12).map(d => ({ kabupaten: d.kabupaten.replace('Kota ',''), lansia: d.lansia_dilayani, posyandu: d.posyandu_lansia }))} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="lansia" name="Lansia Dilayani" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
                <Bar dataKey="posyandu" name="Posyandu Lansia" fill="#CBD92C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <InsightBox insights={[
            `Total lansia dilayani: ${lansiaData.reduce((s, d) => s + (d.lansia_dilayani as number), 0).toLocaleString('id-ID')} jiwa.`,
            `Total posyandu lansia: ${lansiaData.reduce((s, d) => s + (d.posyandu_lansia as number), 0).toLocaleString('id-ID')} unit.`,
          ]} />
          <CrosstabSection
            data={lansiaData}
            title="Analisis Crosstab Usia Produktif & Lansia"
          />
          <DataTable data={lansiaData} columns={[
            { key: 'kabupaten', label: 'Kabupaten/Kota' },
            { key: 'produktif_laki', label: 'Produktif L', format: v => v?.toLocaleString('id-ID') },
            { key: 'produktif_perempuan', label: 'Produktif P', format: v => v?.toLocaleString('id-ID') },
            { key: 'lansia_dilayani', label: 'Lansia Dilayani', format: v => v?.toLocaleString('id-ID') },
            { key: 'posyandu_lansia', label: 'Posyandu Lansia', format: v => v?.toLocaleString('id-ID') },
          ]} />
        </>
      )}
    </div>
  )
}
