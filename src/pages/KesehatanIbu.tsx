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

const CSV_DATA: Record<string, any> = {
  "Pacitan": { "jumlah_kf1": 4460, "kf1_pct": 62.6, "jumlah_kf_lengkap": 4452, "kf_lengkap_pct": 62.5, "jumlah_nifas_vit_a": 4460, "nifas_vit_a_pct": 62.6, "anak_lahir_hidup": 6746, "jumlah_ibu_bersalin_nifas": 7122 },
  "Ponorogo": { "jumlah_kf1": 7334, "kf1_pct": 59.6, "jumlah_kf_lengkap": 7230, "kf_lengkap_pct": 58.8, "jumlah_nifas_vit_a": 7334, "nifas_vit_a_pct": 59.6, "anak_lahir_hidup": 11713, "jumlah_ibu_bersalin_nifas": 12297 },
  "Trenggalek": { "jumlah_kf1": 6411, "kf1_pct": 64.9, "jumlah_kf_lengkap": 6283, "kf_lengkap_pct": 63.6, "jumlah_nifas_vit_a": 6411, "nifas_vit_a_pct": 64.9, "anak_lahir_hidup": 9318, "jumlah_ibu_bersalin_nifas": 9880 },
  "Tulungagung": { "jumlah_kf1": 10753, "kf1_pct": 69.4, "jumlah_kf_lengkap": 10713, "kf_lengkap_pct": 69.2, "jumlah_nifas_vit_a": 10753, "nifas_vit_a_pct": 69.4, "anak_lahir_hidup": 14684, "jumlah_ibu_bersalin_nifas": 15484 },
  "Blitar": { "jumlah_kf1": 10287, "kf1_pct": 55.5, "jumlah_kf_lengkap": 10283, "kf_lengkap_pct": 55.5, "jumlah_nifas_vit_a": 10296, "nifas_vit_a_pct": 55.5, "anak_lahir_hidup": 17197, "jumlah_ibu_bersalin_nifas": 18536 },
  "Kediri": { "jumlah_kf1": 15111, "kf1_pct": 56.5, "jumlah_kf_lengkap": 14832, "kf_lengkap_pct": 55.5, "jumlah_nifas_vit_a": 15091, "nifas_vit_a_pct": 56.5, "anak_lahir_hidup": 24912, "jumlah_ibu_bersalin_nifas": 26735 },
  "Malang": { "jumlah_kf1": 30973, "kf1_pct": 74.3, "jumlah_kf_lengkap": 30140, "kf_lengkap_pct": 72.3, "jumlah_nifas_vit_a": 30140, "nifas_vit_a_pct": 72.3, "anak_lahir_hidup": 39536, "jumlah_ibu_bersalin_nifas": 41709 },
  "Lumajang": { "jumlah_kf1": 12031, "kf1_pct": 72, "jumlah_kf_lengkap": 11594, "kf_lengkap_pct": 69.3, "jumlah_nifas_vit_a": 12031, "nifas_vit_a_pct": 72, "anak_lahir_hidup": 15921, "jumlah_ibu_bersalin_nifas": 16720 },
  "Jember": { "jumlah_kf1": 29242, "kf1_pct": 72.6, "jumlah_kf_lengkap": 28382, "kf_lengkap_pct": 70.4, "jumlah_nifas_vit_a": 29381, "nifas_vit_a_pct": 72.9, "anak_lahir_hidup": 38289, "jumlah_ibu_bersalin_nifas": 40302 },
  "Banyuwangi": { "jumlah_kf1": 16813, "kf1_pct": 64.4, "jumlah_kf_lengkap": 16366, "kf_lengkap_pct": 62.7, "jumlah_nifas_vit_a": 16813, "nifas_vit_a_pct": 64.4, "anak_lahir_hidup": 24722, "jumlah_ibu_bersalin_nifas": 26098 },
  "Bondowoso": { "jumlah_kf1": 9126, "kf1_pct": 75.3, "jumlah_kf_lengkap": 8839, "kf_lengkap_pct": 72.9, "jumlah_nifas_vit_a": 9118, "nifas_vit_a_pct": 75.2, "anak_lahir_hidup": 11453, "jumlah_ibu_bersalin_nifas": 12124 },
  "Situbondo": { "jumlah_kf1": 7907, "kf1_pct": 77.4, "jumlah_kf_lengkap": 7686, "kf_lengkap_pct": 75.2, "jumlah_nifas_vit_a": 7907, "nifas_vit_a_pct": 77.4, "anak_lahir_hidup": 9924, "jumlah_ibu_bersalin_nifas": 10214 },
  "Probolinggo": { "jumlah_kf1": 15599, "kf1_pct": 86.4, "jumlah_kf_lengkap": 15006, "kf_lengkap_pct": 83.1, "jumlah_nifas_vit_a": 15448, "nifas_vit_a_pct": 85.6, "anak_lahir_hidup": 17332, "jumlah_ibu_bersalin_nifas": 18055 },
  "Pasuruan": { "jumlah_kf1": 23577, "kf1_pct": 97.3, "jumlah_kf_lengkap": 23577, "kf_lengkap_pct": 97.3, "jumlah_nifas_vit_a": 22489, "nifas_vit_a_pct": 92.8, "anak_lahir_hidup": 22968, "jumlah_ibu_bersalin_nifas": 24221 },
  "Sidoarjo": { "jumlah_kf1": 31016, "kf1_pct": 100.2, "jumlah_kf_lengkap": 31007, "kf_lengkap_pct": 100.2, "jumlah_nifas_vit_a": 31008, "nifas_vit_a_pct": 100.2, "anak_lahir_hidup": 29176, "jumlah_ibu_bersalin_nifas": 30947 },
  "Mojokerto": { "jumlah_kf1": 13650, "kf1_pct": 82.7, "jumlah_kf_lengkap": 13358, "kf_lengkap_pct": 80.9, "jumlah_nifas_vit_a": 13650, "nifas_vit_a_pct": 82.7, "anak_lahir_hidup": 15826, "jumlah_ibu_bersalin_nifas": 16513 },
  "Jombang": { "jumlah_kf1": 14339, "kf1_pct": 67.2, "jumlah_kf_lengkap": 14347, "kf_lengkap_pct": 67.2, "jumlah_nifas_vit_a": 14338, "nifas_vit_a_pct": 67.2, "anak_lahir_hidup": 20157, "jumlah_ibu_bersalin_nifas": 21343 },
  "Nganjuk": { "jumlah_kf1": 10262, "kf1_pct": 62.8, "jumlah_kf_lengkap": 9848, "kf_lengkap_pct": 60.2, "jumlah_nifas_vit_a": 10354, "nifas_vit_a_pct": 63.3, "anak_lahir_hidup": 15554, "jumlah_ibu_bersalin_nifas": 16352 },
  "Madiun": { "jumlah_kf1": 6076, "kf1_pct": 59.5, "jumlah_kf_lengkap": 6071, "kf_lengkap_pct": 59.5, "jumlah_nifas_vit_a": 6074, "nifas_vit_a_pct": 59.5, "anak_lahir_hidup": 9589, "jumlah_ibu_bersalin_nifas": 10207 },
  "Magetan": { "jumlah_kf1": 5635, "kf1_pct": 59.9, "jumlah_kf_lengkap": 5627, "kf_lengkap_pct": 59.8, "jumlah_nifas_vit_a": 5627, "nifas_vit_a_pct": 59.8, "anak_lahir_hidup": 8727, "jumlah_ibu_bersalin_nifas": 9408 },
  "Ngawi": { "jumlah_kf1": 7265, "kf1_pct": 62.4, "jumlah_kf_lengkap": 7265, "kf_lengkap_pct": 62.4, "jumlah_nifas_vit_a": 7265, "nifas_vit_a_pct": 62.4, "anak_lahir_hidup": 11097, "jumlah_ibu_bersalin_nifas": 11640 },
  "Bojonegoro": { "jumlah_kf1": 12874, "kf1_pct": 76.3, "jumlah_kf_lengkap": 12449, "kf_lengkap_pct": 73.8, "jumlah_nifas_vit_a": 12169, "nifas_vit_a_pct": 72.1, "anak_lahir_hidup": 16229, "jumlah_ibu_bersalin_nifas": 16868 },
  "Tuban": { "jumlah_kf1": 12734, "kf1_pct": 77.7, "jumlah_kf_lengkap": 12632, "kf_lengkap_pct": 77.1, "jumlah_nifas_vit_a": 12734, "nifas_vit_a_pct": 77.7, "anak_lahir_hidup": 15570, "jumlah_ibu_bersalin_nifas": 16392 },
  "Lamongan": { "jumlah_kf1": 13119, "kf1_pct": 68.4, "jumlah_kf_lengkap": 12766, "kf_lengkap_pct": 66.5, "jumlah_nifas_vit_a": 13046, "nifas_vit_a_pct": 68, "anak_lahir_hidup": 18385, "jumlah_ibu_bersalin_nifas": 19185 },
  "Gresik": { "jumlah_kf1": 15660, "kf1_pct": 78.6, "jumlah_kf_lengkap": 15589, "kf_lengkap_pct": 78.3, "jumlah_nifas_vit_a": 15566, "nifas_vit_a_pct": 78.2, "anak_lahir_hidup": 19218, "jumlah_ibu_bersalin_nifas": 19912 },
  "Bangkalan": { "jumlah_kf1": 15289, "kf1_pct": 80.5, "jumlah_kf_lengkap": 15207, "kf_lengkap_pct": 80.1, "jumlah_nifas_vit_a": 16248, "nifas_vit_a_pct": 85.6, "anak_lahir_hidup": 16236, "jumlah_ibu_bersalin_nifas": 18988 },
  "Sampang": { "jumlah_kf1": 16347, "kf1_pct": 84.9, "jumlah_kf_lengkap": 15708, "kf_lengkap_pct": 81.6, "jumlah_nifas_vit_a": 16044, "nifas_vit_a_pct": 83.3, "anak_lahir_hidup": 18777, "jumlah_ibu_bersalin_nifas": 19249 },
  "Pamekasan": { "jumlah_kf1": 14103, "kf1_pct": 93.9, "jumlah_kf_lengkap": 13367, "kf_lengkap_pct": 89, "jumlah_nifas_vit_a": 13992, "nifas_vit_a_pct": 93.1, "anak_lahir_hidup": 14313, "jumlah_ibu_bersalin_nifas": 15026 },
  "Sumenep": { "jumlah_kf1": 14590, "kf1_pct": 82.7, "jumlah_kf_lengkap": 14104, "kf_lengkap_pct": 80, "jumlah_nifas_vit_a": 14557, "nifas_vit_a_pct": 82.5, "anak_lahir_hidup": 16693, "jumlah_ibu_bersalin_nifas": 17641 },
  "Kota Kediri": { "jumlah_kf1": 3290, "kf1_pct": 69.9, "jumlah_kf_lengkap": 3277, "kf_lengkap_pct": 69.7, "jumlah_nifas_vit_a": 3290, "nifas_vit_a_pct": 69.9, "anak_lahir_hidup": 4447, "jumlah_ibu_bersalin_nifas": 4704 },
  "Kota Blitar": { "jumlah_kf1": 2326, "kf1_pct": 100, "jumlah_kf_lengkap": 2326, "kf_lengkap_pct": 100, "jumlah_nifas_vit_a": 2326, "nifas_vit_a_pct": 100, "anak_lahir_hidup": 2167, "jumlah_ibu_bersalin_nifas": 2326 },
  "Kota Malang": { "jumlah_kf1": 10325, "kf1_pct": 85.4, "jumlah_kf_lengkap": 10243, "kf_lengkap_pct": 84.7, "jumlah_nifas_vit_a": 10328, "nifas_vit_a_pct": 85.4, "anak_lahir_hidup": 11600, "jumlah_ibu_bersalin_nifas": 12096 },
  "Kota Probolinggo": { "jumlah_kf1": 3586, "kf1_pct": 88.5, "jumlah_kf_lengkap": 3571, "kf_lengkap_pct": 88.1, "jumlah_nifas_vit_a": 3671, "nifas_vit_a_pct": 90.6, "anak_lahir_hidup": 3820, "jumlah_ibu_bersalin_nifas": 4053 },
  "Kota Pasuruan": { "jumlah_kf1": 3556, "kf1_pct": 94, "jumlah_kf_lengkap": 3527, "kf_lengkap_pct": 93.2, "jumlah_nifas_vit_a": 3556, "nifas_vit_a_pct": 94, "anak_lahir_hidup": 3486, "jumlah_ibu_bersalin_nifas": 3784 },
  "Kota Mojokerto": { "jumlah_kf1": 1904, "kf1_pct": 96.7, "jumlah_kf_lengkap": 1891, "kf_lengkap_pct": 96, "jumlah_nifas_vit_a": 1904, "nifas_vit_a_pct": 96.7, "anak_lahir_hidup": 1852, "jumlah_ibu_bersalin_nifas": 1969 },
  "Kota Madiun": { "jumlah_kf1": 2862, "kf1_pct": 100, "jumlah_kf_lengkap": 2833, "kf_lengkap_pct": 99, "jumlah_nifas_vit_a": 2862, "nifas_vit_a_pct": 100, "anak_lahir_hidup": 2703, "jumlah_ibu_bersalin_nifas": 2861 },
  "Kota Surabaya": { "jumlah_kf1": 36948, "kf1_pct": 100.4, "jumlah_kf_lengkap": 36898, "kf_lengkap_pct": 100.2, "jumlah_nifas_vit_a": 36948, "nifas_vit_a_pct": 100.4, "anak_lahir_hidup": 35849, "jumlah_ibu_bersalin_nifas": 36818 },
  "Kota Batu": { "jumlah_kf1": 2483, "kf1_pct": 73.4, "jumlah_kf_lengkap": 2498, "kf_lengkap_pct": 73.8, "jumlah_nifas_vit_a": 2469, "nifas_vit_a_pct": 72.9, "anak_lahir_hidup": 3124, "jumlah_ibu_bersalin_nifas": 3385 }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    const name = payload[0].name;
    const dataKey = payload[0].dataKey;

    let jumlah = null;
    if (dataKey === 'kf1_pct') jumlah = data.jumlah_kf1;
    else if (dataKey === 'kf_lengkap_pct') jumlah = data.jumlah_kf_lengkap;
    else if (dataKey === 'nifas_vit_a_pct') jumlah = data.jumlah_nifas_vit_a;
    else {
      jumlah = data[`jumlah_${dataKey.replace('_pct', '')}`] || data[dataKey.replace('_pct', '_jumlah')];
    }

    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2">{label}</div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: payload[0].fill }}></div>
          <span className="text-gray-600">{name}:</span>
          <span className="font-semibold">{value?.toFixed(1)}%</span>
        </div>
        {jumlah !== undefined && jumlah !== null && (
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-transparent"></div>
            <span className="text-gray-600">Jumlah:</span>
            <span className="font-semibold">{Number(jumlah).toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const IBU_OPTIONS = [
  { key: 'k1_pct', label: 'Cakupan K1 (%)' },
  { key: 'k6_pct', label: 'Cakupan K6 (%)' },
  { key: 'persalinan_fasyankes_pct', label: 'Persalinan di Fasyankes (%)' },
  { key: 'kf1_pct', label: 'Cakupan KF1 (%)' },
  { key: 'kf_lengkap_pct', label: 'KF Lengkap (%)' },
  { key: 'nifas_vit_a_pct', label: 'Ibu Nifas Mendapat Vit A (%)' },
]

export default function KesehatanIbu() {
  const { data: kesehatanIbu, loading, error } = useDashboardData()

  const [indic, setIndic] = useState('k1_pct')
  const [chartFilter, setChartFilter] = useState('10')
  const [deathChartFilter, setDeathChartFilter] = useState('10')
  const [compareFilter, setCompareFilter] = useState('10')
  const [corrX, setCorrX] = useState('k1_pct')
  const [corrY, setCorrY] = useState('persalinan_fasyankes_pct')

  const data = useMemo(() => {
    return kesehatanIbu.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR').map(d => {
      const csv = CSV_DATA[d.kabupaten] || {};
      return {
        ...d,
        kf1_pct: csv.kf1_pct || 0,
        jumlah_kf1: csv.jumlah_kf1 || 0,
        kf_lengkap_pct: csv.kf_lengkap_pct || 0,
        jumlah_kf_lengkap: csv.jumlah_kf_lengkap || 0,
        nifas_vit_a_pct: csv.nifas_vit_a_pct || 0,
        jumlah_nifas_vit_a: csv.jumlah_nifas_vit_a || 0,
        anak_lahir_hidup: csv.anak_lahir_hidup || 0,
        ibu_bersalin: csv.jumlah_ibu_bersalin_nifas || 0,
      };
    })
  }, [kesehatanIbu])

  const totKematianIbu = data.reduce((s, d) =>
    s + (d.kematian_ibu_hamil as number) + (d.kematian_ibu_bersalin as number) + (d.kematian_ibu_nifas as number), 0)
  const avgK1 = data.length ? data.reduce((s, d) => s + (d.k1_pct as number), 0) / data.length : 0
  const avgK6 = data.length ? data.reduce((s, d) => s + (d.k6_pct as number), 0) / data.length : 0
  const avgFasyankes = data.length ? data.reduce((s, d) => s + (d.persalinan_fasyankes_pct as number), 0) / data.length : 0
  const avgKB = data.length ? data.reduce((s, d) => s + (d.kb_aktif_pct as number), 0) / data.length : 0
  const avgKEK = data.length ? data.reduce((s, d) => s + (d.bumil_kek_pct as number), 0) / data.length : 0

  const sortedData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number))
  const chartData = chartFilter === 'all' ? sortedData : sortedData.slice(0, Number(chartFilter))
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
    `Berdasarkan data yang terkumpul, total kematian ibu hamil, bersalin, dan nifas berjumlah ${totKematianIbu} kasus.`,
    `Cakupan pelayanan kehamilan awal (K1) rata-rata mencapai ${avgK1.toFixed(1)}%, sementara kunjungan lengkap (K6) berada di angka ${avgK6.toFixed(1)}%. Hal ini menunjukkan bahwa sebagian besar ibu hamil telah memiliki kesadaran untuk memeriksakan kehamilannya.`,
    `Tingkat persalinan di fasilitas pelayanan kesehatan rata-rata berada pada ${avgFasyankes.toFixed(1)}%, menandakan bahwa peran fasilitas kesehatan semakin diutamakan sebagai tempat persalinan yang aman.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      {/* Kematian ibu cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Kematian Ibu" value={totKematianIbu} sub="Hamil + Bersalin + Nifas" icon="❤️" color="#ef4444" />
        <KPICard title="Persentase K1" value={avgK1.toFixed(1) + '%'} sub="Cakupan Kunjungan Pertama" icon="🤰" color="#0FB0AA" />
        <KPICard title="Persentase K6" value={avgK6.toFixed(1) + '%'} sub="Kunjungan Lengkap" icon="📋" color="#06B5D0" />
        <KPICard title="Persentase Persalinan di Fasyankes" value="80,2%" sub="Rata-rata" icon="🏥" color="#CBD92C" />
      </div>

      {/* Kematian ibu breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kematian Ibu per Kabupaten/Kota</h3>
          <select value={deathChartFilter} onChange={e => setDeathChartFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={deathChartFilter === 'all' ? 800 : (deathChartFilter === '20' ? 500 : 350)}>
          <BarChart data={[...data].sort((a, b) =>
            ((b.kematian_ibu_hamil as number) + (b.kematian_ibu_bersalin as number) + (b.kematian_ibu_nifas as number)) -
            ((a.kematian_ibu_hamil as number) + (a.kematian_ibu_bersalin as number) + (a.kematian_ibu_nifas as number))
          ).slice(0, deathChartFilter === 'all' ? data.length : Number(deathChartFilter)).map(d => ({
            kabupaten: d.kabupaten.replace('Kota ', ''),
            hamil: d.kematian_ibu_hamil,
            bersalin: d.kematian_ibu_bersalin,
            nifas: d.kematian_ibu_nifas,
          }))} layout="vertical" margin={{ left: 80, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={80} interval={0} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="bersalin" name="Saat Bersalin" stackId="a" fill="#06B5D0" />
            <Bar dataKey="hamil" name="Saat Hamil" stackId="a" fill="#CBD92C" />
            <Bar dataKey="nifas" name="Saat Nifas" stackId="a" fill="#0FB0AA" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
            <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INFO RINGKAS</span>
          </div>
          <div className="flex items-start gap-2 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
            <div className="leading-relaxed">
              Grafik di atas menunjukkan sebaran kasus kematian ibu di setiap wilayah. Hal ini menjadi peringatan akan pentingnya pemantauan kondisi ibu secara terus-menerus mulai dari masa kehamilan, saat proses melahirkan, hingga masa nifas.
            </div>
          </div>
        </div>
      </div>

      {/* Cakupan layanan */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Pelayanan Ibu</h3>
          <div className="flex gap-2">
            <select value={chartFilter} onChange={e => setChartFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Semua</option>
            </select>
            <select value={indic} onChange={e => setIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {IBU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={chartFilter === 'all' ? 800 : (chartFilter === '20' ? 500 : 350)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 100]} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} interval={0} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]} fill="#0FB0AA" />
          </BarChart>
        </ResponsiveContainer>
        <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
            <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INFO RINGKAS</span>
          </div>
          <div className="flex items-start gap-2 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
            <div className="leading-relaxed">
              Pencapaian layanan ibu hamil dan bersalin (seperti kunjungan pertama/K1, hingga persalinan di fasilitas medis) bervariasi di setiap kabupaten/kota. Angka di atas 80% (berwarna hijau) menunjukkan bahwa mayoritas ibu di wilayah tersebut sudah menerima pelayanan yang memadai. Sebaliknya, baris berwarna oranye menandakan area yang membutuhkan penguatan ekstra.
            </div>
          </div>
        </div>
      </div>

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

      <StatPanel
        stats={stats}
        label={indicLabel}
        format={v => v.toFixed(1) + '%'}
        rightElement={
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {IBU_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />

      {/* 3 Perbandingan Indikator Kunci */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Perbandingan Pasangan Indikator Kunci</h3>
          <select value={compareFilter} onChange={e => setCompareFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Semua</option>
          </select>
        </div>

        {/* Chart A */}
        <div className="mb-10">
          <h4 className="font-medium text-gray-700 mb-2">A. Cakupan Ibu Hamil Dapat Tablet Fe vs Kunjungan K6</h4>
          <div className="w-full overflow-x-auto pb-4">
            <div style={{ width: compareFilter === 'all' ? 1800 : (compareFilter === '20' ? 1000 : '100%'), height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareFilter === 'all' ? data : data.slice(0, Number(compareFilter))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="kabupaten" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="fe_tablet_pct" name="Tablet Fe (%)" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="k6_pct" name="Kunjungan K6 (%)" fill="#CBD92C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
              <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INFO RINGKAS</span>
            </div>
            <div className="flex items-start gap-2 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
              <div className="leading-relaxed">
                Grafik ini menyoroti perbandingan ibu hamil yang menerima suplemen zat besi (Fe) dengan mereka yang melengkapi minimal kunjungan K6. Semakin dekat jarak antara kedua garis (selisih di bawah 10%), semakin terintegrasi layanan kehamilan di daerah tersebut.<br /><br />
                <em>* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1.</em>
              </div>
            </div>
          </div>
        </div>

        {/* Chart B */}
        <div className="mb-10">
          <h4 className="font-medium text-gray-700 mb-2">B. Jumlah Ibu Bersalin vs Jumlah Anak Lahir Hidup</h4>
          <div className="w-full overflow-x-auto pb-4">
            <div style={{ width: compareFilter === 'all' ? 1800 : (compareFilter === '20' ? 1000 : '100%'), height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareFilter === 'all' ? data : data.slice(0, Number(compareFilter))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="kabupaten" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID')} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ibu_bersalin" name="Ibu Bersalin" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="anak_lahir_hidup" name="Anak Lahir Hidup" fill="#CBD92C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
              <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INFO RINGKAS</span>
            </div>
            <div className="flex items-start gap-2 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
              <div className="leading-relaxed">
                Secara logika, jumlah ibu yang melahirkan idealnya sangat mendekati atau sama dengan jumlah bayi yang lahir dalam kondisi hidup (kecuali jika ada bayi kembar). Jika selisih terlalu jauh, hal itu mengindikasikan kemungkinan masalah pencatatan atau pelaporan yang tidak akurat.<br /><br />
                <em>* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1.</em>
              </div>
            </div>
          </div>
        </div>

        {/* Chart C */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">C. Cakupan Ibu Nifas Mendapat Vitamin A vs Pelayanan KF Lengkap</h4>
          <div className="w-full overflow-x-auto pb-4">
            <div style={{ width: compareFilter === 'all' ? 1800 : (compareFilter === '20' ? 1000 : '100%'), height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareFilter === 'all' ? data : data.slice(0, Number(compareFilter))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="kabupaten" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => v?.toFixed(1) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="nifas_vit_a_pct" name="Vitamin A Nifas (%)" fill="#0FB0AA" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="kf_lengkap_pct" name="KF Lengkap (%)" fill="#CBD92C" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
              <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INFO RINGKAS</span>
            </div>
            <div className="flex items-start gap-2 ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
              <div className="leading-relaxed">
                Pemeriksaan lengkap paska melahirkan (KF) sepatutnya dibarengi dengan pemberian Vitamin A untuk kesehatan dan kekebalan tubuh sang ibu. Keselarasan kedua data ini mencerminkan apakah standar penanganan pasien benar-benar berjalan satu paket.<br /><br />
                <em>* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1.</em>
              </div>
            </div>
          </div>
        </div>
      </div>


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
