import RiskClusteringMap from '../components/RiskClusteringMap';
import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, Legend
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'
import { descStats, pearsonR } from '../utils/stats'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import InsightBox from '../components/InsightBox'
import StatPanel from '../components/StatPanel'
import ChoroplethMap from '../components/ChoroplethMap'
import RankChart from '../components/RankChart'
import DataTable from '../components/DataTable'
import CrosstabSection from '../components/CrosstabSection'

export default function UKBM() {
  const { data: saranaKesehatan, loading, error } = useDashboardData()

  const [statIndic, setStatIndic] = useState('jumlah_posyandu_siklus_hidup_aktif')
  const [mapIndicator, setMapIndicator] = useState('jumlah_posyandu_siklus_hidup_aktif')

  const data = useMemo(() => saranaKesehatan.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR'), [saranaKesehatan])

  const totAktif = data.reduce((s, d) => s + Number(d.jumlah_posyandu_siklus_hidup_aktif || 0), 0)
  const totTidakAktif = data.reduce((s, d) => s + Number(d.jumlah_posyandu_siklus_hidup_tidak_aktif || 0), 0)
  const totPosyandu = data.reduce((s, d) => s + Number(d.jumlah_posyandu_siklus_hidup || 0), 0)
  const pctAktif = totPosyandu > 0 ? (totAktif / totPosyandu * 100) : 0

  const dataWithPct = useMemo(() => {
    return data.map(d => ({
      ...d,
      pct_aktif: Number(d.jumlah_posyandu_siklus_hidup) > 0 ? (Number(d.jumlah_posyandu_siklus_hidup_aktif || 0) / Number(d.jumlah_posyandu_siklus_hidup)) * 100 : 0,
      pct_tidak_aktif: Number(d.jumlah_posyandu_siklus_hidup) > 0 ? (Number(d.jumlah_posyandu_siklus_hidup_tidak_aktif || 0) / Number(d.jumlah_posyandu_siklus_hidup)) * 100 : 0,
    }))
  }, [data])



  const stats = descStats(data.map(d => Number(d[statIndic] || 0)))

  const indicatorOptions = [
    { key: 'jumlah_posyandu_siklus_hidup', label: 'Total Posyandu' },
    { key: 'jumlah_posyandu_siklus_hidup_aktif', label: 'Jumlah Posyandu Aktif' },
    { key: 'jumlah_posyandu_siklus_hidup_tidak_aktif', label: 'Jumlah Posyandu Tidak Aktif' }
  ]
  const statIndicLabel = indicatorOptions.find(o => o.key === statIndic)?.label ?? statIndic

  const rankIndicators = [
    { key: 'jumlah_posyandu_siklus_hidup', label: 'Total Posyandu' },
    { key: 'jumlah_posyandu_siklus_hidup_aktif', label: 'Jumlah Posyandu Aktif' },
    { key: 'jumlah_posyandu_siklus_hidup_tidak_aktif', label: 'Jumlah Posyandu Tidak Aktif' },
    { key: 'pct_aktif', label: 'Persentase Posyandu Aktif', isPercentage: true },
    { key: 'pct_tidak_aktif', label: 'Persentase Posyandu Tidak Aktif', isPercentage: true }
  ]

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-6">


      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="Total Posyandu" value="46.414" sub="Unit" icon="🌿" color="#0F8F8B" />
        <KPICard title="Posyandu Aktif" value={totAktif.toLocaleString('id-ID')} sub={pctAktif.toFixed(1) + '% dari total'} icon="✅" color="#22c55e" />
        <KPICard title="Posyandu Tidak Aktif" value={totTidakAktif.toLocaleString('id-ID')} sub={(100 - pctAktif).toFixed(1) + '% dari total'} icon="⚠️" color="#f97316" />
        <KPICard title="% Posyandu Aktif" value="95,1%" icon="📊" color="#9EAF24" trend={pctAktif >= 80 ? 'up' : 'down'} trendVal={pctAktif >= 80 ? 'Target tercapai' : ''} />
      </div>

      {/* CHOROPLETH MAP SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Peta Sebaran UKBM Provinsi Jawa Timur</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 font-medium">Indikator:</span>
            <select 
              value={mapIndicator} 
              onChange={e => setMapIndicator(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0F8F8B] bg-gray-50 text-gray-700"
            >
              {indicatorOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ChoroplethMap 
          data={data} 
          indicatorKey={mapIndicator} 
          indicatorLabel={indicatorOptions.find(o => o.key === mapIndicator)?.label || ''} 
        />
      </div>

      <div className="flex flex-col gap-4">
        <RankChart 
          data={dataWithPct} 
          indicators={rankIndicators} 
          defaultIndicator="jumlah_posyandu_siklus_hidup_aktif" 
          title="Ranking Data Posyandu per Kabupaten/Kota"
        />
      </div>

      <StatPanel 
        stats={stats} 
        label={statIndicLabel} 
        rightElement={
          <select value={statIndic} onChange={e => setStatIndic(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-teal-400 max-w-[250px]">
            {indicatorOptions.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        }
      />

      <CrosstabSection
        data={dataWithPct}
        variables={rankIndicators}
        defaultRowVar="jumlah_posyandu_siklus_hidup_aktif"
        defaultColVar="pct_aktif"
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Daftar Lengkap Jumlah Posyandu Siklus Hidup
        </h3>
        
      <RiskClusteringMap 
        title="Analisis Klasterisasi Pemetaan Risiko Keaktifan Posyandu"
        data={data} 
        variables={['pct_aktif']} 
        directions={[-1]} 
        variableLabels={['Posyandu Aktif (%)']} 
      />

      <DataTable data={data} columns={[
          { key: 'kabupaten', label: 'Kabupaten/Kota' },
          { key: 'jumlah_posyandu_siklus_hidup', label: 'Total Posyandu', format: v => v?.toLocaleString('id-ID') },
          { key: 'jumlah_posyandu_siklus_hidup_aktif', label: 'Posyandu Aktif', format: v => v?.toLocaleString('id-ID') },
          { key: 'jumlah_posyandu_siklus_hidup_tidak_aktif', label: 'Tidak Aktif', format: v => v?.toLocaleString('id-ID') },
        ]} />
      </div>
    </div>
  )
}
