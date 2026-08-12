export function descStats(values: number[]) {
  const sorted = [...values].filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b)
  const n = sorted.length
  if (n === 0) return null
  const mean = sorted.reduce((s, v) => s + v, 0) / n
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
  const min = sorted[0]
  const max = sorted[n - 1]
  const q1 = sorted[Math.floor(n / 4)]
  const q3 = sorted[Math.floor((3 * n) / 4)]
  const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n
  const sd = Math.sqrt(variance)
  return { n, mean, median, min, max, q1, q3, sd }
}

export function pearsonR(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n === 0) return 0
  const validPairs: [number, number][] = []
  for (let i = 0; i < n; i++) {
    if (typeof xs[i] === 'number' && !isNaN(xs[i]) && typeof ys[i] === 'number' && !isNaN(ys[i])) {
      validPairs.push([xs[i], ys[i]])
    }
  }
  const count = validPairs.length
  if (count <= 1) return 0
  const mx = validPairs.reduce((s, p) => s + p[0], 0) / count
  const my = validPairs.reduce((s, p) => s + p[1], 0) / count
  const num = validPairs.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0)
  const den = Math.sqrt(
    validPairs.reduce((s, p) => s + (p[0] - mx) ** 2, 0) *
    validPairs.reduce((s, p) => s + (p[1] - my) ** 2, 0)
  )
  return den === 0 ? 0 : num / den
}

// ==========================================
// STATISTICAL INFERENCE FOR CROSSTAB & CHI-SQ
// ==========================================

function logGamma(z: number): number {
  const g = 7
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ]
  if (z < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z)
  }
  z -= 1
  let x = p[0]
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i)
  }
  const t = z + g + 0.5
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x)
}

function gammp(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0
  if (x === 0) return 0
  if (x < a + 1) {
    let sum = 1 / a
    let term = 1 / a
    for (let n = 1; n < 1000; n++) {
      term *= x / (a + n)
      sum += term
      if (Math.abs(term) < Math.abs(sum) * 1e-12) break
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a))
  } else {
    return 1 - gammq(a, x)
  }
}

function gammq(a: number, x: number): number {
  if (x < 0 || a <= 0) return 1
  if (x === 0) return 1
  if (x < a + 1) {
    return 1 - gammp(a, x)
  } else {
    let b = x + 1 - a
    let c = 1 / 1e-30
    let d = 1 / b
    let h = d
    for (let i = 1; i < 1000; i++) {
      const an = -i * (i - a)
      b += 2
      d = an * d + b
      if (Math.abs(d) < 1e-30) d = 1e-30
      c = b + an / c
      if (Math.abs(c) < 1e-30) c = 1e-30
      d = 1 / d
      const del = d * c
      h *= del
      if (Math.abs(del - 1) < 1e-12) break
    }
    return Math.exp(-x + a * Math.log(x) - logGamma(a)) * h
  }
}

export function chiSquarePValue(chiSq: number, df: number): number {
  if (chiSq <= 0 || df <= 0 || isNaN(chiSq) || isNaN(df)) return 1
  const p = gammq(df / 2, chiSq / 2)
  return Math.min(1, Math.max(0, isNaN(p) ? 1 : p))
}

export interface ChiSquareResult {
  chiSquare: number
  df: number
  pValue: number
  isSignificant: boolean
  hasLowExpectedCounts: boolean
  lowExpectedCountPct: number
  warning?: string
  expectedMatrix: number[][]
  cramerV: number
}

