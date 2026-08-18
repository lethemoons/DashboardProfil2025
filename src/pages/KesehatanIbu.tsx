import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import RiskClusteringMap from '../components/RiskClusteringMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, ScatterChart, Scatter, ReferenceLine
  , LabelList
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { evaluateTarget, TARGETS } from '../utils/targets'
import { TargetRefLabel } from '../components/TargetRefLabel'
import { descStats, pearsonR } from '../utils/stats'
import { generateCorrelationInsight, generateDynamicBarInsight } from '../utils/insightGenerator'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'
import { useAuth } from '../contexts/AuthContext'


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
          <span className="font-semibold">{value?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
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

const CustomPairTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length >= 2) {
    const p1 = payload[0];
    const p2 = payload[1];

    const isPct = p1.name.includes('%') || p1.dataKey.includes('pct');
    const diff = Math.abs(p1.value - p2.value);

    const getCount = (key: string, data: any) => {
      if (key === 'kf_lengkap_pct') return data.jumlah_kf_lengkap || 0;
      if (key === 'nifas_vit_a_pct') return data.jumlah_nifas_vit_a || 0;
      if (key === 'k6_pct') return data.k6_jumlah || 0;
      if (key === 'fe_tablet_pct') return data.fe_tablet_jumlah || 0;
      return null;
    }

    const c1 = isPct ? getCount(p1.dataKey, p1.payload) : p1.value;
    const c2 = isPct ? getCount(p2.dataKey, p2.payload) : p2.value;

    let pct1 = '';
    let pct2 = '';
    let selisihDiffStr = '';
    let score = 0;

    if (isPct) {
      pct1 = p1.value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      pct2 = p2.value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      selisihDiffStr = diff.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      score = diff <= 10 ? 1 : 0;
    } else {
      const base = Math.max(p1.value, p2.value) || 1;
      const p1Pct = (p1.value / base) * 100;
      const p2Pct = (p2.value / base) * 100;
      pct1 = p1Pct.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      pct2 = p2Pct.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      
      const diffPct = (diff / base) * 100;
      selisihDiffStr = `${Math.round(diff).toLocaleString('id-ID')} (${diffPct.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%)`;
      score = diffPct <= 10 ? 1 : 0;
    }

    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2">{label}</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p1.fill }}></div>
              <span className="text-gray-600">{p1.name}:</span>
            </div>
            <span className="font-semibold">{pct1}{c1 !== null ? ` (${Number(c1).toLocaleString('id-ID')})` : ''}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p2.fill }}></div>
              <span className="text-gray-600">{p2.name}:</span>
            </div>
            <span className="font-semibold">{pct2}{c2 !== null ? ` (${Number(c2).toLocaleString('id-ID')})` : ''}</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Selisih (absolut):</span>
            <span className="font-bold">{selisihDiffStr}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Skor:</span>
            <span className={`font-bold ${score === 1 ? 'text-[#0F8F8B]' : 'text-red-500'}`}>{score}</span>
          </div>
        </div>
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
  const { isAdmin } = useAuth()

  const [mapIndicator, setMapIndicator] = useState('k1_pct')
  const [indic, setIndic] = useState('k1_pct')
  const [chartFilter, setChartFilter] = useState('10')
  const [deathChartFilter, setDeathChartFilter] = useState('10')
  const [compareFilter, setCompareFilter] = useState('10')
  const [corrX, setCorrX] = useState('k1_pct')
  const [corrY, setCorrY] = useState('persalinan_fasyankes_pct')

  const data = useMemo(() => {
    return kesehatanIbu.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR').map(d => {
      const ttd = d['28_suplementasi_gizi_ibu_hamil_yang_mengonsumsi_ttd_minimal_180_tablet'] || 0;
      const mms = d['28_suplementasi_gizi_ibu_hamil_yang_mengonsumsi_mms_minimal_180_tablet'] || 0;
      const fe_tablet_jumlah = Number(ttd) + Number(mms);
      return {
        ...d,
        fe_tablet_jumlah,
        k6_jumlah: d['26_k6_jumlah'] || 0,
        kf1_pct: d.kf1_pct || 0,
        jumlah_kf1: d.jumlah_kf1 || 0,
        kf_lengkap_pct: d.kf_lengkap_pct || 0,
        jumlah_kf_lengkap: d.jumlah_kf_lengkap || 0,
        nifas_vit_a_pct: d.nifas_vit_a_pct || 0,
        jumlah_nifas_vit_a: d.jumlah_nifas_vit_a || 0,
        anak_lahir_hidup: d.anak_lahir_hidup || 0,
        ibu_bersalin: d.jumlah_ibu_bersalin_nifas || 0,
      };
    })
  }, [kesehatanIbu])

  const totKematianIbu = data.reduce((s, d) =>
    s + (d.kematian_ibu_hamil as number) + (d.kematian_ibu_bersalin as number) + (d.kematian_ibu_nifas as number), 0)
  const avgK1 = data.length ? data.reduce((s, d) => s + (d.k1_pct as number), 0) / data.length : 0
  const avgK6 = data.length ? data.reduce((s, d) => s + (d.k6_pct as number), 0) / data.length : 0
  const avgFasyankes = data.length ? data.reduce((s, d) => s + (d.persalinan_fasyankes_pct as number), 0) / data.length : 0
  const avgKB = data.length ? data.reduce((s, d) => s + (d.kb_aktif_pct as number), 0) / data.length : 0


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


  const scatterInsights = [
    generateCorrelationInsight(
      IBU_OPTIONS.find(o => o.key === corrX)?.label,
      IBU_OPTIONS.find(o => o.key === corrY)?.label,
      r
    )
  ]

  const statInsights = [
    `Berdasarkan data yang terkumpul, total kematian ibu hamil, bersalin, dan nifas berjumlah ${totKematianIbu} kasus.`,
    `Cakupan pelayanan kehamilan awal (K1) rata-rata mencapai ${avgK1.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%, sementara kunjungan lengkap (K6) berada di angka ${avgK6.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%. Hal ini menunjukkan bahwa sebagian besar ibu hamil telah memiliki kesadaran untuk memeriksakan kehamilannya.`,
    `Tingkat persalinan di fasilitas pelayanan kesehatan rata-rata berada pada ${avgFasyankes.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%, menandakan bahwa peran fasilitas kesehatan semakin diutamakan sebagai tempat persalinan yang aman.`,
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">


      {/* Kematian ibu cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Kematian Ibu" value={totKematianIbu} sub="Hamil + Bersalin + Nifas" icon="❤️" color="#ef4444" />
        <KPICard title="Persentase K1" value={avgK1.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} sub="Cakupan Kunjungan Pertama" icon="🤰" color="#0F8F8B" />
        <KPICard title="Persentase K6" value={avgK6.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} sub="Kunjungan Lengkap" icon="📋" color="#078FA5" targetData={evaluateTarget(avgK6, 'k6_pct')} />
        <KPICard title="Persentase Persalinan di Fasyankes" value={avgFasyankes.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} sub="Rata-rata" icon="🏥" color="#9EAF24" targetData={evaluateTarget(avgFasyankes, 'pf_pct')} />
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
              {IBU_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <ChoroplethMap
          data={data}
          indicatorKey={mapIndicator}
          indicatorLabel={IBU_OPTIONS.find(o => o.key === mapIndicator)?.label || ''}
        />
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
          }))} layout="vertical" margin={{ left: 80, right: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={80} interval={0} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="bersalin" name="Saat Bersalin" stackId="a" fill="#078FA5" ><LabelList dataKey="bersalin" position="center" style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700, paintOrder: 'stroke' }} stroke="#078FA5" strokeWidth={2} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
            <Bar dataKey="hamil" name="Saat Hamil" stackId="a" fill="#9EAF24" ><LabelList dataKey="hamil" position="center" style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700, paintOrder: 'stroke' }} stroke="#9EAF24" strokeWidth={2} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
            <Bar dataKey="nifas" name="Saat Nifas" stackId="a" fill="#0F8F8B" radius={[0, 4, 4, 0]} ><LabelList dataKey="nifas" position="center" style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700, paintOrder: 'stroke' }} stroke="#0F8F8B" strokeWidth={2} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
          </BarChart>
        </ResponsiveContainer>
        <InsightBox insights={[`Grafik di atas menunjukkan sebaran kasus kematian ibu di setiap wilayah. Hal ini menjadi peringatan akan pentingnya pemantauan kondisi ibu secara terus-menerus mulai dari masa kehamilan, saat proses melahirkan, hingga masa nifas.`]} />
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
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 80 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, (dataMax: number) => {
              const tgt = TARGETS[indic] || (indic === 'persalinan_fasyankes_pct' ? TARGETS['pf_pct'] : null);
              return tgt ? Math.max(dataMax, tgt.target_value * 1.1) : 100;
            }]} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} interval={0} />
            <Tooltip content={<CustomTooltip />} />
            {(TARGETS[indic] || (indic === 'persalinan_fasyankes_pct' ? TARGETS['pf_pct'] : null)) && (() => {
              const tgt = TARGETS[indic] || (indic === 'persalinan_fasyankes_pct' ? TARGETS['pf_pct'] : null);
              const maxVal = Number((chartData[0] as any)?.[indic]) || 0;
              return (
                <ReferenceLine 
                  x={tgt.target_value} 
                  stroke={tgt.target_direction === '>=' || tgt.target_direction === '>' ? '#0F8F8B' : '#ef4444'}
                  strokeDasharray="3 3"
                  strokeWidth={2}
                  label={<TargetRefLabel
                    value={`${['<=', '<'].includes(tgt.target_direction) ? 'Batas Maks' : 'Target Min'}: ${tgt.target_value}${tgt.isPercentage ? '%' : ''}`}
                    side={maxVal > tgt.target_value ? 'left' : 'right'}
                  />}
                />
              );
            })()}
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]} fill="#0F8F8B" ><LabelList dataKey={indic} position="right" style={{ fontSize: 10, fill: '#374151', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : (String(indic).includes('_pct') || (typeof indicLabel === 'string' && indicLabel.includes('(%)')) ? `${Number(v).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : Math.round(Number(v)).toLocaleString('id-ID'))} /></Bar>
          </BarChart>
        </ResponsiveContainer>
        <InsightBox insights={[generateDynamicBarInsight(chartData, indic, indicLabel, "Pencapaian layanan ibu hamil dan bersalin bervariasi di setiap kabupaten/kota.")]} />
      </div>

      {/* Korelasi */}
      {isAdmin && (
        <>
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
                  return <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs"><div className="font-semibold mb-1">{p.name}</div><div>X: {p.x?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</div><div>Y: {p.y?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</div></div>
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
        format={v => v.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'}
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
                  <Tooltip content={<CustomPairTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="fe_tablet_pct" name="Tablet Fe (%)" fill="#0F8F8B" radius={[3, 3, 0, 0]} ><LabelList dataKey="fe_tablet_pct" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} /></Bar>
                  <Bar dataKey="k6_pct" name="Kunjungan K6 (%)" fill="#9EAF24" radius={[3, 3, 0, 0]} ><LabelList dataKey="k6_pct" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <InsightBox insights={[`Grafik ini menyoroti perbandingan ibu hamil yang menerima suplemen zat besi (Fe) dengan mereka yang melengkapi minimal kunjungan K6. Semakin dekat jarak antara kedua garis (selisih di bawah 10%), semakin terintegrasi layanan kehamilan di daerah tersebut.\n\n* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1.`]} />
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
                  <Tooltip content={<CustomPairTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="ibu_bersalin" name="Ibu Bersalin" fill="#0F8F8B" radius={[3, 3, 0, 0]} ><LabelList dataKey="ibu_bersalin" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
                  <Bar dataKey="anak_lahir_hidup" name="Anak Lahir Hidup" fill="#9EAF24" radius={[3, 3, 0, 0]} ><LabelList dataKey="anak_lahir_hidup" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <InsightBox insights={[`Secara logika, jumlah ibu yang melahirkan idealnya sangat mendekati atau sama dengan jumlah bayi yang lahir dalam kondisi hidup (kecuali jika ada bayi kembar). Jika selisih terlalu jauh, hal itu mengindikasikan kemungkinan masalah pencatatan atau pelaporan yang tidak akurat.\n\n* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1.`]} />
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
                  <Tooltip content={<CustomPairTooltip />} />
                  <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="nifas_vit_a_pct" name="Vitamin A Nifas (%)" fill="#0F8F8B" radius={[3, 3, 0, 0]} ><LabelList dataKey="nifas_vit_a_pct" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} /></Bar>
                  <Bar dataKey="kf_lengkap_pct" name="KF Lengkap (%)" fill="#9EAF24" radius={[3, 3, 0, 0]} ><LabelList dataKey="kf_lengkap_pct" position="insideTop" style={{ fontSize: 9, fill: 'white', fontWeight: 600 }} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <InsightBox insights={[`Pemeriksaan lengkap paska melahirkan (KF) sepatutnya dibarengi dengan pemberian Vitamin A untuk kesehatan dan kekebalan tubuh sang ibu. Keselarasan kedua data ini mencerminkan apakah standar penanganan pasien benar-benar berjalan satu paket.\n\n* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1.`]} />
        </div>

        {/* Interpretasi Skor Total */}
        <div className="mt-8 bg-teal-50 border border-teal-100 rounded-xl p-5 shadow-sm">
          <h4 className="font-semibold text-teal-800 mb-2">Interpretasi Total Skor Keselarasan</h4>
          <p className="text-teal-700 text-sm leading-relaxed">
            Secara keseluruhan, akumulasi skor dari berbagai pasangan indikator (dengan nilai maksimal 10) berfungsi sebagai tolok ukur kualitas dan konsistensi data. <strong>Semakin tinggi skor total (mendekati 10)</strong>, semakin selaras, akurat, dan terintegrasi pencatatan pelaporan program kesehatan di wilayah tersebut. Sebaliknya, skor yang rendah menunjukkan adanya kesenjangan (gap) data yang perlu dievaluasi kembali, baik dari sisi pelaksanaan layanan di lapangan maupun sistem pelaporannya.
          </p>
        </div>
      </div>


      {isAdmin && (
        <CrosstabSection
          data={data}
          variables={IBU_OPTIONS}
          defaultRowVar="k1_pct"
          defaultColVar="persalinan_fasyankes_pct"
        />
      )}


      {isAdmin && (
        <RiskClusteringMap
          title="Analisis Klasterisasi Pemetaan Risiko Kesehatan Ibu"
          data={data}
          variables={['kematian_ibu_hamil', 'k6_pct', 'persalinan_fasyankes_pct', 'kf_lengkap_pct']}
          directions={[1, -1, -1, -1]}
          variableLabels={['Kematian Ibu Hamil', 'K6 (%)', 'Persalinan Fasyankes (%)', 'KF Lengkap (%)']}
        />
      )}

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'k1_pct', label: 'K1 (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'k6_pct', label: 'K6 (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'persalinan_fasyankes_pct', label: 'Persalinan Fasyankes (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },

        { key: 'kb_aktif_pct', label: 'KB Aktif (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'kematian_ibu_hamil', label: 'Mati Hamil' },
        { key: 'kematian_ibu_bersalin', label: 'Mati Bersalin' },
        { key: 'kematian_ibu_nifas', label: 'Mati Nifas' },
      ]} />
    </div>
  )
}
