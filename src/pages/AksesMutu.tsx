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
import RankChart from '../components/RankChart'
import CrosstabSection from '../components/CrosstabSection'
import RiskClusteringMap from '../components/RiskClusteringMap'

const RS_OPTIONS = [
  { key: 'bor', label: 'BOR — Bed Occupancy Rate (%)' },
  { key: 'bto', label: 'BTO — Bed Turn Over' },
  { key: 'toi', label: 'TOI — Turn Over Interval (hari)' },
  { key: 'alos', label: 'ALOS — Average Length of Stay (hari)' },
  { key: 'gdr', label: 'GDR — Gross Death Rate (‰)' },
  { key: 'ndr', label: 'NDR — Net Death Rate (‰)' },
]

const IDEAL: Record<string, { min: number; max: number; label: string }> = {
  bor: { min: 60, max: 85, label: 'Ideal: 60–85%' },
  bto: { min: 40, max: 50, label: 'Ideal: 40–50 kali/tahun' },
  toi: { min: 1, max: 3, label: 'Ideal: 1–3 hari' },
  alos: { min: 3, max: 5, label: 'Ideal: 3–5 hari' },
  gdr: { min: 0, max: 45, label: 'Batas maks: 45‰' },
  ndr: { min: 0, max: 25, label: 'Batas maks: 25‰' },
}