export function calculateChiSquare(observedMatrix: number[][]): ChiSquareResult {
  const r = observedMatrix.length
  const c = observedMatrix[0]?.length || 0

  if (r < 2 || c < 2) {
    return {
      chiSquare: 0,
      df: 0,
      pValue: 1,
      isSignificant: false,
      hasLowExpectedCounts: false,
      lowExpectedCountPct: 0,
      warning: 'Tabel kontingensi minimal membutuhkan 2 baris dan 2 kolom.',
      expectedMatrix: [],
      cramerV: 0
    }
  }

  const rowTotals = observedMatrix.map(row => row.reduce((s, v) => s + v, 0))
  const colTotals: number[] = Array(c).fill(0)
  for (let j = 0; j < c; j++) {
    for (let i = 0; i < r; i++) {
      colTotals[j] += observedMatrix[i][j]
    }
  }
  const grandTotal = rowTotals.reduce((s, v) => s + v, 0)

  if (grandTotal === 0) {
    return {
      chiSquare: 0,
      df: 0,
      pValue: 1,
      isSignificant: false,
      hasLowExpectedCounts: false,
      lowExpectedCountPct: 0,
      warning: 'Jumlah data tidak mencukupi untuk uji statistik.',
      expectedMatrix: [],
      cramerV: 0
    }
  }

  const expectedMatrix: number[][] = []
  let chiSquare = 0
  let lowExpectedCount = 0
  const totalCells = r * c

  for (let i = 0; i < r; i++) {
    expectedMatrix[i] = []
    for (let j = 0; j < c; j++) {
      const exp = (rowTotals[i] * colTotals[j]) / grandTotal
      expectedMatrix[i][j] = exp
      if (exp < 5) lowExpectedCount++
      if (exp > 0) {
        chiSquare += (observedMatrix[i][j] - exp) ** 2 / exp
      }
    }
  }

  const df = (r - 1) * (c - 1)
  const pValue = chiSquarePValue(chiSquare, df)
  const isSignificant = pValue < 0.05
  const lowExpectedCountPct = (lowExpectedCount / totalCells) * 100
  const hasLowExpectedCounts = lowExpectedCountPct > 20

  let warning: string | undefined = undefined
  if (hasLowExpectedCounts) {
    warning = `${lowExpectedCountPct.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}% sel memiliki frekuensi harapan (expected count) < 5. Asumsi uji Chi-Square tidak terpenuhi secara ideal, interpretasikan hasil dengan hati-hati.`
  }

  // Cramér's V for effect size
  const minDim = Math.min(r - 1, c - 1)
  const cramerV = minDim > 0 && grandTotal > 0 ? Math.sqrt(chiSquare / (grandTotal * minDim)) : 0

  return {
    chiSquare,
    df,
    pValue,
    isSignificant,
    hasLowExpectedCounts,
    lowExpectedCountPct,
    warning,
    expectedMatrix,
    cramerV: Math.min(1, cramerV)
  }
}

// ==========================================
// BINNING & CATEGORIZATION FOR CROSSTAB
// ==========================================

export type BinningMethod = 'quantile' | 'equal_width'

export interface BinnedCategory {
  key: string
  label: string
  shortLabel: string
  min: number
  max: number
}

