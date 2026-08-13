import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import RiskClusteringMap from '../components/RiskClusteringMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, Cell
, LabelList } from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import { generateDynamicBarInsight } from '../utils/insightGenerator'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'

const OPTIONS = [
  { key: 'produktif_laki', label: 'Usia Produktif Laki-laki' },
  { key: 'produktif_perempuan', label: 'Usia Produktif Perempuan' },
  { key: 'lansia_dilayani', label: 'Lansia Dilayani (60+)' },
  { key: 'catin_laki', label: 'Calon Pengantin Laki-laki' },
  { key: 'catin_perempuan', label: 'Calon Pengantin Perempuan' },
]

export default function UsiaProduktifLansia() {
  const [mapIndicator, setMapIndicator] = useState('produktif_laki');
  const { data: usiaProduktif, loading, error } = useDashboardData()

  const [indic, setIndic] = useState('lansia_dilayani')
  const [chartFilter, setChartFilter] = useState('10')
  const [genderFilter, setGenderFilter] = useState('10')

  const data = useMemo(() => usiaProduktif.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [usiaProduktif])

  const totLaki = data.reduce((s, d) => s + (d.produktif_laki as number), 0)
  const totPerempuan = data.reduce((s, d) => s + (d.produktif_perempuan as number), 0)
  const totLansia = data.reduce((s, d) => s + (d.lansia_dilayani as number), 0)
  const totCatin = data.reduce((s, d) => s + (d.catin_laki as number) + (d.catin_perempuan as number), 0)

  const sortedData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number))
  const chartData = chartFilter === 'all' ? sortedData : sortedData.slice(0, Number(chartFilter))
  
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = OPTIONS.find(o => o.key === indic)?.label ?? indic

  // Gender comparison
  const sortedGenderData = [...data].sort((a, b) => ((b.produktif_laki as number) + (b.produktif_perempuan as number)) - ((a.produktif_laki as number) + (a.produktif_perempuan as number)))
  const filteredGenderData = genderFilter === 'all' ? sortedGenderData : sortedGenderData.slice(0, Number(genderFilter))
  
  const genderData = filteredGenderData.map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    laki: d.produktif_laki,
    perempuan: d.produktif_perempuan,
  }))

  const chartInsights = [
    generateDynamicBarInsight(
      data,
      indic,
      indicLabel,
      "Grafik pelayanan ini memotret sejauh mana program kesehatan telah menjangkau populasi usia produktif dan kelompok lanjut usia (lansia) di masing-masing kabupaten/kota. Jika sebuah wilayah menunjukkan angka cakupan yang menonjol, itu berarti sistem posbindu (pos pembinaan terpadu) serta layanan skrining kesehatannya berjalan secara optimal. Ini penting agar penyakit tidak menular seperti diabetes atau hipertensi bisa dideteksi jauh sebelum berkembang menjadi komplikasi berat."
    )
  ]

  const statInsights = [
    `Kelompok usia produktif adalah motor penggerak ekonomi utama daerah, sehingga menjaga mereka tetap sehat dan terhindar dari penyakit kronis merupakan investasi jangka panjang yang krusial bagi pemerintah. Di sisi lain, peningkatan angka harapan hidup menyebabkan populasi lansia bertambah. Pelayanan sesuai standar bagi para lansia memastikan mereka tetap memiliki kualitas hidup yang mandiri, bermartabat, dan sehat di masa senjanya tanpa harus terus bergantung pada fasilitas medis darurat.`
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard title="Usia Produktif Laki-laki" value={(totLaki / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' juta'} sub="Jiwa" icon="👨" color="#0F8F8B" />
        <KPICard title="Usia Produktif Perempuan" value={(totPerempuan / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' juta'} sub="Jiwa" icon="👩" color="#078FA5" />
        <KPICard title="Lansia Dilayani Sesuai Standar" value={totLansia.toLocaleString('id-ID')} sub="Usia 60+" icon="👴" color="#9EAF24" />
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

      <InsightBox insights={statInsights} />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pelayanan Usia Produktif & Lansia</h3>
          <div className="flex gap-2">
            <select value={chartFilter} onChange={e => setChartFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Semua</option>
            </select>
            <select value={indic} onChange={e => setIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 80 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1e6 ? (v / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' juta' : v?.toLocaleString('id-ID')} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
            <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]} fill="#0F8F8B" ><LabelList dataKey={indic} position="right" style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <InsightBox insights={chartInsights} />

      {/* Gender comparison */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Perbandingan Usia Produktif Laki-laki vs Perempuan</h3>
          <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={genderData} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1e3).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + 'rb'} />
            <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="laki" name="Laki-laki" fill="#0F8F8B" radius={[3, 3, 0, 0]} ><LabelList dataKey="laki" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
            <Bar dataKey="perempuan" name="Perempuan" fill="#9EAF24" radius={[3, 3, 0, 0]} ><LabelList dataKey="perempuan" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
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

      
      <RiskClusteringMap 
        title="Analisis Klasterisasi Pemetaan Risiko Usia Produktif & Lansia"
        data={data} 
        variables={['produktif_laki', 'lansia_dilayani']} 
        directions={[-1, -1]} 
        variableLabels={['Usia Produktif Laki-laki', 'Lansia Dilayani']} 
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'produktif_laki', label: 'Produktif L', format: v => v?.toLocaleString('id-ID') },
        { key: 'produktif_perempuan', label: 'Produktif P', format: v => v?.toLocaleString('id-ID') },
        { key: 'lansia_dilayani', label: 'Lansia Dilayani', format: v => v?.toLocaleString('id-ID') },
        { key: 'catin_laki', label: 'Catin L', format: v => v?.toLocaleString('id-ID') },
        { key: 'catin_perempuan', label: 'Catin P', format: v => v?.toLocaleString('id-ID') },
      ]} />
    </div>
  )
}
