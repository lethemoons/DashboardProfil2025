import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import RiskClusteringMap from '../components/RiskClusteringMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ScatterChart, Scatter, ReferenceLine
, LabelList , Cell } from 'recharts'
import { evaluateTarget, TARGETS } from '../utils/targets'
import { TargetRefLabel } from '../components/TargetRefLabel'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import { generateCorrelationInsight, generateDynamicBarInsight } from '../utils/insightGenerator'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'
import { useAuth } from '../contexts/AuthContext'

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
            <span className="font-semibold text-gray-800">{Number(pSukses.value).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
          </div>
        )}

        {pLengkap && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: pLengkap.color }}></div>
              <span className="text-gray-600">Pengobatan Lengkap</span>
            </div>
            <span className="font-semibold text-gray-800">{Number(pLengkap.value).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
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
            <span className="font-semibold text-gray-800">{Number(pPct.value).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
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
  const [mapIndicator, setMapIndicator] = useState('tbc_kasus');
  const { data: penyakitMenular, loading, error } = useDashboardData()
  const { isAdmin } = useAuth()

  const [indic, setIndic] = useState('tbc_kasus')
  const [indicFilter, setIndicFilter] = useState('10')
  const [tbcFilter, setTbcFilter] = useState('10')
  const [odhivFilter, setOdhivFilter] = useState('10')
  const [diareFilter, setDiareFilter] = useState('10')
  const [diareAge, setDiareAge] = useState('balita')
  const [corrX, setCorrX] = useState('tbc_kasus')
  const [corrY, setCorrY] = useState('diare_semua_umur')

  const data = useMemo(() => (penyakitMenular || []).filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [penyakitMenular])

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

  const chartInsights = [
    generateDynamicBarInsight(
      data,
      indic,
      indicLabel,
      "Angka yang tinggi pada penyakit menular mengindikasikan perlunya pelacakan kontak erat secara lebih agresif serta peningkatan kampanye pencegahan di wilayah tersebut."
    )
  ]

  const scatterInsights = [
    generateCorrelationInsight(
      OPTIONS.find(o => o.key === corrX)?.label,
      OPTIONS.find(o => o.key === corrY)?.label,
      r
    )
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
        <KPICard title="Sukses Pengobatan TBC" value="88,26%" sub="Rata-rata" icon="✅" color="#0F8F8B" targetData={evaluateTarget(88.26, 'tbc_tsr_pct')} />
        <KPICard title="Hepatitis Bumil Reaktif" value="1,6%" sub="7.186 orang" icon="🩸" color="#eab308" />
        <KPICard title="ODHIV Mendapat ARV" value="75%" sub="7.969 orang" icon="💊" color="#a855f7" targetData={evaluateTarget(75, 'odhiv_arv_pct')} />
        
        <KPICard title="ODHIV Baru" value={totODHIV.toLocaleString('id-ID')} sub="Ditemukan" icon="🔴" color="#8b5cf6" />
        <KPICard title="Kasus Baru Kusta" value="2.225 Kasus" sub="Prevalensi 0.6 per 10.000 penduduk" icon="🦠" color="#14b8a6" />
        <KPICard title="Kasus Diare" value={totDiare.toLocaleString('id-ID')} sub="Semua Umur" icon="💧" color="#078FA5" />
        <KPICard title="Pneumonia Balita" value="96.492" sub="Orang Ditemukan" icon="👶" color="#f97316" />
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
                <Bar yAxisId="left" dataKey="kasus" name="Jumlah Kasus" radius={[3, 3, 0, 0]} minPointSize={3} >

                {tbcChartData.map((entry: any, index: number) => {
                  const val = entry['kasus'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['kasus'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
                <Bar yAxisId="right" dataKey="sukses_pct" name="Sukses Pengobatan (%)" radius={[3, 3, 0, 0]} minPointSize={3} >

                {tbcChartData.map((entry: any, index: number) => {
                  const val = entry['sukses_pct'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['tbc_tsr_pct'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
                <Bar yAxisId="right" dataKey="pengobatan_lengkap" name="Pengobatan Lengkap (%)" radius={[3, 3, 0, 0]} minPointSize={3} >

                {tbcChartData.map((entry: any, index: number) => {
                  const val = entry['pengobatan_lengkap'] as number;
                  let color = "#0F8F8B";
                  const tgt = null;
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <InsightBox insights={[generateDynamicBarInsight(data, 'tbc_kasus', 'Kasus TBC', 'Upaya penemuan kasus secara aktif (Active Case Finding) serta pendampingan kepatuhan minum obat melalui PMO (Pengawas Menelan Obat) sangat krusial untuk meningkatkan angka kesembuhan dan memutus mata rantai penularan TBC di masyarakat.')]} />

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
              <BarChart data={chartData} layout="vertical" margin={{ left: 110, right: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" domain={[0, (dataMax: number) => {
                  const tgt = TARGETS[indic] || (indic === 'tbc_sukses_pct' ? TARGETS['tbc_tsr_pct'] : indic === 'arv_pct' ? TARGETS['odhiv_arv_pct'] : null);
                  return tgt ? Math.max(dataMax, tgt.target_value * 1.1) : dataMax;
                }]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 10 }} width={100} interval={0} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f9fafb' }} />
                {(TARGETS[indic] || (indic === 'tbc_sukses_pct' ? TARGETS['tbc_tsr_pct'] : indic === 'arv_pct' ? TARGETS['odhiv_arv_pct'] : null)) && (() => {
                  const tgt = TARGETS[indic] || (indic === 'tbc_sukses_pct' ? TARGETS['tbc_tsr_pct'] : indic === 'arv_pct' ? TARGETS['odhiv_arv_pct'] : null);
                  return (
                    <ReferenceLine 
                      x={tgt.target_value} 
                      stroke={tgt.target_direction === '>=' || tgt.target_direction === '>' ? '#0F8F8B' : '#ef4444'}
                      strokeDasharray="3 3"
                      strokeWidth={2}
                      label={<TargetRefLabel value={`${['<=', '<'].includes(tgt.target_direction) ? 'Batas Maks' : 'Target Min'}: ${tgt.target_value}${tgt.isPercentage ? '%' : ''}`} />}
                    />
                  )
                })()}
                <Bar dataKey={indic} name={indicLabel} radius={[0, 4, 4, 0]} >

                {chartData.map((entry: any, index: number) => {
                  const val = entry[indic] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS[indic] || (indic === 'tbc_sukses_pct' ? TARGETS['tbc_tsr_pct'] : indic === 'arv_pct' ? TARGETS['odhiv_arv_pct'] : null);
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
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
                <Bar yAxisId="left" dataKey="baru" name="ODHIV Baru Ditemukan" radius={[3, 3, 0, 0]} minPointSize={3} >

                {odhivChartData.map((entry: any, index: number) => {
                  const val = entry['baru'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['baru'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
                <Bar yAxisId="left" dataKey="arv" name="Mendapat Pengobatan ARV" radius={[3, 3, 0, 0]} minPointSize={3} >

                {odhivChartData.map((entry: any, index: number) => {
                  const val = entry['arv'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['arv'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
                <Bar yAxisId="right" dataKey="arv_pct" name="Persentase ARV (%)" radius={[3, 3, 0, 0]} minPointSize={3} >

                {odhivChartData.map((entry: any, index: number) => {
                  const val = entry['arv_pct'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['arv_pct'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <InsightBox insights={[generateDynamicBarInsight(data, 'odhiv_baru', 'ODHIV Baru Ditemukan', 'Tingginya angka penemuan kasus baru ODHIV menunjukkan keberhasilan program skrining aktif. Tantangan selanjutnya adalah memastikan seluruh individu yang terdiagnosis segera mendapatkan terapi ARV agar kualitas hidup mereka tetap terjaga dan potensi penularan dapat ditekan.')]} />

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
                <Bar dataKey="dilayani" name="Dilayani" radius={[3, 3, 0, 0]} minPointSize={3} >

                {diareChartData.map((entry: any, index: number) => {
                  const val = entry['dilayani'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['dilayani'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
                <Bar dataKey="oralit" name="Mendapat Oralit" radius={[3, 3, 0, 0]} minPointSize={3} >

                {diareChartData.map((entry: any, index: number) => {
                  const val = entry['oralit'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['oralit'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>
                {isBalita && <Bar dataKey="zinc" name="Mendapat Zinc" radius={[3, 3, 0, 0]} minPointSize={3} >

                {diareChartData.map((entry: any, index: number) => {
                  const val = entry['zinc'] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS['zinc'];
                  if (tgt && typeof val === 'number') {
                    if (tgt.target_direction === '>=' && val < tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<=' && val > tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '>' && val <= tgt.target_value) color = "#9EAF24";
                    else if (tgt.target_direction === '<' && val >= tgt.target_value) color = "#9EAF24";
                      else if (tgt.target_direction === '=' && val !== tgt.target_value) color = "#9EAF24";
                  }
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}

                
              </Bar>}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <InsightBox insights={[generateDynamicBarInsight(data, diareAge === 'balita' ? 'diare_balita' : 'diare_semua_umur', 'Kasus Diare', 'Sanitasi lingkungan yang buruk dan kurangnya akses terhadap air bersih seringkali berbanding lurus dengan tingginya kasus diare, khususnya pada kelompok rentan seperti balita.')]} />

      {/* Korelasi */}
      {isAdmin && (
        <>
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
              <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0F8F8B' }}>r = {r.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</span>
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
                <Scatter data={scatterData} fill="#0F8F8B" fillOpacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <InsightBox insights={scatterInsights} />
        </>
      )}

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

      
      {isAdmin && (
        <RiskClusteringMap 
          title="Analisis Klasterisasi Pemetaan Risiko Penyakit Menular Langsung"
          data={data} 
          variables={['tbc_kasus', 'tbc_sukses_pct', 'arv_pct', 'diare_semua_umur', 'kusta_mb']} 
          directions={[1, -1, -1, 1, 1]} 
          variableLabels={['TBC Kasus', 'TBC Sukses (%)', 'Mendapat ARV (%)', 'Diare', 'Kusta MB']} 
        />
      )}

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
      
      {isAdmin && <CrosstabSection data={data} variables={OPTIONS} defaultRowVar="tbc_kasus" defaultColVar="tbc_sukses_pct" title="Analisis Crosstab Penyakit Menular" />}
    </div>
  )
}
