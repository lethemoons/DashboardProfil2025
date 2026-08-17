import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { useDashboardData, TABLE_METRIC_ALIASES } from '../hooks/useDashboardData'
import { pearsonR } from '../utils/stats'
import { generateCorrelationInsight } from '../utils/insightGenerator'
import CrosstabSection, { VariableOption } from '../components/CrosstabSection'
import InsightBox from '../components/InsightBox'

const IGNORED_KEYS = new Set([
  'id', 'no', 'tableNo', 'kabupaten', 'name', 'createdAt', 'updatedAt', 'tahun', 'metric', 'value', 'table_no'
])

const EXTRA_ALLOWED_KEYS = [
  'kepadatan_penduduk_per_km2_desa_', 'jumlah_penduduk_desa_', 'jumlah_desa_', 'jumlah_rumah_tangga_desa_', 'luas_wilayah_km2',
  'jumlah_posyandu_siklus_hidup_aktif', 'jumlah_posyandu_siklus_hidup_tidak_aktif', 'jumlah_posyandu_siklus_hidup', 'posyandu_lansia',
  'rs_umum', 'rs_khusus', 'puskesmas_rawat_inap', 'puskesmas_non_rawat_inap', 'puskesmas_pembantu', 'klinik_pratama', 'klinik_utama', 'panti_sehat', 'griya_sehat', 'apotek', 'toko_obat', 'industri_obat_tradisional', 'usaha_kecil_mikro_obat_tradisional', 'toko_alkes', 'industri_kosmetika', 'pedagang_besar_farmasi', 'industri_farmasi', 'distributor_alat_kesehatan', 'produksi_alat_kesehatan', 'produksi_pkrt', 'tempat_praktik_mandiri_dokter', 'tempat_praktik_mandiri_dokter_gigi', 'tempat_praktik_mandiri_dokter_spesialis', 'tempat_praktik_mandiri_bidan', 'tempat_praktik_mandiri_perawat', 'unit_pengelola_darah', 'tahun_2025_ketersediaan_obat_esensial_dan_vaksin_irl', 'jumlah_kf1', 'jumlah_kf_lengkap', 'kf1_pct', 'kf_lengkap_pct', 'jumlah_nifas_vit_a', 'nifas_vit_a_pct', 'jumlah_ibu_bersalin_nifas', 'laboratorium_kesehatan'
]

const ALLOWED_KEYS = new Set([
  ...Object.values(TABLE_METRIC_ALIASES),
  ...EXTRA_ALLOWED_KEYS
])

function formatKeyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bPct\b/gi, '(%)')
    .replace(/\bRs\b/gi, 'RS')
    .replace(/\bTbc\b/gi, 'TBC (Tuberkulosis)')
    .replace(/\bOdhiv\b/gi, 'ODHIV (Orang Dengan HIV)')
    .replace(/\bArv\b/gi, 'ARV (Antiretroviral)')
    .replace(/\bDbd\b/gi, 'DBD (Demam Berdarah Dengue)')
    .replace(/\bCfr\b/gi, 'CFR (Case Fatality Rate)')
    .replace(/\bDm\b/gi, 'DM (Diabetes Melitus)')
    .replace(/\bAfp\b/gi, 'AFP (Acute Flaccid Paralysis)')
    .replace(/\bKlb\b/gi, 'KLB (Kejadian Luar Biasa)')
    .replace(/\bStbm\b/gi, 'STBM (Sanitasi Total Berbasis Masyarakat)')
    .replace(/\bBabs\b/gi, 'BABS (Buang Air Besar Sembarangan)')
    .replace(/\bTfu\b/gi, 'TFU (Tempat Fasilitas Umum)')
    .replace(/\bTpp\b/gi, 'TPP (Tempat Pengelolaan Pangan)')
    .replace(/\bAlos\b/gi, 'ALOS (Average Length of Stay)')
    .replace(/\bBor\b/gi, 'BOR (Bed Occupancy Rate)')
    .replace(/\bBto\b/gi, 'BTO (Bed Turn Over)')
    .replace(/\bToi\b/gi, 'TOI (Turn Over Interval)')
    .replace(/\bBblr\b/gi, 'BBLR (Berat Bayi Lahir Rendah)')
    .replace(/\bKek\b/gi, 'KEK (Kurang Energi Kronis)')
    .replace(/\bGdr\b/gi, 'GDR (Gross Death Rate)')
    .replace(/\bNdr\b/gi, 'NDR (Net Death Rate)')
    .replace(/\bAsi\b/gi, 'ASI (Air Susu Ibu)')
    .replace(/\bKn\b/gi, 'KN (Kunjungan Neonatus)')
    .replace(/\bKn1\b/gi, 'KN1 (Kunjungan Neonatus 1)')
    .replace(/\bKf\b/gi, 'KF (Kunjungan Nifas)')
    .replace(/\bKf1\b/gi, 'KF1 (Kunjungan Nifas 1)')
    .replace(/\bTd2plus\b/gi, 'TD2+ (Tetanus Difteri)')
}