function formatNum(v: number): string {
  if (Math.abs(v) >= 1e6) return (v / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' juta'
  if (Math.abs(v) >= 1e3 && Number.isInteger(v)) return v.toLocaleString('id-ID')
  if (Number.isInteger(v)) return v.toString()
  return v >= 100 ? v.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : v >= 10 ? v.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : v.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function categorizeVariable(
  values: (number | string | null | undefined)[],
  numBins: number = 3,
  method: BinningMethod = 'quantile'
): {
  isCategorical: boolean
  categories: BinnedCategory[]
  categorize: (val: any) => string
} {
  // Check if inherently non-numeric categorical
  const nonNulls = values.filter(v => v !== null && v !== undefined && v !== '')
  const numericValues: number[] = []
  const stringValues: string[] = []

  nonNulls.forEach(v => {
    const num = Number(v)
    if (typeof v === 'number' && !isNaN(v)) {
      numericValues.push(v)
    } else if (typeof v === 'string' && !isNaN(num) && v.trim() !== '') {
      numericValues.push(num)
    } else if (typeof v === 'string') {
      stringValues.push(v.trim())
    }
  })

  // If string categories dominate or unique numeric <= 4 and integer-like
  const uniqueNumerics = Array.from(new Set(numericValues)).sort((a, b) => a - b)
  if (stringValues.length > numericValues.length || (uniqueNumerics.length <= 4 && uniqueNumerics.every(n => Number.isInteger(n) && n >= 0 && n <= 10))) {
    // Treat as naturally categorical
    const uniqueCats = Array.from(new Set(nonNulls.map(v => String(v).trim()))).sort()
    const categories: BinnedCategory[] = uniqueCats.map(cat => ({
      key: cat,
      label: cat,
      shortLabel: cat,
      min: 0,
      max: 0
    }))
    return {
      isCategorical: true,
      categories,
      categorize: (val: any) => val !== null && val !== undefined && val !== '' ? String(val).trim() : 'Lainnya'
    }
  }

  // Continuous numeric variable: perform binning
  const sorted = [...numericValues].sort((a, b) => a - b)
  const n = sorted.length

  if (n === 0) {
    return {
      isCategorical: false,
      categories: [{ key: 'Data Kosong', label: 'Data Kosong', shortLabel: 'Kosong', min: 0, max: 0 }],
      categorize: () => 'Data Kosong'
    }
  }

  const min = sorted[0]
  const max = sorted[n - 1]

  // If all values are identical
  if (min === max) {
    const label = `Tetap (${formatNum(min)})`
    return {
      isCategorical: false,
      categories: [{ key: label, label, shortLabel: 'Tetap', min, max }],
      categorize: () => label
    }
  }

  const k = Math.min(numBins, Math.max(2, uniqueNumerics.length))
  const categories: BinnedCategory[] = []
  const cutoffs: number[] = []

  const standardLabels = k === 2
    ? ['Rendah', 'Tinggi']
    : k === 3
      ? ['Rendah', 'Sedang', 'Tinggi']
      : k === 4
        ? ['Sangat Rendah (Q1)', 'Rendah (Q2)', 'Tinggi (Q3)', 'Sangat Tinggi (Q4)']
        : Array.from({ length: k }, (_, i) => `Grup ${i + 1}`)

  const shortLabels = k === 2
    ? ['Rendah', 'Tinggi']
    : k === 3
      ? ['Rendah', 'Sedang', 'Tinggi']
      : k === 4
        ? ['Q1', 'Q2', 'Q3', 'Q4']
        : Array.from({ length: k }, (_, i) => `Grup ${i + 1}`)

  if (method === 'quantile') {
    for (let i = 1; i < k; i++) {
      const idx = Math.floor((i * n) / k)
      cutoffs.push(sorted[idx])
    }
  } else {
    // Equal width
    const step = (max - min) / k
    for (let i = 1; i < k; i++) {
      cutoffs.push(min + i * step)
    }
  }

  // Build clean interval categories
  for (let i = 0; i < k; i++) {
    const binMin = i === 0 ? min : cutoffs[i - 1]
    const binMax = i === k - 1 ? max : cutoffs[i]
    const shortL = shortLabels[i]
    let desc = ''
    if (k === 3) {
      if (i === 0) desc = `≤ ${formatNum(binMax)}`
      else if (i === k - 1) desc = `> ${formatNum(binMin)}`
      else desc = `${formatNum(binMin)} – ${formatNum(binMax)}`
    } else {
      desc = `${formatNum(binMin)} – ${formatNum(binMax)}`
    }
    const fullLabel = `${shortL} (${desc})`
    categories.push({
      key: fullLabel,
      label: fullLabel,
      shortLabel: shortL,
      min: binMin,
      max: binMax
    })
  }

  const categorize = (val: any): string => {
    const num = Number(val)
    if (isNaN(num) || val === null || val === undefined || val === '') return categories[0].label
    for (let i = 0; i < cutoffs.length; i++) {
      if (num <= cutoffs[i]) {
        return categories[i].label
      }
    }
    return categories[categories.length - 1].label
  }

  return {
    isCategorical: false,
    categories,
    categorize
  }
}

/**
 * Calculates a dynamic domain max value with proportional padding.
 * @param dataMax The maximum value found in the data.
 * @param isPercentage Whether the indicator is explicitly a percentage.
 * @returns A nicely rounded maximum value with 5-10% padding.
 */
export const getDynamicDomain = (dataMax, isPercentage = false) => {
  if (dataMax == null || !isFinite(dataMax) || dataMax <= 0) return isPercentage ? 100 : 10;
  
  if (isPercentage) {
    if (dataMax <= 20) return 25;
    if (dataMax <= 45) return 50;
    if (dataMax <= 70) return 75;
    if (dataMax <= 90) return 95;
    return 100;
  }
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(dataMax)));
  const padded = dataMax * 1.1; // 10% padding
  const normalized = padded / magnitude;
  
  let rounded = 10;
  if (normalized <= 1.2) rounded = 1.2;
  else if (normalized <= 1.5) rounded = 1.5;
  else if (normalized <= 2) rounded = 2;
  else if (normalized <= 2.5) rounded = 2.5;
  else if (normalized <= 3) rounded = 3;
  else if (normalized <= 4) rounded = 4;
  else if (normalized <= 5) rounded = 5;
  else if (normalized <= 6) rounded = 6;
  else if (normalized <= 8) rounded = 8;
  else rounded = 10;
  
  const result = rounded * magnitude;
  return result >= 10 ? Math.ceil(result) : Number(result.toFixed(2));
};
