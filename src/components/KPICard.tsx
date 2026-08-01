import type { ReactNode } from 'react'

interface Props {
  title: string
  value: string | number
  sub?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendVal?: string
  color?: string
}

export default function KPICard({ title, value, sub, icon, trend, trendVal, color = '#0FB0AA' }: Props) {
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#6b7280'
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</div>
        {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      </div>
      {trendVal && (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: trendColor }}>
          <span>{trendIcon}</span>
          <span>{trendVal}</span>
        </div>
      )}
    </div>
  )
}