export default function AnalisisStatistik() {
  const { data, loading, error } = useDashboardData()
  const [corrX, setCorrX] = useState<string>('')
  const [corrY, setCorrY] = useState<string>('')

  const { allVariables, numericVariables } = useMemo(() => {
    if (!data || data.length === 0) return { allVariables: [], numericVariables: [] }

    const keySet = new Set<string>()
    const numericSet = new Set<string>()

    const sampleRow = data.find(r => r.kabupaten && r.kabupaten !== 'PROV. JAWA TIMUR') || data[0]

    data.forEach(row => {
      Object.keys(row).forEach(k => {
        if (!IGNORED_KEYS.has(k) && typeof row[k] !== 'function' && ALLOWED_KEYS.has(k)) {
          keySet.add(k)
        }
      })
    })

    // Validate numeric from sample row
    if (sampleRow) {
      Array.from(keySet).forEach(k => {
        const val = sampleRow[k]
        if (typeof val === 'number' || (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)))) {
          numericSet.add(k)
        }
      })
    }

    const formatVar = (k: string): VariableOption => ({ key: k, label: formatKeyToLabel(k) })

    const all = Array.from(keySet).map(formatVar).sort((a, b) => a.label.localeCompare(b.label))
    const num = Array.from(numericSet).map(formatVar).sort((a, b) => a.label.localeCompare(b.label))

    return { allVariables: all, numericVariables: num }
  }, [data])

  useMemo(() => {
    if (numericVariables.length >= 2) {
      if (!corrX || !numericVariables.some(v => v.key === corrX)) setCorrX(numericVariables[0].key)
      if (!corrY || !numericVariables.some(v => v.key === corrY)) setCorrY(numericVariables[1].key)
    }
  }, [numericVariables, corrX, corrY])

  const scatterData = useMemo(() => {
    if (!data || !corrX || !corrY) return []
    return data
      .filter(d => d.kabupaten && d.kabupaten !== 'PROV. JAWA TIMUR')
      .map(d => ({
        x: Number(d[corrX]) || 0,
        y: Number(d[corrY]) || 0,
        name: d.kabupaten
      }))
  }, [data, corrX, corrY])

  const r = pearsonR(scatterData.map(d => d.x), scatterData.map(d => d.y))
  const corrXLabel = numericVariables.find(v => v.key === corrX)?.label || corrX
  const corrYLabel = numericVariables.find(v => v.key === corrY)?.label || corrY

  const scatterInsights = [
    generateCorrelationInsight(corrXLabel, corrYLabel, r)
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-5">
      {/* Welcome / Description Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pusat Analisis Statistik</h2>
        <p className="text-sm text-gray-500">
          Halaman ini khusus untuk mengeksplorasi hubungan antar seluruh indikator di dashboard Provinsi Jawa Timur. Anda dapat mencari pola asosiasi menggunakan Korelasi Pearson (numerik) maupun Uji Independensi Chi-Square dan Crosstab (kategorik/numerik).
        </p>
      </div>

      {/* Correlation Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📈</span>
          <h3 className="font-semibold text-gray-800 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Analisis Korelasi Pearson
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-5">
          Analisis ini mengukur kekuatan dan arah hubungan linier antara dua indikator numerik.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
              <label className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">Variabel X:</label>
              <select 
                value={corrX} 
                onChange={e => setCorrX(e.target.value)}
                className="w-full sm:w-[220px] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-teal-500 font-medium"
              >
                {numericVariables.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            <span className="hidden md:inline text-xs text-gray-400 font-medium">vs</span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
              <label className="text-[11px] font-semibold text-gray-600 whitespace-nowrap">Variabel Y:</label>
              <select 
                value={corrY} 
                onChange={e => setCorrY(e.target.value)}
                className="w-full sm:w-[220px] bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-teal-500 font-medium"
              >
                {numericVariables.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
              </select>
            </div>
            
            <div className="mt-2 md:mt-0 md:ml-auto flex items-center justify-center text-xs font-mono px-3 py-1.5 rounded-lg border border-[#0F8F8B]/20 font-semibold" style={{ background: '#F0FAF9', color: '#0F8F8B' }}>
              r = {r.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              <span className="text-gray-400 mx-2 font-normal">|</span>
              {Math.abs(r) > 0.7 ? 'Kuat' : Math.abs(r) > 0.4 ? 'Sedang' : 'Lemah'}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="x" type="number" tick={{ fontSize: 11 }} name={corrXLabel} />
              <YAxis dataKey="y" type="number" tick={{ fontSize: 11 }} name={corrYLabel} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload?.length) return null
                  const p = payload[0].payload
                  return (
                    <div className="bg-white border border-gray-100 rounded-xl shadow p-3 text-xs">
                      <div className="font-semibold mb-2 border-b pb-1 text-[#0F8F8B]">{p.name}</div>
                      <div className="flex flex-col gap-1">
                        <div><span className="text-gray-500">{corrXLabel}:</span> {p.x?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</div>
                        <div><span className="text-gray-500">{corrYLabel}:</span> {p.y?.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}</div>
                      </div>
                    </div>
                  )
                }} 
              />
              <Scatter data={scatterData} fill="#078FA5" fillOpacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <InsightBox insights={scatterInsights} />

      {/* Crosstab and Chi-Square Section */}
      <CrosstabSection 
        data={data.filter(d => d.kabupaten && d.kabupaten !== 'PROV. JAWA TIMUR')} 
        variables={allVariables} 
        title="Uji Independensi Chi-Square & Tabulasi Silang (Crosstab)" 
      />
    </div>
  )
}
