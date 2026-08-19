import { useState, useMemo } from 'react'
import ChoroplethMap from '../components/ChoroplethMap';
import RiskClusteringMap from '../components/RiskClusteringMap';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend, ScatterChart, Scatter, ReferenceLine
  , LabelList
} from 'recharts'
import { evaluateTarget, TARGETS } from '../utils/targets'
import { TargetRefLabel } from '../components/TargetRefLabel'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import { generateCorrelationInsight, generateDynamicBarInsight } from '../utils/insightGenerator'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'
import { useAuth } from '../contexts/AuthContext'
import { ANAK_CSV_DATA } from '../data/anakCsvData'

const ANAK_OPTIONS = [
  { key: 'gizi_kurang_pct', label: 'Gizi Kurang (%)' },
  { key: 'gizi_buruk_pct', label: 'Gizi Buruk (%)' },
  { key: 'bblr_pct', label: 'BBLR — Bayi Berat Lahir Rendah (%)' },
  { key: 'imunisasi_dasar_lengkap_pct', label: 'Imunisasi Dasar Lengkap (%)' },
  { key: 'imunisasi_campak_pct', label: 'Imunisasi Campak/Rubela (%)' },
  { key: 'imunisasi_dpt_pct', label: 'Imunisasi DPT-HB-Hib (%)' },
  { key: 'asi_eksklusif_pct', label: 'ASI Eksklusif 0–6 Bulan (%)' },
  { key: 'vitamin_a_pct', label: 'Vitamin A Balita (%)' },
  { key: 'kn1_pct', label: 'Kunjungan Neonatus KN1 (%)' },
  { key: 'kn_lengkap_pct', label: 'KN Lengkap (%)' },
]

const COMPARE_OPTIONS = [
  { key: 'pair_1', label: 'Anak Lahir Hidup vs Pemberian HB0' },
  { key: 'pair_2', label: 'Pemberian HB0 vs Pemberian BCG' },
  { key: 'pair_3', label: 'Campak/Rubella vs Imunisasi Dasar Lengkap' },
  { key: 'pair_4', label: 'Anak Lahir Hidup vs Pemberian BCG' },
  { key: 'pair_5', label: 'DPT-HB-Hib3 vs Imunisasi Dasar Lengkap' },
  { key: 'pair_6', label: 'Polio 4 vs Imunisasi Dasar Lengkap' },
  { key: 'pair_7', label: 'DPT-HB-Hib3 vs Polio 4' },
]

