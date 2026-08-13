import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LabelList
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats } from '../utils/stats'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'
import { useAuth } from '../contexts/AuthContext'

const KATEGORI_OPTIONS = [
  'Semua',
  'Rumah Sakit',
  'Puskesmas dan Jaringannya',
  'Sarana Pelayanan Lain',
  'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan'
]

const ALL_FASILITAS = [
  { key: 'rs_umum', label: 'Rumah Sakit Umum', cat: 'Rumah Sakit' },
  { key: 'rs_khusus', label: 'Rumah Sakit Khusus', cat: 'Rumah Sakit' },
  { key: 'jumlah_tempat_tidur', label: 'Jumlah Tempat Tidur', cat: 'Rumah Sakit', isNotFaskes: true },
  { key: 'puskesmas_rawat_inap', label: 'Puskesmas Rawat Inap', cat: 'Puskesmas dan Jaringannya' },
  { key: 'puskesmas_non_rawat_inap', label: 'Puskesmas Non Rawat Inap', cat: 'Puskesmas dan Jaringannya' },
  { key: 'puskesmas_keliling', label: 'Puskesmas Keliling', cat: 'Puskesmas dan Jaringannya' },
  { key: 'puskesmas_pembantu', label: 'Puskesmas Pembantu', cat: 'Puskesmas dan Jaringannya' },
  { key: 'klinik_pratama', label: 'Klinik Pratama', cat: 'Sarana Pelayanan Lain' },
  { key: 'klinik_utama', label: 'Klinik Utama', cat: 'Sarana Pelayanan Lain' },
  { key: 'tempat_praktik_mandiri_dokter', label: 'Tempat Praktik Mandiri Dokter', cat: 'Sarana Pelayanan Lain' },
  { key: 'tempat_praktik_mandiri_dokter_gigi', label: 'Tempat Praktik Mandiri Dokter Gigi', cat: 'Sarana Pelayanan Lain' },
  { key: 'tempat_praktik_mandiri_dokter_spesialis', label: 'Tempat Praktik Mandiri Dokter Spesialis', cat: 'Sarana Pelayanan Lain' },
  { key: 'tempat_praktik_mandiri_bidan', label: 'Tempat Praktik Mandiri Bidan', cat: 'Sarana Pelayanan Lain' },
  { key: 'tempat_praktik_mandiri_perawat', label: 'Tempat Praktik Mandiri Perawat', cat: 'Sarana Pelayanan Lain' },
  { key: 'griya_sehat', label: 'Griya Sehat', cat: 'Sarana Pelayanan Lain' },
  { key: 'panti_sehat', label: 'Panti Sehat', cat: 'Sarana Pelayanan Lain' },
  { key: 'unit_pengelola_darah', label: 'Unit Pengelola Darah', cat: 'Sarana Pelayanan Lain' },
  { key: 'laboratorium_kesehatan', label: 'Laboratorium Kesehatan', cat: 'Sarana Pelayanan Lain' },
  { key: 'industri_farmasi', label: 'Industri Farmasi', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'industri_obat_tradisional', label: 'Industri Obat Tradisional', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'usaha_kecil_mikro_obat_tradisional', label: 'Usaha Kecil/Mikro Obat Tradisional', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'produksi_alat_kesehatan', label: 'Produksi Alat Kesehatan', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'produksi_pkrt', label: 'Produksi PKRT', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'industri_kosmetika', label: 'Industri Kosmetika', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'pedagang_besar_farmasi', label: 'Pedagang Besar Farmasi', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'distributor_alat_kesehatan', label: 'Distributor Alat Kesehatan', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'apotek', label: 'Apotek', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'toko_obat', label: 'Toko Obat', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' },
  { key: 'toko_alkes', label: 'Toko Alkes', cat: 'Sarana Produksi dan Distribusi Farmasi dan Alat Kesehatan' }
]

const CustomTooltip = ({ active, payload, totalFaskes }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isCountable = !ALL_FASILITAS.find(f => f.label === data.name)?.isNotFaskes
    const percentage = isCountable && totalFaskes > 0 ? ((data.value / totalFaskes) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null

    return (
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-lg">
        <p className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{data.name}</p>
        <p className="text-sm text-gray-600">Jumlah: <span className="font-bold text-[#0F8F8B]">{data.value.toLocaleString('id-ID')}</span></p>
        {percentage && (
          <p className="text-sm text-gray-500 mt-1">{percentage}% dari total faskes pada kategori ini</p>
        )}
      </div>
    )
  }
  return null
}

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const label = payload.value
  const displayLabel = label.length > 26 ? label.substring(0, 26) + '...' : label
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={-5} y={0} dy={4} textAnchor="end" fill="#6b7280" fontSize={11} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {displayLabel}
      </text>
    </g>
  )
}

