import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSdmData } from '../hooks/useSdmData'
import FilterBar from '../components/FilterBar'
import KPICard from '../components/KPICard'
import DataTable from '../components/DataTable'
import ChoroplethMap from '../components/ChoroplethMap'
import RankChart from '../components/RankChart'
import DynamicAnalysis from '../components/DynamicAnalysis'
import InsightBox from '../components/InsightBox'

export default function SDMKesehatan() {
  const { data: rawData, indicators, loading, error } = useSdmData()
  const [kab, setKab] = useState('all')
  const [tahun, setTahun] = useState('2025')
  
  const [selectedInd, setSelectedInd] = useState('')

  if (!selectedInd && indicators.length > 0) {
    setSelectedInd(indicators[0])
  }

  const data = useMemo(() => kab === 'all' ? rawData.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : rawData.filter(d => d.kabupaten === kab), [kab, rawData])
  const provData = rawData.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR')

  const totalSDM = useMemo(() => {
    let sum = 0
    data.forEach(row => {
      if (row.kabupaten !== 'PROV. JAWA TIMUR') {
        indicators.forEach(ind => sum += Number(row[ind] || 0))
      }
    })
    return sum
  }, [data, indicators])

  const topSdmType = useMemo(() => {
    if (!indicators.length || !provData.length) return { name: '-', value: 0 }
    let maxName = ''
    let maxVal = -1
    indicators.forEach(ind => {
      const sum = provData.reduce((s, row) => s + Number(row[ind] || 0), 0)
      if (sum > maxVal) { maxVal = sum; maxName = ind }
    })
    return { name: maxName, value: maxVal }
  }, [provData, indicators])

  const topSdmKab = useMemo(() => {
    if (!provData.length) return { name: '-', value: 0 }
    let maxName = ''
    let maxVal = -1
    provData.forEach(row => {
      const sum = indicators.reduce((s, ind) => s + Number(row[ind] || 0), 0)
      if (sum > maxVal) { maxVal = sum; maxName = row.kabupaten }
    })
    return { name: maxName, value: maxVal }
  }, [provData, indicators])

  const tableCols = useMemo(() => {
    const cols: any[] = [{ key: 'kabupaten', label: 'Kabupaten/Kota' }]
    indicators.forEach(ind => {
      cols.push({
        key: ind,
        label: ind.replace(/_/g, ' ').toUpperCase(),
        format: (v: any) => Number(v || 0).toLocaleString('id-ID')
      })
    })
    return cols
  }, [indicators])

  const initialVisibleKeys = selectedInd ? ['kabupaten', selectedInd] : ['kabupaten']

  const maxIndKab = provData.length && selectedInd ? provData.reduce((a, b) => Number(a[selectedInd]||0) > Number(b[selectedInd]||0) ? a : b) : null
  const minIndKab = provData.length && selectedInd ? provData.reduce((a, b) => Number(a[selectedInd]||0) < Number(b[selectedInd]||0) ? a : b) : null
  const avgInd = provData.length && selectedInd ? provData.reduce((s, d) => s + Number(d[selectedInd]||0), 0) / provData.length : 0

  const [limit, setLimit] = useState<number | 'all'>(10)
  
  const rankData = useMemo(() => {
    if (!selectedInd) return []
    const sorted = [...provData].sort((a, b) => Number(b[selectedInd] || 0) - Number(a[selectedInd] || 0))
    const sliced = limit === 'all' ? sorted : sorted.slice(0, limit)
    return sliced.map(d => ({
      kabupaten: d.kabupaten.replace('Kota ', ''),
      value: Number(d[selectedInd] || 0)
    }))
  }, [provData, selectedInd, limit])

  if (loading) return <div className="p-8 text-center text-gray-500">Loading data SDM (Tabel 13-18)...</div>
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>

  return (
    <div className="flex flex-col gap-6">
      <FilterBar kab={kab} tahun={tahun} onKab={setKab} onTahun={setTahun} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard title="Total SDM Kesehatan" value={totalSDM.toLocaleString('id-ID')} icon="👥" color="#0FB0AA" />
        <KPICard title="Jenis SDM Terbanyak" value={topSdmType.name.replace(/_/g, ' ').toUpperCase()} sub={`${topSdmType.value.toLocaleString('id-ID')} orang`} icon="🏅" color="#06B5D0" />
        <KPICard title="Kabupaten SDM Terbanyak" value={topSdmKab.name.replace('Kota ', '')} sub={`${topSdmKab.value.toLocaleString('id-ID')} SDM`} icon="🏥" color="#CBD92C" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Distribusi SDM Kesehatan</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Pilih Indikator:</span>
              <select value={selectedInd} onChange={e => setSelectedInd(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500 max-w-[250px]">
                {indicators.map(ind => (
                  <option key={ind} value={ind}>{ind.replace(/_/g, ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Jumlah:</span>
              <select value={limit} onChange={e => setLimit(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500">
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value="all">Semua</option>
              </select>
            </div>
          </div>
        </div>
        {selectedInd && rankData.length > 0 && (
          <div className="w-full h-[400px] overflow-y-auto pr-2">
            <ResponsiveContainer width="100%" height={Math.max(400, rankData.length * 40)}>
              <BarChart data={rankData} layout="vertical" margin={{ left: 100, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11 }} width={98} interval={0} />
                <Tooltip 
                  formatter={(v: any) => v.toLocaleString('id-ID')}
                  labelFormatter={(l) => `Kabupaten ${l}`}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }} 
                />
                <Bar dataKey="value" name={selectedInd.replace(/_/g, ' ').toUpperCase()} radius={[0, 6, 6, 0]} fill="#0FB0AA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Peta Persebaran: {selectedInd.replace(/_/g, ' ').toUpperCase()}</h3>
        {selectedInd && <ChoroplethMap data={provData} indicatorKey={selectedInd} indicatorLabel={selectedInd.replace(/_/g, ' ').toUpperCase()} />}
      </div>

      <DynamicAnalysis data={rawData} indicators={indicators} />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>Data Table SDM Kesehatan</h3>
        <DataTable data={data} columns={tableCols} initialVisibleKeys={initialVisibleKeys} pageSize={10} />
      </div>

      {selectedInd && (
        <InsightBox>
          Berdasarkan filter yang aktif, indikator <strong>{selectedInd.replace(/_/g, ' ')}</strong> memiliki rata-rata provinsi sebesar <strong>{Math.round(avgInd).toLocaleString('id-ID')}</strong>. 
          Ketersediaan tertinggi berada di <strong>{maxIndKab?.kabupaten}</strong> ({Number(maxIndKab?.[selectedInd]||0).toLocaleString('id-ID')}), sedangkan ketersediaan terendah berada di <strong>{minIndKab?.kabupaten}</strong> ({Number(minIndKab?.[selectedInd]||0).toLocaleString('id-ID')}).
        </InsightBox>
      )}
    </div>
  )
}