export default function AksesMutu() {
  const { data: saranaKesehatan, loading, error } = useDashboardData()

  const [indic, setIndic] = useState('bor')
  const [statIndic, setStatIndic] = useState('bor')
  const [corrX, setCorrX] = useState('bor')
  const [corrY, setCorrY] = useState('alos')

  const data = useMemo(() => saranaKesehatan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [saranaKesehatan])

  const avgBOR = data.length ? data.reduce((s, d) => s + (d.bor as number), 0) / data.length : 0
  const avgALOS = data.length ? data.reduce((s, d) => s + (d.alos as number), 0) / data.length : 0
  const avgGDR = data.length ? data.reduce((s, d) => s + (d.gdr as number), 0) / data.length : 0
  const avgNDR = data.length ? data.reduce((s, d) => s + (d.ndr as number), 0) / data.length : 0

  const totRawatJalan = data.reduce((s, d) => {
    let sum = 0
    Object.keys(d).forEach(k => {
      if (k.endsWith('_rawat_jalan_l_+_p')) sum += Number(d[k] || 0)
    })
    return s + sum
  }, 0)

  const totRawatInap = data.reduce((s, d) => {
    let sum = 0
    Object.keys(d).forEach(k => {
      if (k.endsWith('_rawat_inap_l_+_p')) sum += Number(d[k] || 0)
    })
    return s + sum
  }, 0)

  const sumPuskesmas = data.reduce((s, d) => s + Number(d.tahun_2025_puskesmas || 0), 0)
  const sumPuskesmasObat = data.reduce((s, d) => s + Number(d.tahun_2025_ketersediaan_obat_esensial_dan_vaksin_irl || 0), 0)
  const pctPuskesmas = sumPuskesmas > 0 ? (sumPuskesmasObat / sumPuskesmas) * 100 : 0

  const stats = descStats(data.map(d => Number(d[statIndic] || 0)))
  const statIndicLabel = RS_OPTIONS.find(o => o.key === statIndic)?.label ?? statIndic

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))



  const scatterInsights = [
    `Analisis perbandingan antara indikator mutu ${corrX.toUpperCase()} dan ${corrY.toUpperCase()} menunjukkan korelasi ${Math.abs(r) > 0.7 ? 'kuat' : Math.abs(r) > 0.4 ? 'sedang' : 'lemah'} (r = ${r.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}). Evaluasi berkala sangat penting bagi manajemen rumah sakit untuk memastikan apakah efisiensi penggunaan tempat tidur turut berbanding lurus dengan kualitas layanan dan kecepatan kesembuhan pasien.`,
  ]

  const statInsights = [
    `Rata-rata tingkat hunian tempat tidur RS (BOR) di Jawa Timur sebesar ${avgBOR.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%. Angka ini ${avgBOR >= 60 && avgBOR <= 85 ? 'berada dalam rentang ideal, menandakan rumah sakit beroperasi secara efisien baik dari sisi medis maupun finansial' : avgBOR < 60 ? 'masih di bawah standar ideal, yang mengisyaratkan banyaknya tempat tidur kosong sehingga rawan membebani biaya operasional RS' : 'melebihi kapasitas ideal, kondisi ini sangat rentan membahayakan pasien akibat kelelahan tenaga medis dan memicu penularan infeksi di dalam ruangan (HAI)'}.`,
    `Adapun rata-rata lama pasien dirawat (ALOS) mencapai ${avgALOS.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hari, dengan Angka Kematian Kotor (GDR) ${avgGDR.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}‰ dan Angka Kematian Bersih (NDR) ${avgNDR.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}‰. Khusus untuk NDR (kematian >48 jam setelah dirawat), jika nilainya terus mendekati batas maksimal, maka rumah sakit perlu segera melakukan evaluasi menyeluruh terhadap prosedur penanganan pasien kritis.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard title="Total Kunjungan Rawat Jalan" value={totRawatJalan.toLocaleString('id-ID')} icon="🚶" color="#0FB0AA" />
        <KPICard title="Total Kunjungan Rawat Inap" value={totRawatInap.toLocaleString('id-ID')} icon="🛏️" color="#06B5D0" />
        <KPICard title="BOR Provinsi" value={avgBOR.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} icon="🏥" color="#CBD92C" />
        <KPICard title="Gross Death Rate" value={avgGDR.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '‰'} sub="Batas maks: 45‰" icon="📉" color="#f97316" trend={avgGDR <= 45 ? 'neutral' : 'down'} trendVal={avgGDR <= 45 ? 'Dalam batas' : 'Melebihi batas'} />
        <KPICard title="Net Death Rate" value={avgNDR.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '‰'} sub="Batas maks: 25‰" icon="📉" color="#8b5cf6" trend={avgNDR <= 25 ? 'neutral' : 'down'} trendVal={avgNDR <= 25 ? 'Dalam batas' : 'Melebihi batas'} />
        <KPICard title="% Puskesmas dg Ketersediaan Obat Esensial & Vaksin" value={pctPuskesmas.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} icon="💊" color="#22c55e" />
      </div>

      <div className="flex flex-col gap-4">
        <RankChart
          data={data}
          indicators={RS_OPTIONS.map(o => ({ key: o.key, label: o.label }))}
          defaultIndicator="bor"
          title="Ranking Indikator Pelayanan Rumah Sakit per Kabupaten/Kota"
        />
      </div>

      {/* Scatter correlation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analisis Korelasi Indikator RS</h3>
          <select value={corrX} onChange={e => setCorrX(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[200px]">
            {RS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select value={corrY} onChange={e => setCorrY(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[200px]">
            {RS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0FB0AA' }}>r = {r.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="x" type="number" name={corrX} tick={{ fontSize: 11 }} />
            <YAxis dataKey="y" type="number" name={corrY} tick={{ fontSize: 11 }} />
            <Tooltip content={({ payload }) => {
              if (!payload?.length) return null
              const p = payload[0].payload
              return <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs"><div className="font-semibold mb-1">{p.name}</div><div>{corrX.toUpperCase()}: {p.x?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div>{corrY.toUpperCase()}: {p.y?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
            }} />
            <Scatter data={scatterData} fill="#0FB0AA" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

      <StatPanel
        stats={stats}
        label={statIndicLabel}
        format={v => v.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        rightElement={
          <select value={statIndic} onChange={e => setStatIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {RS_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />


      <CrosstabSection
        data={data}
        variables={RS_OPTIONS}
        defaultRowVar="bor"
        defaultColVar="alos"
      />

      <RiskClusteringMap 
        title="Analisis Klasterisasi Pemetaan Risiko Akses & Mutu Pelayanan Kesehatan"
        data={data} 
        variables={['bor', 'gdr', 'ndr']} 
        directions={[1, 1, 1]} 
        variableLabels={['BOR (%)', 'GDR (‰)', 'NDR (‰)']} 
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'bor', label: 'BOR (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'bto', label: 'BTO', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'toi', label: 'TOI (hr)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'alos', label: 'ALOS (hr)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'gdr', label: 'GDR (‰)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'ndr', label: 'NDR (‰)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
      ]} />
    </div>
  )
}