const CustomCompareTooltip = ({ active, payload, label, data }: any) => {
  if (active && payload && payload.length) {
    const p1 = payload[0];
    const p2 = payload[1];

    // Absolute difference between percentages
    const diff = Math.abs(p1.value - p2.value);
    const score = diff <= 10 ? 1 : 0;

    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs">
        <div className="font-semibold mb-2">{label}</div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p1.fill }}></div>
              <span className="text-gray-600">{p1.name}:</span>
            </div>
            <span className="font-semibold">{p1.value?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% ({Number(p1.payload[`${p1.dataKey}_val`] || 0).toLocaleString('id-ID')})</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: p2.fill }}></div>
              <span className="text-gray-600">{p2.name}:</span>
            </div>
            <span className="font-semibold">{p2.value?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% ({Number(p2.payload[`${p2.dataKey}_val`] || 0).toLocaleString('id-ID')})</span>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-100 flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Selisih (absolut):</span>
            <span className="font-bold">{diff.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
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

export default function KesehatanAnak() {
  const { data: kesehatanAnak, loading, error } = useDashboardData()
  const { isAdmin } = useAuth()

  const [mapIndicator, setMapIndicator] = useState('gizi_kurang_pct');
  const [indic, setIndic] = useState('gizi_kurang_pct')
  const [chartFilter, setChartFilter] = useState('10')
  const [deathChartFilter, setDeathChartFilter] = useState('10')
  const [compareFilter, setCompareFilter] = useState('10')
  const [compareIndic, setCompareIndic] = useState('pair_1')

  const [corrX, setCorrX] = useState('gizi_kurang_pct')
  const [corrY, setCorrY] = useState('gizi_buruk_pct')

  const data = useMemo(() => {
    return kesehatanAnak.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR').map(d => {
      const csv = ANAK_CSV_DATA[d.kabupaten] || {};

      const anak_lahir_hidup = csv.anak_lahir_hidup || 0;
      const hb0_val = csv.jumlah_hb0 || 0;
      const hb0_pct = csv.hb0_pct || 0;
      const bcg_val = csv.jumlah_bcg || 0;
      const bcg_pct = csv.bcg_pct || 0;
      const campak_val = csv.jumlah_campak_rubela || 0;
      const campak_pct = csv.campak_rubela_pct || 0;
      const idl_val = csv.jumlah_imunisasi_dasar_lengkap || 0;
      const idl_pct = csv.imunisasi_dasar_lengkap_pct || 0;
      const dpt_val = csv.jumlah_dpt_hb_hib3 || 0;
      const dpt_pct = csv.dpt_hb_hib3_pct || 0;
      const polio_val = csv.jumlah_polio4 || 0;
      const polio_pct = csv.polio4_pct || 0;

      return {
        ...d,
        kematian_neonatal: d.kematian_neonatal || 0,
        kematian_bayi: d.kematian_bayi || 0,
        kematian_balita: d.kematian_balita || 0,

        pair_1_a: 100, pair_1_a_val: anak_lahir_hidup,
        pair_1_b: hb0_pct, pair_1_b_val: hb0_val,

        pair_2_a: hb0_pct, pair_2_a_val: hb0_val,
        pair_2_b: bcg_pct, pair_2_b_val: bcg_val,

        pair_3_a: campak_pct, pair_3_a_val: campak_val,
        pair_3_b: idl_pct, pair_3_b_val: idl_val,

        pair_4_a: 100, pair_4_a_val: anak_lahir_hidup,
        pair_4_b: bcg_pct, pair_4_b_val: bcg_val,

        pair_5_a: dpt_pct, pair_5_a_val: dpt_val,
        pair_5_b: idl_pct, pair_5_b_val: idl_val,

        pair_6_a: polio_pct, pair_6_a_val: polio_val,
        pair_6_b: idl_pct, pair_6_b_val: idl_val,

        pair_7_a: dpt_pct, pair_7_a_val: dpt_val,
        pair_7_b: polio_pct, pair_7_b_val: polio_val,
      }
    })
  }, [kesehatanAnak])

  const sortedData = [...data].sort((a, b) => (b[indic] as number) - (a[indic] as number))
  const chartData = chartFilter === 'all' ? sortedData : sortedData.slice(0, Number(chartFilter))

  const sortedDeathData = [...data].sort((a, b) =>
    ((b.kematian_neonatal as number) + (b.kematian_bayi as number) + (b.kematian_balita as number)) -
    ((a.kematian_neonatal as number) + (a.kematian_bayi as number) + (a.kematian_balita as number))
  )
  const deathChartData = deathChartFilter === 'all' ? sortedDeathData : sortedDeathData.slice(0, Number(deathChartFilter))

  const sortedCompareData = [...data].sort((a, b) => (b[`${compareIndic}_a`] as number) - (a[`${compareIndic}_a`] as number))
  const compareData = compareFilter === 'all' ? sortedCompareData : sortedCompareData.slice(0, Number(compareFilter))

  const stats = descStats(data.map(d => d[indic] as number))
  const indicLabel = ANAK_OPTIONS.find(o => o.key === indic)?.label ?? indic

  const scatterData = data.map(d => ({ x: d[corrX] as number, y: d[corrY] as number, name: d.kabupaten }))
  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))

  const statInsights = [
    `Angka kematian balita, bayi, dan neonatal sangat penting untuk dipantau secara ketat. Grafik di bawah menunjukkan distribusi jumlah kematian pada usia-usia rentan tersebut untuk setiap wilayah. Mengidentifikasi wilayah dengan angka yang menonjol membantu dinas kesehatan memprioritaskan alokasi tenaga medis, perbaikan fasilitas persalinan, serta kampanye kesehatan ibu hamil secara lebih efisien.`
  ]

  const indicatorInsights = [
    generateDynamicBarInsight(
      data,
      indic,
      indicLabel,
      "Angka cakupan yang belum merata menunjukkan tantangan dalam pemerataan akses pelayanan dasar. Untuk kabupaten/kota dengan pencapaian yang masih rendah, intervensi lintas sektor sangat dibutuhkan agar status gizi maupun perlindungan anak (melalui imunisasi dan pemeriksaan dini) dapat lebih dioptimalkan."
    )
  ]

  const scatterInsights = [
    generateCorrelationInsight(
      ANAK_OPTIONS.find(o => o.key === corrX)?.label,
      ANAK_OPTIONS.find(o => o.key === corrY)?.label,
      r
    )
  ]

  const compareLabel = COMPARE_OPTIONS.find(o => o.key === compareIndic)?.label ?? 'Indikator';
  const compareInsights = [
    `Grafik perbandingan ini menyandingkan ${compareLabel}. Selisih persentase yang jauh antara keduanya (lebih dari 10%) mengindikasikan adanya kendala di lapangan (misalnya anak yang sudah menerima layanan A gagal mendapatkan layanan B). Semakin kecil selisih antar indikator ini, semakin konsisten masyarakat dalam mengikuti pedoman kesehatan anak secara tuntas.\n\n* Apabila selisih perbedaannya absolut berada pada rentang -10% hingga 10%, wilayah tersebut diberi skor 1. Sebaliknya, wilayah diberi skor 0. Akumulasi skor yang tinggi (mendekati nilai maksimal 10 untuk keseluruhan indikator) mencerminkan kualitas pelaporan data yang semakin akurat dan integrasi layanan kesehatan yang optimal.`
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        <KPICard title="Kematian Neonatal" value="3.159" sub="Kasus" icon="💔" color="#ef4444" />
        <KPICard title="Kematian Bayi" value="3.695" sub="Kasus" icon="👶" color="#f97316" />
        <KPICard title="Balita Gizi Kurang" value="4,7%" icon="📏" color="#0F8F8B" />
        <KPICard title="Balita Gizi Buruk" value="0,6%" icon="⚠️" color="#f97316" targetData={evaluateTarget(0.6, 'wasting_pct')} />
        <KPICard title="Inisiasi Menyusu Dini (IMD)" value="76,5%" icon="🤱" color="#0F8F8B" targetData={evaluateTarget(76.5, 'imd_pct')} />
        <KPICard title="ASI Eksklusif 6 Bulan" value="82%" icon="🍼" color="#0F8F8B" targetData={evaluateTarget(82, 'asi_eksklusif_pct')} />
        <KPICard title="Imunisasi Bayi Lengkap" value="84,8%" icon="💉" color="#0F8F8B" targetData={evaluateTarget(84.8, 'idl_pct')} />
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
              {ANAK_OPTIONS.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <ChoroplethMap
          data={data}
          indicatorKey={mapIndicator}
          indicatorLabel={ANAK_OPTIONS.find(o => o.key === mapIndicator)?.label || ''}
        />
      </div>

      <InsightBox title="PENDAHULUAN" insights={statInsights} />

      {/* Kematian anak stacked */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Kematian Neonatal, Bayi & Balita per Kabupaten/Kota</h3>
          <select value={deathChartFilter} onChange={e => setDeathChartFilter(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={deathChartData.map(d => ({
            kabupaten: d.kabupaten.replace('Kota ', ''),
            neonatal: d.kematian_neonatal,
            bayi: d.kematian_bayi,
            balita: d.kematian_balita,
          }))} margin={{ bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="neonatal" name="Neonatal" stackId="a" fill="#078FA5" ><LabelList dataKey="neonatal" position="center" style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700, paintOrder: 'stroke' }} stroke="#078FA5" strokeWidth={2} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
            <Bar dataKey="bayi" name="Bayi" stackId="a" fill="#9EAF24" ><LabelList dataKey="bayi" position="center" style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700, paintOrder: 'stroke' }} stroke="#9EAF24" strokeWidth={2} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
            <Bar dataKey="balita" name="Balita" stackId="a" fill="#0F8F8B" radius={[4, 4, 0, 0]} ><LabelList dataKey="balita" position="center" style={{ fontSize: 10, fill: '#ffffff', fontWeight: 700, paintOrder: 'stroke' }} stroke="#0F8F8B" strokeWidth={2} formatter={(v: any) => !v && v !== 0 ? '' : Number(v).toLocaleString('id-ID')} /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Indikator Kesehatan Anak</h3>
          <div className="flex gap-2">
            <select value={chartFilter} onChange={e => setChartFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Semua</option>
            </select>
            <select value={indic} onChange={e => setIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 95, right: 80 }}>
            <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, (dataMax: number) => {
              if (indic === 'imunisasi_dasar_lengkap_pct' && TARGETS['idl_pct']) return Math.max(dataMax, TARGETS['idl_pct'].target_value * 1.1);
              return TARGETS[indic] ? Math.max(dataMax, TARGETS[indic].target_value * 1.1) : 100;
            }]} />
            <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={93} />
            <Tooltip formatter={(v: any) => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            {TARGETS[indic] && (
              <ReferenceLine
                x={TARGETS[indic].target_value}
                stroke={TARGETS[indic].target_direction === '>=' || TARGETS[indic].target_direction === '>' ? '#0F8F8B' : '#ef4444'}
                strokeDasharray="3 3"
                strokeWidth={2}
                label={<TargetRefLabel
                  value={`${['<=', '<'].includes(TARGETS[indic].target_direction) ? 'Batas Maks' : 'Target Min'}: ${TARGETS[indic].target_value}${TARGETS[indic].isPercentage ? '%' : ''}`}
                  side={(Number((chartData[0] as any)?.[indic]) || 0) > TARGETS[indic].target_value ? 'left' : 'right'}
                />}
              />
            )}
            {indic === 'imunisasi_dasar_lengkap_pct' && TARGETS['idl_pct'] && (
              <ReferenceLine
                x={TARGETS['idl_pct'].target_value}
                stroke={TARGETS['idl_pct'].target_direction === '>=' || TARGETS['idl_pct'].target_direction === '>' ? '#0F8F8B' : '#ef4444'}
                strokeDasharray="3 3"
                strokeWidth={2}
                label={<TargetRefLabel
                  value={`${['<=', '<'].includes(TARGETS['idl_pct'].target_direction) ? 'Batas Maks' : 'Target Min'}: ${TARGETS['idl_pct'].target_value}${TARGETS['idl_pct'].isPercentage ? '%' : ''}`}
                  side={(Number((chartData[0] as any)?.[indic]) || 0) > TARGETS['idl_pct'].target_value ? 'left' : 'right'}
                />}
              />
            )}
            <Bar dataKey={indic} name={indicLabel} radius={[0, 6, 6, 0]} >

                {chartData.map((entry: any, index: number) => {
                  const val = entry[indic] as number;
                  let color = "#0F8F8B";
                  const tgt = TARGETS[indic];
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
      <InsightBox insights={indicatorInsights} />

      {/* Comparisons */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Perbandingan Cakupan Variabel Anak</h3>
          <div className="flex gap-2">
            <select value={compareFilter} onChange={e => setCompareFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
              <option value="all">Semua</option>
            </select>
            <select value={compareIndic} onChange={e => setCompareIndic(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
              {COMPARE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={compareData} margin={{ bottom: 40, right: 20, left: -10 }} barGap={0}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="kabupaten" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomCompareTooltip />} />
            <Legend verticalAlign="top" height={36} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={`${compareIndic}_a`} name={COMPARE_OPTIONS.find(o => o.key === compareIndic)?.label.split(' vs ')[0]} fill="#078FA5" radius={[4, 4, 0, 0]} />
            <Bar dataKey={`${compareIndic}_b`} name={COMPARE_OPTIONS.find(o => o.key === compareIndic)?.label.split(' vs ')[1]} fill="#9EAF24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <InsightBox insights={compareInsights} />

      {/* Korelasi */}
      {isAdmin && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-4">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Analisis Korelasi</h3>
              <select value={corrX} onChange={e => setCorrX(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <span className="text-xs text-gray-400">vs</span>
              <select value={corrY} onChange={e => setCorrY(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400">
                {ANAK_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
              <span className="ml-auto text-xs font-mono px-3 py-1 rounded-full" style={{ background: '#F0FAF9', color: '#0F8F8B' }}>r = {r.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} — {Math.abs(r) > 0.7 ? 'kuat' : Math.abs(r) > 0.4 ? 'sedang' : 'lemah'}</span>
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
                <Scatter data={scatterData} fill="#078FA5" fillOpacity={0.75} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <InsightBox insights={scatterInsights} />
        </>
      )}

      {isAdmin && (
        <CrosstabSection
          data={data}
          variables={ANAK_OPTIONS}
          defaultRowVar="gizi_kurang_pct"
          defaultColVar="gizi_buruk_pct"
        />
      )}


      {isAdmin && (
        <RiskClusteringMap
          title="Analisis Klasterisasi Pemetaan Risiko Kesehatan Anak"
          data={data}
          variables={['kematian_bayi', 'gizi_buruk_pct', 'imunisasi_dasar_lengkap_pct']}
          directions={[1, 1, -1]}
          variableLabels={['Kematian Bayi', 'Gizi Buruk (%)', 'Imunisasi Dasar Lengkap (%)']}
        />
      )}

      <DataTable data={data} columns={[
        { key: 'kabupaten', label: 'Kabupaten/Kota' },
        { key: 'gizi_kurang_pct', label: 'Gizi Kurang (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'gizi_buruk_pct', label: 'Gizi Buruk (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'bblr_pct', label: 'BBLR (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'imunisasi_dasar_lengkap_pct', label: 'Imunisasi (%)', format: v => v?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) },
        { key: 'kematian_neonatal', label: 'Mati Neonatal' },
        { key: 'kematian_bayi', label: 'Mati Bayi' },
        { key: 'kematian_balita', label: 'Mati Balita' },
      ]} />
    </div>
  )
}
