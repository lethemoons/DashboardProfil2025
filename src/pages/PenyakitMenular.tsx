import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ScatterChart, Scatter
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'

const OPTIONS = [
  { key: 'tbc_kasus', label: 'TBC — Jumlah Kasus' },
  { key: 'tbc_sukses_pct', label: 'TBC — Sukses Pengobatan (%)' },
  { key: 'pneumonia_balita', label: 'Pneumonia Balita' },
  { key: 'odhiv_baru', label: 'ODHIV Baru Ditemukan' },
  { key: 'arv_pct', label: 'ODHIV Mendapat ARV (%)' },
  { key: 'diare_semua_umur', label: 'Diare Semua Umur' },
  { key: 'diare_balita', label: 'Diare Balita' },
  { key: 'hepatitis_bumil_reaktif', label: 'Hepatitis Bumil Reaktif' },
  { key: 'kusta_pb', label: 'Kusta PB (Pausi Basiler)' },
  { key: 'kusta_mb', label: 'Kusta MB (Multi Basiler)' },
]

const TBCTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length >= 2) {
    const pKasus = payload.find((p: any) => p.dataKey === 'kasus')
    const pSukses = payload.find((p: any) => p.dataKey === 'sukses_pct')
    const pLengkap = payload.find((p: any) => p.dataKey === 'pengobatan_lengkap')
    
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-4 text-sm min-w-[200px]">
        <div className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-50">{label}</div>
        
        {pKasus && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pKasus.color }}></div>
              <span className="text-gray-600">Jumlah Kasus</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pKasus.value).toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {pSukses && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pSukses.color }}></div>
              <span className="text-gray-600">Sukses Pengobatan</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pSukses.value).toFixed(1)}%</span>
          </div>
        )}

        {pLengkap && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pLengkap.color }}></div>
              <span className="text-gray-600">Pengobatan Lengkap</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pLengkap.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    )
  }
  return null
}
const ODHIVTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length >= 2) {
    const pBaru = payload.find((p: any) => p.dataKey === 'baru')
    const pArv = payload.find((p: any) => p.dataKey === 'arv')
    const pPct = payload.find((p: any) => p.dataKey === 'arv_pct')
    
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-4 text-sm min-w-[200px]">
        <div className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-50">{label}</div>
        
        {pBaru && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pBaru.color }}></div>
              <span className="text-gray-600">ODHIV Baru</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pBaru.value).toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {pArv && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pArv.color }}></div>
              <span className="text-gray-600">Mendapat ARV</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pArv.value).toLocaleString('id-ID')}</span>
          </div>
        )}

        {pPct && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pPct.color }}></div>
              <span className="text-gray-600">Persentase ARV</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pPct.value).toFixed(1)}%</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

const DiareTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const pDilayani = payload.find((p: any) => p.dataKey === 'dilayani')
    const pOralit = payload.find((p: any) => p.dataKey === 'oralit')
    const pZinc = payload.find((p: any) => p.dataKey === 'zinc')
    
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-xl p-4 text-sm min-w-[200px]">
        <div className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-50">{label}</div>
        
        {pDilayani && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pDilayani.color }}></div>
              <span className="text-gray-600">Dilayani</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pDilayani.value).toLocaleString('id-ID')}</span>
          </div>
        )}
        
        {pOralit && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pOralit.color }}></div>
              <span className="text-gray-600">Mendapat Oralit</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pOralit.value).toLocaleString('id-ID')}</span>
          </div>
        )}

        {pZinc && pZinc.value !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pZinc.color }}></div>
              <span className="text-gray-600">Mendapat Zinc</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pZinc.value).toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>
    )
  }
  return null
}

