import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import { KABUPATEN_LIST } from '../data/kabupaten'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import ChoroplethMap from '../components/ChoroplethMap'
import CrosstabSection from '../components/CrosstabSection'

const fmtRp = (v: number) => 'Rp ' + (v >= 1e12 ? (v / 1e12).toFixed(2) + ' T' : v >= 1e9 ? (v / 1e9).toFixed(1) + ' M' : v >= 1e6 ? (v / 1e6).toFixed(0) + ' jt' : v.toLocaleString('id-ID'))

export default function PembiayaanKesehatan() {
  const { data: pembiayaan, loading, error } = useDashboardData()

  const [statIndic, setStatIndic] = useState('2025')
  const [trendKab, setTrendKab] = useState('all')
  const [mapYear, setMapYear] = useState('2025')
  const [chartFilter, setChartFilter] = useState('all')

  const pbiData = [
    { name: 'PBI APBN', value: 15361033, percentage: 36.5 },
    { name: 'PBI APBD', value: 7507367, percentage: 17.8 }
  ]
  const pbiColors = ['#0FB0AA', '#CBD92C']

  const nonPbiData = [
    { name: 'Pekerja Penerima Upah (PPU)', value: 6863643, percentage: 16.3 },
    { name: 'Pekerja Mandiri (PBPU)', value: 2681330, percentage: 6.4 },
    { name: 'Bukan Pekerja (BP)', value: 773500, percentage: 1.8 }
  ]
  const nonPbiColors = ['#06B5D0', '#0FB0AA', '#CBD92C']

  const data = useMemo(() => pembiayaan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [pembiayaan])
  const kpiData = data

  const totalAngg25 = kpiData.reduce((s, d) => s + Number(d["2025"] || 0), 0)
  const avgAngg = kpiData.length ? totalAngg25 / kpiData.length : 0
  const maxKab = kpiData.length ? kpiData.reduce((a, b) => Number(a["2025"] || 0) > Number(b["2025"] || 0) ? a : b) : null
  const minKab = kpiData.length ? kpiData.reduce((a, b) => Number(a["2025"] || 0) < Number(b["2025"] || 0) ? a : b) : null

  const trendDataSelected = useMemo(() => {
    if (trendKab === 'all') return pembiayaan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')
    return pembiayaan.filter(d => d.kabupaten === trendKab)
  }, [trendKab, pembiayaan])
  const val23 = trendDataSelected.reduce((s, d) => s + Number(d["2023"] || 0), 0);
  const val24 = trendDataSelected.reduce((s, d) => s + Number(d["2024"] || 0), 0);
  const val25 = trendDataSelected.reduce((s, d) => s + Number(d["2025"] || 0), 0);
  const trendData = [
    { tahun: '2023', total: val23 },
    { tahun: '2024', total: val24 },
    { tahun: '2025', total: val25 },
  ]
  const growth = val24 > 0 ? ((val25 - val24) / val24 * 100).toFixed(1) : '0';

  const sortedData = [...data]
    .filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')
    .sort((a, b) => Number(b["2025"] || 0) - Number(a["2025"] || 0))

  const chartData = chartFilter === 'all' ? sortedData : sortedData.slice(0, Number(chartFilter))

  const statsVals = data.map(d => Number(d[statIndic] || 0))
  const stats = descStats(statsVals)

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Anggaran Kesehatan" value="Rp 6.461.825.519.944" icon="💰" color="#0FB0AA" />
        <KPICard title="Rata-rata Pembiayaan" value={fmtRp(avgAngg)} sub="Per Kab/Kota" icon="📊" color="#CBD92C" />
        <KPICard title="Pembiayaan Tertinggi" value={maxKab ? maxKab.kabupaten : '-'} sub={maxKab ? fmtRp(Number(maxKab["2025"])) : ''} icon="🏆" color="#06B5D0" />
        <KPICard title="Pembiayaan Terendah" value={minKab ? minKab.kabupaten : '-'} sub={minKab ? fmtRp(Number(minKab["2025"])) : ''} icon="⚠️" color="#f97316" />
      </div>

      {/* JKN Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0FB0AA] flex items-center justify-center text-3xl mb-4">
            🛡️
          </div>
          <h3 className="font-semibold text-gray-800 text-lg mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Cakupan JKN
          </h3>
          <div className="text-4xl font-bold text-[#0FB0AA] mb-2">33.186.873</div>
          <div className="text-sm font-medium px-3 py-1 bg-teal-50 text-teal-700 rounded-full">
            78,8% dari total populasi
          </div>
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Jumlah penduduk Provinsi Jawa Timur yang telah terlindungi program Jaminan Kesehatan Nasional.
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm md:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Rincian Peserta JKN Berdasarkan Kategori</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[250px]">
            <div className="flex flex-col items-center h-full w-full">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Penerima Bantuan Iuran (PBI)</h4>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pbiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pbiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pbiColors[index % pbiColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value.toLocaleString('id-ID')} (${props.payload.percentage}%)`,
                        name
                      ]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col items-center h-full w-full">
              <h4 className="text-sm font-semibold text-gray-600 mb-2">Non PBI</h4>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={nonPbiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {nonPbiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={nonPbiColors[index % nonPbiColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value.toLocaleString('id-ID')} (${props.payload.percentage}%)`,
                        name
                      ]}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Choropleth Map */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Peta Sebaran Pembiayaan Kesehatan Provinsi Jawa Timur</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Tahun:</span>
            <select
              value={mapYear}
              onChange={e => setMapYear(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0FB0AA] bg-gray-50 text-gray-700"
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>
        <ChoroplethMap
          data={data}
          indicatorKey={mapYear}
          indicatorLabel={`Anggaran Kesehatan ${mapYear}`}
        />
      </div>

      {/* Bar Charts Row */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Anggaran Kesehatan 2025</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Tampilkan:</span>
            <select
              value={chartFilter}
              onChange={e => setChartFilter(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0FB0AA] bg-gray-50 text-gray-700"
            >
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Keseluruhan</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={chartFilter === 'all' ? 800 : (chartFilter === '20' ? 450 : 350)}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1e12 ? (v / 1e12).toFixed(1) + 'T' : v >= 1e9 ? (v / 1e9).toFixed(0) + 'M' : (v / 1e6).toFixed(0) + 'jt'} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={98} interval={0} />
            <Tooltip formatter={(v: any) => fmtRp(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="2025" name="Anggaran 2025" radius={[0, 6, 6, 0]} fill="#0FB0AA" />
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
              Setiap daerah memiliki jumlah anggaran yang berbeda-beda untuk membiayai layanan kesehatan. Saat ini, <strong>{maxKab?.kabupaten}</strong> memiliki anggaran paling banyak (<strong>{fmtRp(Number(maxKab?.["2025"]))}</strong>), sementara <strong>{minKab?.kabupaten}</strong> mengalokasikan anggaran paling sedikit (<strong>{fmtRp(Number(minKab?.["2025"]))}</strong>).
            </div>
          </div>
        </div>
      </div>

      {/* Trend Area Chart with Filter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Tren Anggaran (2023 - 2025)</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Kabupaten/Kota:</span>
            <select
              value={trendKab}
              onChange={e => setTrendKab(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0FB0AA] bg-gray-50 text-gray-700"
            >
              <option value="all">Total Semua Kabupaten/Kota</option>
              {KABUPATEN_LIST.map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={trendData} margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="tahun" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1e12).toFixed(1) + 'T'} width={80} />
            <Tooltip formatter={(v: any) => fmtRp(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="total" stroke="#0FB0AA" fill="#0FB0AA22" strokeWidth={3} name="Total Anggaran" activeDot={{ r: 6, fill: '#0FB0AA', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
            <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INFO RINGKAS</span>
          </div>
          <div className="flex items-start gap-2 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
            <div className="leading-relaxed">
              Jika kita melihat tiga tahun ke belakang, total dana kesehatan di wilayah ini sebesar <strong>{fmtRp(val25)}</strong> pada tahun 2025. Angka ini {Number(growth) > 0 ? "naik" : Number(growth) < 0 ? "turun" : "tetap sama"} sekitar <strong>{Math.abs(Number(growth))}%</strong> jika dibandingkan dengan tahun lalu (2024).
            </div>
          </div>
        </div>
      </div>



      <CrosstabSection
        data={data.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')}
        variables={[
          { key: '2023', label: 'Anggaran Kesehatan 2023' },
          { key: '2024', label: 'Anggaran Kesehatan 2024' },
          { key: '2025', label: 'Anggaran Kesehatan 2025' }
        ]}
        defaultRowVar="2024"
        defaultColVar="2025"
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Daftar Lengkap Pembiayaan Kesehatan Provinsi Jawa Timur Berdasarkan Kabupaten/Kota
        </h3>
        <DataTable data={data} columns={[
          { key: 'kabupaten', label: 'Kabupaten/Kota' },
          { key: '2023', label: 'Anggaran 2023', format: v => fmtRp(Number(v || 0)) },
          { key: '2024', label: 'Anggaran 2024', format: v => fmtRp(Number(v || 0)) },
          { key: '2025', label: 'Anggaran 2025', format: v => fmtRp(Number(v || 0)) }
        ]} />
      </div>
    </div>
  )
}
