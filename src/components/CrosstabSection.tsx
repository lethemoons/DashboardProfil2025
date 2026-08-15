import { useState, useMemo } from 'react'
import {
  categorizeVariable,
  calculateChiSquare,
  BinningMethod,
  ChiSquareResult
} from '../utils/stats'
import InsightBox from './InsightBox'

export interface VariableOption {
  key: string
  label: string
}

interface Props {
  data: Record<string, any>[]
  variables?: VariableOption[]
  defaultRowVar?: string
  defaultColVar?: string
  title?: string
}

const IGNORED_KEYS = new Set([
  'id',
  'no',
  'tableNo',
  'kabupaten',
  'name',
  'createdAt',
  'updatedAt',
  'tahun',
  'metric',
  'value'
])

function formatKeyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bPct\b/gi, '(%)')
    .replace(/\bRs\b/gi, 'RS')
    .replace(/\bTbc\b/gi, 'TBC')
    .replace(/\bOdhiv\b/gi, 'ODHIV')
    .replace(/\bArv\b/gi, 'ARV')
    .replace(/\bDbd\b/gi, 'DBD')
    .replace(/\bCfr\b/gi, 'CFR')
    .replace(/\bDm\b/gi, 'DM')
    .replace(/\bAfp\b/gi, 'AFP')
    .replace(/\bKlb\b/gi, 'KLB')
    .replace(/\bStbm\b/gi, 'STBM')
    .replace(/\bBabs\b/gi, 'BABS')
    .replace(/\bTfu\b/gi, 'TFU')
    .replace(/\bTpp\b/gi, 'TPP')
}

