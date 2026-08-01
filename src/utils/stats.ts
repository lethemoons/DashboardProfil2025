export function descStats(values: number[]) {
  const sorted = [...values].filter(v => !isNaN(v)).sort((a, b) => a - b)
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
  const n = xs.length
  const mx = xs.reduce((s, v) => s + v, 0) / n
  const my = ys.reduce((s, v) => s + v, 0) / n
  const num = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0)
  const den = Math.sqrt(xs.reduce((s, v) => s + (v - mx) ** 2, 0) * ys.reduce((s, v) => s + (v - my) ** 2, 0))
  return den === 0 ? 0 : num / den
}
