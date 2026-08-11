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
  return null
}