export default function CrosstabSection({
  data,
  variables: providedVariables,
  defaultRowVar,
  defaultColVar,
  title = 'Analisis Crosstab'
}: Props) {
  // 1. Auto-detect or use provided variables
  const availableVariables = useMemo(() => {
    if (providedVariables && providedVariables.length > 0) {
      return providedVariables
    }

    if (!data || data.length === 0) return []

    // Detect all usable keys across data
    const keySet = new Set<string>()
    data.forEach(row => {
      Object.keys(row).forEach(k => {
        if (!IGNORED_KEYS.has(k) && typeof row[k] !== 'function') {
          keySet.add(k)
        }
      })
    })

    return Array.from(keySet)
      .map(key => ({
        key,
        label: formatKeyToLabel(key)
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [data, providedVariables])

  // Initial variable states
  const [rowVar, setRowVar] = useState<string>(() => {
    if (defaultRowVar && availableVariables.some(v => v.key === defaultRowVar)) {
      return defaultRowVar
    }
    return availableVariables[0]?.key ?? ''
  })

  const [colVar, setColVar] = useState<string>(() => {
    if (defaultColVar && availableVariables.some(v => v.key === defaultColVar)) {
      return defaultColVar
    }
    return availableVariables[1]?.key ?? availableVariables[0]?.key ?? ''
  })

  const [showPercentage, setShowPercentage] = useState<boolean>(false)
  const [percentType, setPercentType] = useState<'total' | 'row' | 'col'>('total')
  const [numBins, setNumBins] = useState<number>(3)
  const [binMethod, setBinMethod] = useState<BinningMethod>('quantile')

  // Keep state in sync if available variables change
  useMemo(() => {
    if (availableVariables.length >= 2) {
      if (!availableVariables.some(v => v.key === rowVar)) {
        setRowVar(availableVariables[0].key)
      }
      if (!availableVariables.some(v => v.key === colVar)) {
        setColVar(availableVariables[1].key)
      }
    }
  }, [availableVariables])

  const rowVarOption = availableVariables.find(v => v.key === rowVar)
  const colVarOption = availableVariables.find(v => v.key === colVar)

  // 2. Perform Categorization & Crosstab Computation
  const crosstabResult = useMemo(() => {
    if (!data || data.length === 0 || !rowVar || !colVar || availableVariables.length < 2) {
      return null
    }

    const rowValues = data.map(d => d[rowVar])
    const colValues = data.map(d => d[colVar])

    const rowCatInfo = categorizeVariable(rowValues, numBins, binMethod)
    const colCatInfo = categorizeVariable(colValues, numBins, binMethod)

    const rowCategories = rowCatInfo.categories
    const colCategories = colCatInfo.categories

    const rLen = rowCategories.length
    const cLen = colCategories.length

    // Matrix of counts
    const matrix: number[][] = Array.from({ length: rLen }, () => Array(cLen).fill(0))
    const itemLists: string[][][] = Array.from({ length: rLen }, () =>
      Array.from({ length: cLen }, () => [])
    )

    let totalCount = 0

    data.forEach(d => {
      const rLabel = rowCatInfo.categorize(d[rowVar])
      const cLabel = colCatInfo.categorize(d[colVar])

      const rIdx = rowCategories.findIndex(c => c.label === rLabel)
      const cIdx = colCategories.findIndex(c => c.label === cLabel)

      if (rIdx !== -1 && cIdx !== -1) {
        matrix[rIdx][cIdx]++
        totalCount++
        if (d.kabupaten) {
          itemLists[rIdx][cIdx].push(d.kabupaten)
        }
      }
    })

    // Totals
    const rowTotals = matrix.map(row => row.reduce((s, v) => s + v, 0))
    const colTotals = Array(cLen).fill(0)
    for (let j = 0; j < cLen; j++) {
      for (let i = 0; i < rLen; i++) {
        colTotals[j] += matrix[i][j]
      }
    }

    // Find Max Cell
    let maxVal = -1
    let maxCell: { rIdx: number; cIdx: number } | null = null
    let minVal = Infinity
    let minCell: { rIdx: number; cIdx: number } | null = null

    for (let i = 0; i < rLen; i++) {
      for (let j = 0; j < cLen; j++) {
        const val = matrix[i][j]
        if (val > maxVal) {
          maxVal = val
          maxCell = { rIdx: i, cIdx: j }
        }
        if (val < minVal) {
          minVal = val
          minCell = { rIdx: i, cIdx: j }
        }
      }
    }

    // Statistical Chi-Square Test
    const chiSquareResult: ChiSquareResult = calculateChiSquare(matrix)

    return {
      rowCategories,
      colCategories,
      matrix,
      itemLists,
      rowTotals,
      colTotals,
      totalCount,
      maxVal,
      maxCell,
      minVal,
      minCell,
      chiSquareResult
    }
  }, [data, rowVar, colVar, numBins, binMethod, availableVariables])

  // 3. Fallback when variables < 2
  if (availableVariables.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📊</span>
          <h3 className="font-semibold text-gray-800 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {title}
          </h3>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          Analisis crosstab tidak tersedia untuk dataset ini karena tidak terdapat dua variabel yang memenuhi syarat.
        </div>
      </div>
    )
  }

  // 4. Generate Auto-Interpretation Insights
  const insights = useMemo(() => {
    if (!crosstabResult || crosstabResult.totalCount === 0) return []

    const {
      rowCategories,
      colCategories,
      matrix,
      rowTotals,
      colTotals,
      totalCount,
      maxVal,
      maxCell,
      minVal,
      minCell,
      chiSquareResult
    } = crosstabResult

    const rowName = rowVarOption?.label ?? rowVar
    const colName = colVarOption?.label ?? colVar

    const list: string[] = []

    // 1. Distribution summary
    const highestRow = rowCategories.reduce((maxI, _, i) => rowTotals[i] > rowTotals[maxI] ? i : maxI, 0)
    const highestCol = colCategories.reduce((maxJ, _, j) => colTotals[j] > colTotals[maxJ] ? j : maxJ, 0)

    list.push(
      `Dari total **${totalCount} wilayah/entitas** yang dianalisis, mayoritas baris (${rowName}) berada pada kategori **${rowCategories[highestRow]?.shortLabel ?? rowCategories[highestRow]?.label}** (${rowTotals[highestRow]} wilayah / ${((rowTotals[highestRow] / totalCount) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%), sedangkan kolom (${colName}) didominasi kategori **${colCategories[highestCol]?.shortLabel ?? colCategories[highestCol]?.label}** (${colTotals[highestCol]} wilayah / ${((colTotals[highestCol] / totalCount) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%).`
    )

    // 2. Highest frequency combination
    if (maxCell && maxVal > 0) {
      const rLabel = rowCategories[maxCell.rIdx]?.label
      const cLabel = colCategories[maxCell.cIdx]?.label
      const pctOfTotal = ((maxVal / totalCount) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      const rTotal = rowTotals[maxCell.rIdx]
      const pctOfRow = rTotal > 0 ? ((maxVal / rTotal) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0'

      list.push(
        `**Kombinasi Tertinggi:** Kategori **${rLabel}** bertemu dengan **${cLabel}** memiliki frekuensi terbanyak, yaitu **${maxVal} wilayah** (${pctOfTotal}% dari total, atau ${pctOfRow}% dari kategori barisnya).`
      )
    }

    // 3. Lowest frequency combination
    if (minCell) {
      const rMinLabel = rowCategories[minCell.rIdx]?.shortLabel ?? rowCategories[minCell.rIdx]?.label
      const cMinLabel = colCategories[minCell.cIdx]?.shortLabel ?? colCategories[minCell.cIdx]?.label
      const pctMin = ((minVal / totalCount) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

      list.push(
        `**Kombinasi Terendah:** Pasangan **${rMinLabel}** dan **${cMinLabel}** memiliki frekuensi paling sedikit (**${minVal} wilayah** / ${pctMin}%).`
      )
    }

    // 4. Statistical significance verdict
    if (chiSquareResult && chiSquareResult.df > 0) {
      const pFormatted = chiSquareResult.pValue < 0.001 ? '< 0.001' : `= ${chiSquareResult.pValue.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`
      const chiFormatted = chiSquareResult.chiSquare.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

      if (chiSquareResult.isSignificant) {
        list.push(
          `**Kesimpulan Uji Independensi (Chi-Square):** Terdapat hubungan/asosiasi yang **signifikan secara statistik** antara **${rowName}** dan **${colName}** (χ² = ${chiFormatted}, df = ${chiSquareResult.df}, p ${pFormatted} < 0,05).`
        )
      } else {
        list.push(
          `**Kesimpulan Uji Independensi (Chi-Square):** **Tidak terdapat hubungan yang signifikan secara statistik** antara **${rowName}** dan **${colName}** (χ² = ${chiFormatted}, df = ${chiSquareResult.df}, p ${pFormatted} ≥ 0,05). Kedua variabel cenderung saling independen.`
        )
      }
    }

    return list
  }, [crosstabResult, rowVarOption, colVarOption, rowVar, colVar])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-4">
      {/* Header section */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 font-bold">
            ⊞
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm md:text-base leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {title}
            </h3>
            <p className="text-[11px] text-gray-400">Tabulasi silang interaktif & uji independensi antar dua variabel</p>
          </div>
        </div>

        {/* Quick info tag */}
        {crosstabResult?.chiSquareResult && (
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1.5 ${
                crosstabResult.chiSquareResult.isSignificant
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  crosstabResult.chiSquareResult.isSignificant ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              />
              {crosstabResult.chiSquareResult.isSignificant ? 'Asosiasi Signifikan (p < 0,05)' : 'Independen (p ≥ 0,05)'}
            </span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-50/70 p-3.5 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Dropdown Variabel Baris */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#0F8F8B]" />
            Variabel Baris:
          </label>
          <select
            value={rowVar}
            onChange={e => setRowVar(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 font-medium"
          >
            {availableVariables.map(v => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown Variabel Kolom */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#078FA5]" />
            Variabel Kolom:
          </label>
          <select
            value={colVar}
            onChange={e => setColVar(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200 font-medium"
          >
            {availableVariables.map(v => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Kategorisasi / Binning */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-600">Jumlah Kategori (Bins):</label>
          <select
            value={`${numBins}-${binMethod}`}
            onChange={e => {
              const [b, m] = e.target.value.split('-')
              setNumBins(Number(b))
              setBinMethod(m as BinningMethod)
            }}
            className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-teal-500 font-medium"
          >
            <option value="3-quantile">3 Kategori (Rendah / Sedang / Tinggi)</option>
            <option value="2-quantile">2 Kategori (Rendah / Tinggi - Median)</option>
            <option value="4-quantile">4 Kategori (Kuartil Q1–Q4)</option>
            <option value="3-equal_width">3 Kategori (Interval Sama)</option>
          </select>
        </div>

        {/* Options & Percentage Toggle */}
        <div className="flex flex-col justify-end gap-1.5">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showPercentage}
              onChange={e => setShowPercentage(e.target.checked)}
              className="accent-[#0F8F8B] w-3.5 h-3.5 rounded cursor-pointer"
            />
            <span className="text-xs font-semibold text-gray-700">Tampilkan Persentase</span>
          </label>

          {showPercentage && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400">Basis:</span>
              <select
                value={percentType}
                onChange={e => setPercentType(e.target.value as any)}
                className="bg-white border border-gray-200 rounded px-2 py-0.5 text-[11px] text-gray-600 outline-none focus:border-teal-500"
              >
                <option value="total">% Total</option>
                <option value="row">% Baris</option>
                <option value="col">% Kolom</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Warn if same variable selected */}
      {rowVar === colVar && (
        <div className="p-2.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs flex items-center gap-2">
          <span>ℹ️</span>
          <span>Variabel baris dan kolom yang dipilih sama. Pilih dua variabel berbeda untuk analisis kontingensi yang lebih optimal.</span>
        </div>
      )}

      {/* Crosstab Table */}
      {crosstabResult && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              {/* Top header row */}
              <tr style={{ backgroundColor: '#0F8F8B', color: '#FFFFFF' }}>
                <th
                  rowSpan={2}
                  className="px-4 py-3 text-left font-semibold border-r border-teal-600/30 whitespace-nowrap align-middle"
                >
                  <div className="text-[10px] uppercase tracking-wider text-teal-100">Baris / Kolom</div>
                  <div className="text-xs font-bold mt-0.5">{rowVarOption?.label ?? rowVar}</div>
                </th>
                <th
                  colSpan={crosstabResult.colCategories.length}
                  className="px-4 py-2 font-semibold border-b border-teal-600/30 tracking-wide text-xs"
                >
                  {colVarOption?.label ?? colVar}
                </th>
                <th
                  rowSpan={2}
                  className="px-4 py-3 font-bold border-l border-teal-600/30 bg-[#0B7773] text-white whitespace-nowrap align-middle"
                >
                  Total Baris
                </th>
              </tr>

              {/* Sub-header row for column categories */}
              <tr style={{ backgroundColor: '#0B7773', color: '#FFFFFF' }}>
                {crosstabResult.colCategories.map((colCat, j) => (
                  <th
                    key={j}
                    className="px-3 py-2 font-semibold border-r border-teal-600/40 text-xs text-white whitespace-nowrap"
                    title={colCat.label}
                  >
                    {colCat.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {crosstabResult.rowCategories.map((rowCat, i) => {
                const rTotal = crosstabResult.rowTotals[i]
                return (
                  <tr key={i} className="border-t border-gray-100 hover:bg-teal-50/30 transition-colors">
                    {/* Row category header */}
                    <td
                      className="px-4 py-3 text-left font-semibold text-gray-800 bg-[#F0FAF9]/60 border-r border-gray-100 whitespace-nowrap"
                      title={rowCat.label}
                    >
                      {rowCat.label}
                    </td>

                    {/* Cell values */}
                    {crosstabResult.colCategories.map((colCat, j) => {
                      const count = crosstabResult.matrix[i][j]
                      const isMax =
                        crosstabResult.maxCell &&
                        crosstabResult.maxCell.rIdx === i &&
                        crosstabResult.maxCell.cIdx === j &&
                        count > 0

                      let pctValue = 0
                      if (percentType === 'total') {
                        pctValue = crosstabResult.totalCount > 0 ? (count / crosstabResult.totalCount) * 100 : 0
                      } else if (percentType === 'row') {
                        pctValue = rTotal > 0 ? (count / rTotal) * 100 : 0
                      } else {
                        const cTot = crosstabResult.colTotals[j]
                        pctValue = cTot > 0 ? (count / cTot) * 100 : 0
                      }

                      const tooltipItems = crosstabResult.itemLists[i][j]

                      return (
                        <td
                          key={j}
                          className={`px-3 py-2.5 text-gray-800 border-r border-gray-100 transition-colors relative group ${
                            isMax ? 'bg-[#9EAF24]/20 font-bold ring-1 ring-inset ring-[#9EAF24]/50' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center">
                            <span className={`text-xs ${isMax ? 'text-teal-900 font-bold' : 'font-medium'}`}>
                              {count}
                            </span>
                            {showPercentage && (
                              <span className="text-[10px] text-gray-500 font-mono mt-0.5">
                                {pctValue.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                              </span>
                            )}
                          </div>

                          {/* Hover tooltip for list of kabupaten in this cell */}
                          {tooltipItems.length > 0 && (
                            <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-30 bg-gray-900 text-white text-[10px] rounded-lg py-1 px-2.5 shadow-xl max-w-xs w-max whitespace-normal text-left">
                              <div className="font-semibold text-teal-300 border-b border-gray-700 pb-0.5 mb-1">
                                {rowCat.shortLabel} × {colCat.shortLabel} ({count} wilayah):
                              </div>
                              <div className="line-clamp-4 leading-tight">{tooltipItems.join(', ')}</div>
                            </div>
                          )}
                        </td>
                      )
                    })}

                    {/* Row Total */}
                    <td className="px-4 py-2.5 font-bold text-gray-900 bg-gray-50/80 border-l border-gray-100">
                      <div className="flex flex-col items-center">
                        <span>{rTotal}</span>
                        {showPercentage && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {crosstabResult.totalCount > 0
                              ? ((rTotal / crosstabResult.totalCount) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                              : 0}
                            %
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {/* Total Column Row */}
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-bold text-gray-900">
                <td className="px-4 py-3 text-left border-r border-gray-200 font-bold text-gray-900">
                  Total Kolom
                </td>
                {crosstabResult.colCategories.map((_, j) => {
                  const cTot = crosstabResult.colTotals[j]
                  return (
                    <td key={j} className="px-3 py-2.5 border-r border-gray-200">
                      <div className="flex flex-col items-center">
                        <span>{cTot}</span>
                        {showPercentage && (
                          <span className="text-[10px] text-gray-500 font-mono">
                            {crosstabResult.totalCount > 0
                              ? ((cTot / crosstabResult.totalCount) * 100).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                              : 0}
                            %
                          </span>
                        )}
                      </div>
                    </td>
                  )
                })}
                <td className="px-4 py-3 bg-teal-50 text-teal-800 font-extrabold border-l border-gray-200">
                  <div className="flex flex-col items-center">
                    <span>{crosstabResult.totalCount}</span>
                    {showPercentage && <span className="text-[10px] text-teal-600 font-mono">100,0%</span>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Statistical Summary Panel */}
      {crosstabResult?.chiSquareResult && crosstabResult.chiSquareResult.df > 0 && (
        <div className="bg-[#F8FDFD] rounded-xl p-3.5 border border-teal-100 flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wide">Uji Independensi Chi-Square</span>
              <span className="text-[10px] text-gray-400">|</span>
              <span className="text-[11px] text-gray-600">
                Tingkat Signifikansi α = 0,05
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-white border border-teal-200 font-mono text-teal-900 font-semibold shadow-2xs">
                χ² = {crosstabResult.chiSquareResult.chiSquare.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 font-mono text-gray-700 shadow-2xs">
                df = {crosstabResult.chiSquareResult.df}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md bg-white border border-gray-200 font-mono shadow-2xs ${
                  crosstabResult.chiSquareResult.isSignificant
                    ? 'text-emerald-700 font-semibold'
                    : 'text-gray-700'
                }`}
              >
                p-value = {crosstabResult.chiSquareResult.pValue < 0.001 ? '< 0.001' : crosstabResult.chiSquareResult.pValue.toLocaleString('id-ID', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white border border-gray-200 font-mono text-gray-600 text-[11px] shadow-2xs" title="Cramér's V (Ukuran Pengaruh)">
                V = {crosstabResult.chiSquareResult.cramerV.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Assumption Warning if any */}
          {crosstabResult.chiSquareResult.warning && (
            <div className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1.5 rounded-lg border border-amber-200/80 flex items-start gap-1.5 mt-1">
              <span className="text-amber-500 mt-0.5">⚠️</span>
              <span>{crosstabResult.chiSquareResult.warning}</span>
            </div>
          )}
        </div>
      )}

      {/* Automatic Interpretation */}
      {insights.length > 0 && <InsightBox insights={insights} />}
    </div>
  )
}