export default function SaranaKesehatan() {
  const { data: saranaKesehatan, loading, error } = useDashboardData()
  const { isAdmin } = useAuth()

  const [kategori, setKategori] = useState('Semua')
  const [tampilan, setTampilan] = useState('Top 10')
  const [statIndic, setStatIndic] = useState('rs_umum')

  const jatim = useMemo(() => saranaKesehatan.find(d => d.kabupaten === 'PROV. JAWA TIMUR') || {}, [saranaKesehatan])

  const data = useMemo(() => saranaKesehatan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [saranaKesehatan])

  const stats = useMemo(() => descStats(data.map(d => Number(d[statIndic] || 0))), [data, statIndic])
  const statIndicLabel = ALL_FASILITAS.find(f => f.key === statIndic)?.label || statIndic

  const chartDataRaw = useMemo(() => {
    return ALL_FASILITAS
      .filter(opt => opt.key !== 'jumlah_tempat_tidur')
      .filter(opt => kategori === 'Semua' || opt.cat === kategori)
      .map(opt => ({
        name: opt.label,
        value: Number(jatim[opt.key] || 0),
        isNotFaskes: opt.isNotFaskes
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [jatim, kategori])

  const chartData = useMemo(() => {
    return tampilan === 'Top 10' ? chartDataRaw.slice(0, 10) : chartDataRaw
  }, [chartDataRaw, tampilan])

  // Hitung total khusus untuk yang isNotFaskes == falsy
  const totalFaskes = chartDataRaw.reduce((sum, item) => sum + (item.isNotFaskes ? 0 : item.value), 0)

  const insights = useMemo(() => {
    const validData = chartDataRaw.filter(d => !d.isNotFaskes)
    if (validData.length === 0) return []

    const max = validData[0]
    const min = validData[validData.length - 1]
    const pctMax = totalFaskes > 0 ? ((max.value / totalFaskes) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : 0

    return [
      `Total fasilitas kesehatan yang tercatat pada kategori ${kategori} se-Jawa Timur berjumlah ${totalFaskes.toLocaleString('id-ID')} unit.`,
      `${max.name} mendominasi dengan jumlah terbanyak, yaitu ${max.value.toLocaleString('id-ID')} unit (berkontribusi sebesar ${pctMax}%). Fasilitas ini berperan sebagai garda terdepan layanan pada kategorinya, sehingga ketersediaan alat, obat, dan mutunya harus dijaga secara konsisten.`,
      `Sebaliknya, ${min.name} tercatat paling minim dengan jumlah ${min.value.toLocaleString('id-ID')} unit. Angka ini perlu dievaluasi lebih lanjut: apakah jumlah tersebut sudah memadai untuk populasi yang ada, atau justru masyarakat kesulitan mendapat akses sehingga butuh pembangunan fasilitas tambahan.`
    ]
  }, [chartDataRaw, kategori, totalFaskes])

  // Data Tabel tetap menggunakan ALL_FASILITAS tapi difilter > 0
  const tableData = useMemo(() => {
    return ALL_FASILITAS
      .map(opt => ({
        name: opt.label,
        value: Number((jatim as any)[opt.key] || 0)
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [jatim])

  const totRS = Number((jatim as any).rs_umum || 0) + Number((jatim as any).rs_khusus || 0)
  const totPuskesmas = Number((jatim as any).puskesmas_rawat_inap || 0) + Number((jatim as any).puskesmas_non_rawat_inap || 0)
  const totKlinik = Number((jatim as any).klinik_pratama || 0) + Number((jatim as any).klinik_utama || 0)
  const totTPM = Number((jatim as any).tempat_praktik_mandiri_dokter || 0) + Number((jatim as any).tempat_praktik_mandiri_dokter_gigi || 0) + Number((jatim as any).tempat_praktik_mandiri_dokter_spesialis || 0) + Number((jatim as any).tempat_praktik_mandiri_bidan || 0) + Number((jatim as any).tempat_praktik_mandiri_perawat || 0)
  const totApotek = Number((jatim as any).apotek || 0)

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  const calculatedLeftMargin = 160

  // Dynamic height based on items to render
  const chartHeight = chartData.length * 40 + 60

  return (
    <div className="flex flex-col gap-5">

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPICard title="Rumah Sakit" value={totRS.toLocaleString('id-ID')} sub="Umum + Khusus" icon="🏨" color="#078FA5" />
        <KPICard title="Puskesmas" value={totPuskesmas.toLocaleString('id-ID')} sub="Rawat Inap + Non" icon="🏥" color="#0F8F8B" />
        <KPICard title="Klinik" value={totKlinik.toLocaleString('id-ID')} sub="Pratama + Utama" icon="🩺" color="#9EAF24" />
        <KPICard title="Praktik Mandiri" value={totTPM.toLocaleString('id-ID')} sub="Dokter, Bidan, Perawat" icon="👨‍⚕️" color="#f97316" />
        <KPICard title="Apotek" value={totApotek.toLocaleString('id-ID')} sub="Unit" icon="💊" color="#8b5cf6" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Distribusi Fasilitas Kesehatan di Provinsi Jawa Timur</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={kategori} onChange={e => { setKategori(e.target.value); setTampilan('Semua') }}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-gray-50 text-gray-700">
              {KATEGORI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={tampilan} onChange={e => setTampilan(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-teal-400 bg-gray-50 text-gray-700">
              <option value="Top 10">Top 10</option>
              <option value="Semua">Semua</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div style={{ minWidth: 600, width: '100%' }}>
            <ResponsiveContainer width="100%" height={Math.max(chartHeight, 250)}>
              <BarChart data={chartData} layout="vertical" margin={{ left: calculatedLeftMargin, right: 80, top: 10, bottom: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={<CustomYAxisTick />} width={calculatedLeftMargin} interval={0} />
                <Tooltip content={<CustomTooltip totalFaskes={totalFaskes} />} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="value" name="Jumlah" radius={[0, 6, 6, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill="#0F8F8B" />)}
                  <LabelList dataKey="value" position="right" formatter={(v: any) => v.toLocaleString('id-ID')} style={{ fontSize: 11, fill: '#4b5563', fontWeight: 500 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {insights.length > 0 && <InsightBox insights={insights} />}

      <StatPanel
        stats={stats}
        label={statIndicLabel}
        rightElement={
          <select value={statIndic} onChange={e => setStatIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {ALL_FASILITAS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />

      {isAdmin && (
        <CrosstabSection
          data={saranaKesehatan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')}
          variables={ALL_FASILITAS.filter(f => f.key !== 'jumlah_tempat_tidur').map(f => ({ key: f.key, label: f.label }))}
          defaultRowVar="rs_umum"
          defaultColVar="puskesmas_rawat_inap"
        />
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-2">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Daftar Lengkap Fasilitas Kesehatan</h3>
        <DataTable data={tableData} searchPlaceholder="Cari fasilitas kesehatan..." columns={[
          { key: 'name', label: 'Jenis Fasilitas' },
          { key: 'value', label: 'Jumlah', format: v => v.toLocaleString('id-ID') }
        ]} />
      </div>
    </div>
  )
}
