import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import RiskClusteringMap from '../components/RiskClusteringMap';
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
import CrosstabSection from '../components/CrosstabSection'

const OPTIONS = [
  { key: 'dbd_kasus', label: 'DBD — Jumlah Kasus' },
  { key: 'dbd_cfr', label: 'DBD — CFR / Case Fatality Rate (%)' },
  { key: 'malaria_positif', label: 'Malaria Positif' },
  { key: 'filariasis_kronis', label: 'Filariasis Kronis' },
]

export default function TularVektor() {
  const [mapIndicator, setMapIndicator] = useState('dbd_kasus');
  const { data: penyakitPD3I, loading, error } = useDashboardData()

  const [indic, setIndic] = useState('dbd_kasus')
  const [dbdFilter, setDbdFilter] = useState('10')
  const [vektorFilter, setVektorFilter] = useState('10')
  const [malariaFilter, setMalariaFilter] = useState('10')
  const [malariaIndic, setMalariaIndic] = useState('malaria_suspek')

  const data = useMemo(() => penyakitPD3I.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [penyakitPD3I])

  const totDBD = data.reduce((s, d) => s + (d.dbd_kasus as number), 0)
  const avgCFR = data.length ? data.reduce((s, d) => s + (d.dbd_cfr as number), 0) / data.length : 0
  const totMalaria = data.reduce((s, d) => s + (d.malaria_positif as number), 0)
  const totFilariasis = data.reduce((s, d) => s + (d.filariasis_kronis as number), 0)

  const chartSorted = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number))
  const chartData = vektorFilter === 'all' ? chartSorted : chartSorted.slice(0, Number(vektorFilter))
  
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = OPTIONS.find(o => o.key === indic)?.label ?? indic
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  // DBD kasus + CFR dual axis
  const dbdDualSorted = [...data].sort((a, b) => (b.dbd_kasus as number) - (a.dbd_kasus as number))
  const dbdDual = (dbdFilter === 'all' ? dbdDualSorted : dbdDualSorted.slice(0, Number(dbdFilter))).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    kasus: d.dbd_kasus,
    cfr: d.dbd_cfr,
  }))

  // Malaria chart
  const malariaSorted = [...data].sort((a, b) => (b[malariaIndic] as number) - (a[malariaIndic] as number))
  const malariaChartData = malariaFilter === 'all' ? malariaSorted : malariaSorted.slice(0, Number(malariaFilter))
  
  const MALARIA_OPTIONS = [
    { key: 'malaria_suspek', label: 'Suspek Malaria' },
    { key: 'malaria_positif', label: 'Malaria Positif' },
    { key: 'malaria_meninggal', label: 'Meninggal' },
  ]
  const malariaLabel = MALARIA_OPTIONS.find(o => o.key === malariaIndic)?.label ?? malariaIndic

  // Correlation DBD kasus vs CFR
  const scatterData = data.map(d => ({ x: d.dbd_kasus as number, y: d.dbd_cfr as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} mencatat angka tertinggi untuk indikator ${indicLabel} (${(maxKab[indic] as number).toLocaleString('id-ID')}). Tingginya penyebaran ini mengisyaratkan perlunya pemberantasan sarang nyamuk (PSN) secara masif dan menjaga kebersihan lingkungan perumahan guna menekan angka penularan.`,
  ] : []

  const scatterInsights = [
    `Hubungan antara jumlah kasus DBD dengan CFR (tingkat kematian) menunjukkan korelasi ${Math.abs(r) > 0.7 ? 'kuat' : Math.abs(r) > 0.4 ? 'sedang' : 'lemah'} (r = ${r.toFixed(3)}). Artinya, tingginya jumlah kasus DBD dapat ditekan angka kematiannya apabila didukung dengan kesigapan deteksi dini dan kecepatan penanganan darurat pasien di fasilitas kesehatan.`,
  ]

  const statInsights = [
    `Total kasus DBD se-Jawa Timur mencapai ${totDBD.toLocaleString('id-ID')}. Musim penghujan dan banyaknya tempat genangan air bersih yang tidak ditutup rapat menjadi faktor lingkungan pemicu utama ledakan perkembangbiakan nyamuk pembawa virus.`,
    `Tingkat fatalitas (CFR DBD) rata-rata adalah ${avgCFR.toFixed(2)}%, yang ${avgCFR <= 1 ? 'masih berada dalam batas aman standar nasional (≤1%)' : 'sudah mengkhawatirkan (melebihi batas aman 1%)'}. CFR yang terus dievaluasi sangat penting untuk mengukur kualitas perawatan dan kecepatan rujukan di rumah sakit.`,
    `Terdapat pula ${totMalaria.toLocaleString('id-ID')} kasus Malaria Positif dan ${totFilariasis.toLocaleString('id-ID')} penderita Filariasis (kaki gajah) kronis. Pencegahan melalui kelambu berinsektisida dan obat pencegahan massal sangat dianjurkan untuk mencegah kecacatan permanen yang menurunkan produktivitas ekonomi warga.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="Kasus DBD" value={totDBD.toLocaleString('id-ID')} sub="Demam Berdarah Dengue" icon="🦟" color="#0F8F8B" />
        <KPICard title="CFR DBD Rata-rata" value="0.62%" sub="Case Fatality Rate" icon="📊" color="#0F8F8B" />
        <KPICard title="Malaria Positif" value={totMalaria.toLocaleString('id-ID')} sub="Pengobatan standar 96.3%" icon="🦠" color="#0F8F8B" />
        <KPICard title="Angka Kesakitan Malaria" value="0.02" sub="API per 1000 penduduk" icon="📈" color="#0F8F8B" />
        <KPICard title="Filariasis Kronis" value="129" sub="Kasus" icon="🌊" color="#0F8F8B" />
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
              {OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ChoroplethMap 
          data={data} 
          indicatorKey={mapIndicator} 
          indicatorLabel={OPTIONS.find(o => o.key === mapIndicator)?.label || ''} 
        />
      </div>

      {/* DBD dual axis */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>DBD — Kasus & CFR per Kabupaten/Kota</h3>
          <select value={dbdFilter} onChange={e => setDbdFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Keseluruhan</option>
          </select>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: dbdFilter === 'all' ? 1200 : (dbdFilter === '20' ? 800 : '100%'), height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dbdDual} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} interval={0} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="kasus" name="Kasus DBD" fill="#078FA5" radius={[3, 3, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="cfr" name="CFR (%)" stroke="#9EAF24" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Penyakit Tular Vektor & Zoonotik</h3>
          <div className="flex items-center gap-3">
            <select value={indic} onChange={e => setIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <select value={vektorFilter} onChange={e => setVektorFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Keseluruhan</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: vektorFilter === 'all' ? 800 : '100%', height: vektorFilter === 'all' ? 800 : (vektorFilter === '20' ? 600 : 400) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} interval={0} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={indic} name={indicLabel} fill="#0F8F8B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Malaria chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Malaria per Kabupaten/Kota</h3>
          <div className="flex items-center gap-3">
            <select value={malariaIndic} onChange={e => setMalariaIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {MALARIA_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <select value={malariaFilter} onChange={e => setMalariaFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Keseluruhan</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: malariaFilter === 'all' ? 800 : '100%', height: malariaFilter === 'all' ? 800 : (malariaFilter === '20' ? 600 : 400) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={malariaChartData} layout="vertical" margin={{ left: 95, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} interval={0} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey={malariaIndic} name={malariaLabel} fill="#0F8F8B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}

      {/* Korelasi DBD kasus vs CFR */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Korelasi Kasus DBD vs CFR</h3>
          <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0F8F8B' }}>r = {r.toFixed(3)}</span>
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
            <Scatter data={scatterData} fill="#0F8F8B" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

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
        defaultRowVar="dbd_kasus"
        defaultColVar="dbd_cfr"
      />

      
      <RiskClusteringMap 
        title="Analisis Klasterisasi Pemetaan Risiko Penyakit Tular Vektor & Zoonotik"
        data={data} 
        variables={['dbd_kasus', 'dbd_cfr', 'malaria_positif']} 
        directions={[1, 1, 1]} 
        variableLabels={['Kasus DBD', 'CFR DBD (%)', 'Malaria Positif']} 
      />

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
