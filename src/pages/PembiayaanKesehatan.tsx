import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, AreaChart, Area
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

const fmtRp = (v: number) => 'Rp ' + (v >= 1e12 ? (v / 1e12).toFixed(2) + ' T' : v >= 1e9 ? (v / 1e9).toFixed(1) + ' M' : v >= 1e6 ? (v / 1e6).toFixed(0) + ' jt' : v.toLocaleString('id-ID'))

export default function PembiayaanKesehatan() {
  const { data: pembiayaan, loading, error } = useDashboardData()

  const [kab, setKab] = useState('all')
  const [tahun, setTahun] = useState('2025')
  const [trendKab, setTrendKab] = useState('all')
  const [mapYear, setMapYear] = useState('2025')

  const data = useMemo(() => kab === 'all' ? pembiayaan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : pembiayaan.filter(d => d.kabupaten === kab), [kab, pembiayaan])
  const kpiData = pembiayaan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')

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

  const chartData = [...data]
    .filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')
    .sort((a, b) => Number(b["2025"] || 0) - Number(a["2025"] || 0))
    .slice(0, 15)

  const statsVals = data.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR').map(d => Number(d["2025"] || 0))
  const stats = descStats(statsVals)

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-6">
      <FilterBar kab={kab} tahun={tahun} onKab={setKab} onTahun={setTahun} hideKabFilter />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Pembiayaan Provinsi" value={fmtRp(totalAngg25)} icon="💰" color="#0FB0AA" />
        <KPICard title="Rata-rata Pembiayaan" value={fmtRp(avgAngg)} sub="Per Kab/Kota" icon="📊" color="#CBD92C" />
        <KPICard title="Pembiayaan Tertinggi" value={maxKab ? maxKab.kabupaten : '-'} sub={maxKab ? fmtRp(Number(maxKab["2025"])) : ''} icon="🏆" color="#06B5D0" />
        <KPICard title="Pembiayaan Terendah" value={minKab ? minKab.kabupaten : '-'} sub={minKab ? fmtRp(Number(minKab["2025"])) : ''} icon="⚠️" color="#f97316" />
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
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Anggaran Kesehatan 2025 (Top 15)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1e12 ? (v/1e12).toFixed(1)+'T' : v >= 1e9 ? (v/1e9).toFixed(0)+'M' : (v/1e6).toFixed(0)+'jt'} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={98} interval={0} />
            <Tooltip formatter={(v: any) => fmtRp(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="2025" name="Anggaran 2025" radius={[0, 6, 6, 0]} fill="#0FB0AA" />
          </BarChart>
        </ResponsiveContainer>
        <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
            <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INSIGHT OTOMATIS</span>
          </div>
          <div className="flex items-start gap-2 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
            <div className="leading-relaxed">
              Terdapat rentang alokasi anggaran yang signifikan di Provinsi Jawa Timur. Anggaran kesehatan tertinggi dipegang oleh <strong>{maxKab?.kabupaten}</strong> sebesar <strong>{fmtRp(Number(maxKab?.["2025"]))}</strong>, sedangkan anggaran terendah berada di <strong>{minKab?.kabupaten}</strong> sebesar <strong>{fmtRp(Number(minKab?.["2025"]))}</strong>.
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
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1e12).toFixed(1)+'T'} width={80} />
            <Tooltip formatter={(v: any) => fmtRp(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Area type="monotone" dataKey="total" stroke="#0FB0AA" fill="#0FB0AA22" strokeWidth={3} name="Total Anggaran" activeDot={{ r: 6, fill: '#0FB0AA', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
        <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
            <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">INSIGHT OTOMATIS</span>
          </div>
          <div className="flex items-start gap-2 ml-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
            <div className="leading-relaxed">
              Berdasarkan tren historis 3 tahun terakhir pada wilayah yang dipilih, total anggaran kesehatan mencapai <strong>{fmtRp(val25)}</strong> pada tahun 2025. Terjadi fluktuasi pertumbuhan sebesar <strong>{growth}%</strong> dibandingkan dengan alokasi pada tahun sebelumnya (2024).
            </div>
          </div>
        </div>
      </div>

      <StatPanel stats={stats} label="Anggaran 2025" format={v => fmtRp(Math.round(v))} />
      <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-[#0FB0AA] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
          <span className="text-[#0FB0AA] font-bold text-sm tracking-wide">STATISTIK POPULASI</span>
        </div>
        <div className="flex items-start gap-2 ml-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0FB0AA] mt-1.5 flex-shrink-0" />
          <div className="leading-relaxed">
            Data menunjukkan bahwa rata-rata anggaran kesehatan provinsi adalah <strong>{fmtRp(Math.round(stats?.mean || 0))}</strong>, dengan mayoritas nilai pembiayaan terpusat di sekitar median sebesar <strong>{fmtRp(Math.round(stats?.median || 0))}</strong>. Rentang (range) selisih pembiayaan antar kabupaten mencapai nilai ekstrem di <strong>{fmtRp(Math.round(stats ? stats.max - stats.min : 0))}</strong>.
          </div>
        </div>
      </div>

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
