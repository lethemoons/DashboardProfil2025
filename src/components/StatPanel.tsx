import { KABUPATEN_LIST } from '../data/kabupaten'

interface Stats {
  n: number; mean: number; median: number; min: number; max: number
  q1: number; q3: number; sd: number
}

interface Props {
  stats: Stats | null
  label?: string
  format?: (v: number) => string
  rightElement?: React.ReactNode
}

export default function StatPanel({ stats, label = 'Nilai', format = v => v.toLocaleString('id-ID', { maximumFractionDigits: 2 }), rightElement }: Props) {
  if (!stats) return null
  const items = [
    { label: 'N', value: stats.n },
    { label: 'Rata-rata', value: format(stats.mean) },
    { label: 'Median', value: format(stats.median) },
    { label: 'Min', value: format(stats.min) },
    { label: 'Maks', value: format(stats.max) },
    { label: 'Q1', value: format(stats.q1) },
    { label: 'Q3', value: format(stats.q3) },
    { label: 'Std Dev', value: format(stats.sd) },
  ]
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statistik Deskriptif — {label}</h4>
        <div className="flex items-center gap-2">
          {rightElement}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map(item => (
          <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">{item.label}</div>
            <div className="text-sm font-semibold text-gray-800" style={{ fontFamily: 'DM Mono, monospace' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