export default function PenyakitMenular() {
  const { data: penyakitMenular, loading, error } = useDashboardData()

  const [indic, setIndic] = useState('tbc_kasus')
  const [indicFilter, setIndicFilter] = useState('10')
  const [tbcFilter, setTbcFilter] = useState('10')
  const [odhivFilter, setOdhivFilter] = useState('10')
  const [diareFilter, setDiareFilter] = useState('10')
  const [diareAge, setDiareAge] = useState('balita')
  const [corrX, setCorrX] = useState('tbc_kasus')
  const [corrY, setCorrY] = useState('diare_semua_umur')

  const data = useMemo(() => penyakitMenular.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [penyakitMenular])

  const totTBC = data.reduce((s, d) => s + (d.tbc_kasus as number), 0)
  const totODHIV = data.reduce((s, d) => s + (d.odhiv_baru as number), 0)
  const totDiare = data.reduce((s, d) => s + (d.diare_semua_umur as number), 0)
  const totKusta = data.reduce((s, d) => s + (d.kusta_pb as number) + (d.kusta_mb as number), 0)

  const sortedData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number))
  const chartData = indicFilter === 'all' ? sortedData : sortedData.slice(0, Number(indicFilter))
  
  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = OPTIONS.find(o => o.key === indic)?.label ?? indic
  const maxKab = data.length ? data.reduce((a, b) => (a[indic] as number) > (b[indic] as number) ? a : b) : null
  const minKab = data.length ? data.reduce((a, b) => (a[indic] as number) < (b[indic] as number) ? a : b) : null

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  // TBC breakdown chart
  const tbcSorted = [...data].sort((a, b) => (b.tbc_kasus as number) - (a.tbc_kasus as number))
  const tbcChartData = (tbcFilter === 'all' ? tbcSorted : tbcSorted.slice(0, Number(tbcFilter))).map(d => {
    if (d.kabupaten === 'Kabupaten Pacitan' || d.kabupaten === 'Pacitan' || d.kabupaten === 'KAB. PACITAN') {
      console.log('Pacitan Raw Data:', d)
      console.log('Kematian Value:', d['60_lakilaki_+_perempuan_jumlah_4'])
    }
    return {
      kabupaten: d.kabupaten.replace('Kota ', ''),
      kasus: d.tbc_kasus,
      sukses_pct: d.tbc_sukses_pct,
      pengobatan_lengkap: d.tbc_pengobatan_lengkap_pct || 0,
    }
  })

  // ODHIV breakdown chart
  const odhivSorted = [...data].sort((a, b) => (b.odhiv_baru as number || 0) - (a.odhiv_baru as number || 0))
  const odhivChartData = (odhivFilter === 'all' ? odhivSorted : odhivSorted.slice(0, Number(odhivFilter))).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    baru: d.odhiv_baru || 0,
    arv: d.odhiv_arv_jumlah || 0,
    arv_pct: d.arv_pct || 0,
  }))

  // Diare breakdown chart
  const isBalita = diareAge === 'balita'
  const diareSorted = [...data].sort((a, b) => {
    const vB = (isBalita ? b.diare_balita : b.diare_semua_umur) as number || 0
    const vA = (isBalita ? a.diare_balita : a.diare_semua_umur) as number || 0
    return vB - vA
  })
  const diareChartData = (diareFilter === 'all' ? diareSorted : diareSorted.slice(0, Number(diareFilter))).map(d => ({
    kabupaten: d.kabupaten.replace('Kota ', ''),
    dilayani: (isBalita ? d.diare_balita : d.diare_semua_umur) || 0,
    oralit: (isBalita ? d.diare_balita_oralit : d.diare_semua_umur_oralit) || 0,
    zinc: isBalita ? (d.diare_balita_zinc || 0) : undefined,
  }))

  const chartInsights = maxKab && minKab ? [
    `${maxKab.kabupaten} tertinggi pada ${indicLabel}: ${(maxKab[indic] as number).toLocaleString('id-ID')}.`,
  ] : []

  const scatterInsights = [
    `Korelasi ${OPTIONS.find(o => o.key === corrX)?.label?.split(' —')[0]} vs ${OPTIONS.find(o => o.key === corrY)?.label?.split(' —')[0]}: r = ${r.toFixed(3)}.`,
  ]

  const statInsights = [
    `Total kasus TBC Jawa Timur: ${totTBC.toLocaleString('id-ID')}.`,
    `ODHIV baru ditemukan: ${totODHIV.toLocaleString('id-ID')}.`,
    `Total diare semua umur: ${totDiare.toLocaleString('id-ID')} | Total kusta (PB+MB): ${totKusta.toLocaleString('id-ID')}.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Kasus TBC" value={totTBC.toLocaleString('id-ID')} sub="Semua Tipe" icon="🫁" color="#ef4444" />
        <KPICard title="Sukses Pengobatan TBC" value="88.26%" sub="Rata-rata" icon="✅" color="#0FB0AA" />
        <KPICard title="Hepatitis Bumil Reaktif" value="1.6%" sub="7.186 orang" icon="🩸" color="#eab308" />
        <KPICard title="ODHIV Mendapat ARV" value="75%" sub="7.969 orang" icon="💊" color="#a855f7" />
        
        <KPICard title="ODHIV Baru" value={totODHIV.toLocaleString('id-ID')} sub="Ditemukan" icon="🔴" color="#8b5cf6" />
        <KPICard title="Kasus Baru Kusta" value="2.225 Kasus" sub="Prevalensi 0.6 per 10.000 penduduk" icon="🦠" color="#14b8a6" />
        <KPICard title="Kasus Diare" value={totDiare.toLocaleString('id-ID')} sub="Semua Umur" icon="💧" color="#06B5D0" />
        <KPICard title="Pneumonia Balita" value="96.492" sub="Orang Ditemukan" icon="👶" color="#f97316" />
      </div>

      {/* TBC */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Angka Kesembuhan dan Keberhasilan Pengobatan Tuberkolosis</h3>
          <select value={tbcFilter} onChange={e => setTbcFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ width: tbcFilter === 'all' ? 1800 : (tbcFilter === '20' ? 1000 : '100%'), height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tbcChartData} margin={{ bottom: 40 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} interval={0} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip content={<TBCTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="kasus" name="Jumlah Kasus" fill="#06B5D0" radius={[3, 3, 0, 0]} minPointSize={3} />
                <Bar yAxisId="right" dataKey="sukses_pct" name="Sukses Pengobatan (%)" fill="#CBD92C" radius={[3, 3, 0, 0]} minPointSize={3} />
                <Bar yAxisId="right" dataKey="pengobatan_lengkap" name="Pengobatan Lengkap (%)" fill="#0FB0AA" radius={[3, 3, 0, 0]} minPointSize={3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Indikator Penyakit Menular Langsung */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Penyakit Menular Langsung</h3>
          <div className="flex items-center gap-3">
            <select value={indic} onChange={e => setIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
            <select value={indicFilter} onChange={e => setIndicFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Semua</option>
            </select>
          </div>
        </div>
        
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ minWidth: indicFilter === 'all' ? 800 : '100%', height: indicFilter === 'all' ? 800 : (indicFilter === '20' ? 600 : 400) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 110, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 10 }} width={100} interval={0} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey={indic} name={indicLabel} fill="#0FB0AA" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {chartInsights.length > 0 && <InsightBox insights={chartInsights} />}

      {/* ODHIV */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>ODHIV Mendapatkan Pengobatan</h3>
          <select value={odhivFilter} onChange={e => setOdhivFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Keseluruhan</option>
          </select>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ width: odhivFilter === 'all' ? 1800 : (odhivFilter === '20' ? 1000 : '100%'), height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={odhivChartData} margin={{ bottom: 40 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} interval={0} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip content={<ODHIVTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="baru" name="ODHIV Baru Ditemukan" fill="#06B5D0" radius={[3, 3, 0, 0]} minPointSize={3} />
                <Bar yAxisId="left" dataKey="arv" name="Mendapat Pengobatan ARV" fill="#CBD92C" radius={[3, 3, 0, 0]} minPointSize={3} />
                <Bar yAxisId="right" dataKey="arv_pct" name="Persentase ARV (%)" fill="#0FB0AA" radius={[3, 3, 0, 0]} minPointSize={3} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Kasus Diare */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kasus Diare</h3>
          <div className="flex items-center gap-3">
            <select value={diareAge} onChange={e => setDiareAge(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="balita">Balita</option>
              <option value="semua_umur">Semua Umur</option>
            </select>
            <select value={diareFilter} onChange={e => setDiareFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Keseluruhan</option>
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto pb-4">
          <div style={{ width: diareFilter === 'all' ? 1800 : (diareFilter === '20' ? 1000 : '100%'), height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diareChartData} margin={{ bottom: 40 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<DiareTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="dilayani" name="Dilayani" fill="#06B5D0" radius={[3, 3, 0, 0]} minPointSize={3} />
                <Bar dataKey="oralit" name="Mendapat Oralit" fill="#0FB0AA" radius={[3, 3, 0, 0]} minPointSize={3} />
                {isBalita && <Bar dataKey="zinc" name="Mendapat Zinc" fill="#CBD92C" radius={[3, 3, 0, 0]} minPointSize={3} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Korelasi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analisis Korelasi</h3>
          <select value={corrX} onChange={e => setCorrX(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <span className="text-xs text-gray-400">vs</span>
          <select value={corrY} onChange={e => setCorrY(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
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
              return <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs"><div className="font-semibold mb-1">{p.name}</div><div>X: {p.x?.toLocaleString('id-ID')}</div><div>Y: {p.y?.toLocaleString('id-ID')}</div></div>
            }} />
            <Scatter data={scatterData} fill="#0FB0AA" fillOpacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={scatterInsights} />

      <StatPanel
        stats={stats}
        label={indicLabel}
        rightElement={
          <select value={indic} onChange={e => setIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            {OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'tbc_kasus', label: 'TBC Kasus' },
        { key: 'tbc_sukses_pct', label: 'TBC Sukses (%)' },
        { key: 'pneumonia_balita', label: 'Pneumonia Balita' },
        { key: 'odhiv_baru', label: 'ODHIV Baru' },
        { key: 'arv_pct', label: 'Mendapat ARV (%)' },
        { key: 'diare_semua_umur', label: 'Diare Semua' },
        { key: 'diare_balita', label: 'Diare Balita' },
        { key: 'kusta_pb', label: 'Kusta PB' },
        { key: 'kusta_mb', label: 'Kusta MB' },
      ]} />
      
      <CrosstabSection data={data} options={OPTIONS} />
    </div>
  )
}
