import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, LabelList } from 'recharts'
import { descStats, pearsonR } from '../utils/stats'
import StatPanel from './StatPanel'
import InsightBox from './InsightBox'
import { SdmRow } from '../hooks/useSdmData'

type Props = {
  data: SdmRow[]
  indicators: string[]
}

const cleanLabel = (s: string) => {
  let res = s.replace(/_/g, ' ')
  return res.length > 20 ? res.substring(0, 20) + '...' : res
}

export default function DynamicAnalysis({ data, indicators }: Props) {
  const [analysis, setAnalysis] = useState('deskriptif')
  const [selectedInd, setSelectedInd] = useState(indicators[0] || '')
  
  // For Correlation
  const [varX, setVarX] = useState('')
  const [varY, setVarY] = useState('')

  // Automatic Top 5 indicators for Heatmap based on highest sum
  const topIndicators = useMemo(() => {
    if (!indicators.length) return []
    const sums = indicators.map(ind => ({
      ind,
      sum: data.reduce((s, d) => s + Number(d[ind] || 0), 0)
    }))
    sums.sort((a, b) => b.sum - a.sum)
    return sums.slice(0, 6).map(s => s.ind)
  }, [data, indicators])

  // Correlation Matrix for topIndicators
  const matrix = useMemo(() => {
    const mat: Record<string, Record<string, number>> = {}
    topIndicators.forEach(i => {
      mat[i] = {}
      topIndicators.forEach(j => {
        if (i === j) mat[i][j] = 1
        else {
          const xs = data.map(d => Number(d[i] || 0))
          const ys = data.map(d => Number(d[j] || 0))
          mat[i][j] = pearsonR(xs, ys)
        }
      })
    })
    return mat
  }, [data, topIndicators])

  // Initialize Correlation vars
  if (analysis === 'korelasi' && !varX && topIndicators.length >= 2) {
    setVarX(topIndicators[0])
    setVarY(topIndicators[1])
  }

  // Regression line for scatter
  const scatterData = useMemo(() => {
    if (!varX || !varY) return []
    const raw = data.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR').map(d => ({
      kabupaten: d.kabupaten,
      x: Number(d[varX] || 0),
      y: Number(d[varY] || 0)
    }))
    
    // Calculate simple linear regression y = mx + b
    const n = raw.length
    if (n === 0) return []
    const sumX = raw.reduce((s, d) => s + d.x, 0)
    const sumY = raw.reduce((s, d) => s + d.y, 0)
    const sumXY = raw.reduce((s, d) => s + d.x * d.y, 0)
    const sumX2 = raw.reduce((s, d) => s + d.x * d.x, 0)
    
    const denominator = (n * sumX2 - sumX * sumX)
    let m = 0, b = 0
    if (denominator !== 0) {
      m = (n * sumXY - sumX * sumY) / denominator
      b = (sumY - m * sumX) / n
    }

    const minX = Math.min(...raw.map(d => d.x))
    const maxX = Math.max(...raw.map(d => d.x))

    return raw.map(d => ({
      ...d,
      trendY: m * d.x + b
    }))
  }, [data, varX, varY])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans' }}>Analisis SDM Dinamis</h3>
        <select 
          value={analysis} 
          onChange={e => setAnalysis(e.target.value)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:border-teal-500"
        >
          <option value="deskriptif">Statistik Deskriptif</option>
          <option value="crosstab">Crosstab (Tabulasi Silang)</option>
          <option value="korelasi">Korelasi & Regresi</option>
        </select>
      </div>

      {analysis === 'deskriptif' && (
        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Pilih Indikator</label>
            <select 
              value={selectedInd} 
              onChange={e => setSelectedInd(e.target.value)}
              className="w-full md:w-1/2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
            >
              {indicators.map(ind => (
                <option key={ind} value={ind}>{ind.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          {selectedInd && (
            <>
              <StatPanel 
                stats={descStats(data.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR').map(d => Number(d[selectedInd] || 0)))} 
                label={selectedInd.replace(/_/g, ' ').toUpperCase()} 
              />
              <InsightBox>
                Hasil analisis deskriptif untuk <strong>{selectedInd.replace(/_/g, ' ')}</strong> menunjukkan sebaran SDM di Provinsi Jawa Timur. Dengan membandingkan nilai maksimum dan minimum, kita dapat mengidentifikasi kesenjangan ketersediaan tenaga kesehatan antar wilayah.
              </InsightBox>
            </>
          )}
        </div>
      )}

      {analysis === 'crosstab' && (
        <div className="py-10 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h4 className="text-gray-800 font-semibold mb-2">Analisis Tidak Dapat Dilakukan</h4>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Metode Crosstab membutuhkan minimal dua variabel kategorik. Seluruh indikator pada dataset SDM Kesehatan bersifat numerik (jumlah tenaga medis). Silakan gunakan <strong>Analisis Korelasi</strong> untuk variabel numerik.
          </p>
          <button 
            onClick={() => setAnalysis('korelasi')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
          >
            Beralih ke Analisis Korelasi
          </button>
        </div>
      )}

      {analysis === 'korelasi' && (
        <div className="space-y-6">
          <div className="overflow-x-auto">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Matriks Korelasi (6 Indikator Terbanyak)</h4>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border border-gray-200 bg-gray-50"></th>
                  {topIndicators.map(i => (
                    <th key={i} className="p-2 border border-gray-200 bg-gray-50 text-gray-600 font-medium" title={i}>
                      {cleanLabel(i)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topIndicators.map(i => (
                  <tr key={i}>
                    <td className="p-2 border border-gray-200 bg-gray-50 text-gray-600 font-medium whitespace-nowrap" title={i}>
                      {cleanLabel(i)}
                    </td>
                    {topIndicators.map(j => {
                      const val = matrix[i][j]
                      const isHigh = Math.abs(val) > 0.7 && val !== 1
                      return (
                        <td 
                          key={j} 
                          className="p-2 border border-gray-200 text-center cursor-pointer hover:ring-2 ring-teal-400 transition-all"
                          style={{
                            backgroundColor: val === 1 ? '#f3f4f6' : val > 0 ? `rgba(15, 176, 170, ${Math.abs(val)*0.5})` : `rgba(249, 115, 22, ${Math.abs(val)*0.5})`,
                            color: Math.abs(val) > 0.5 ? 'white' : 'black',
                            fontWeight: isHigh ? 'bold' : 'normal'
                          }}
                          onClick={() => { setVarX(i); setVarY(j); }}
                          title="Klik untuk melihat Scatter Plot"
                        >
                          {val.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-gray-400 mt-2">*Klik sel pada matriks untuk merender Scatter Plot di bawah.</p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Variabel X (Sumbu Horizontal)</label>
                <select value={varX} onChange={e => setVarX(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500">
                  {indicators.map(i => <option key={i} value={i}>{i.replace(/_/g, ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Variabel Y (Sumbu Vertikal)</label>
                <select value={varY} onChange={e => setVarY(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500">
                  {indicators.map(i => <option key={i} value={i}>{i.replace(/_/g, ' ').toUpperCase()}</option>)}
                </select>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={scatterData} margin={{ top: 40, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" dataKey="x" name={cleanLabel(varX)} tick={{ fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name={cleanLabel(varY)} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    formatter={(val: any, name: any) => [val.toLocaleString('id-ID'), name === 'x' ? cleanLabel(varX) : name === 'y' ? cleanLabel(varY) : 'Trend']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.kabupaten || label}
                  />
                  <Scatter name="Kabupaten/Kota" dataKey="y" fill="#0F8F8B" />
                  <Line type="monotone" dataKey="trendY" stroke="#f97316" dot={false} activeDot={false} strokeWidth={2} name="Garis Regresi (Trend)">
                                    <LabelList dataKey="trendY" position="top" offset={8} formatter={(v: any) => typeof v === 'number' ? (v >= 1e6 ? (v/1e6).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) + ' juta' : v % 1 !== 0 ? v.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1}) : v.toLocaleString('id-ID')) : v} style={{ fontSize: 11, fill: '#1f2937', fontWeight: 600, stroke: '#ffffff', strokeWidth: 2, paintOrder: 'stroke' }} />
                                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {varX && varY && (
              <InsightBox>
                Korelasi Pearson antara <strong>{varX.replace(/_/g, ' ')}</strong> dan <strong>{varY.replace(/_/g, ' ')}</strong> adalah sebesar <strong>{pearsonR(data.map(d => Number(d[varX]||0)), data.map(d => Number(d[varY]||0))).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>. 
                Nilai ini merepresentasikan tingkat dan arah hubungan linier antar kedua variabel SDM di Jawa Timur. Garis regresi oranye memperlihatkan kecenderungan (_trend_) data.
              </InsightBox>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
