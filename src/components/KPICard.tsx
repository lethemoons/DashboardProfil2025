import type { ReactNode } from 'react'
import type { TargetEvaluation } from '../utils/targets'

interface Props {
  title: string
  value: string | number
  sub?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendVal?: string
  color?: string
  targetData?: TargetEvaluation | null
}

export default function KPICard({ title, value, sub, icon, trend, trendVal, color = '#0F8F8B', targetData }: Props) {
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
      {targetData ? (
        <div className={`mt-1 pt-3 border-t flex flex-col gap-2 ${targetData.status === 'tercapai' ? 'border-[#0F8F8B]/20' : 'border-[#ef4444]/20'}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Target: {targetData.targetLabel}</span>
          <div className="flex">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap ${targetData.status === 'tercapai' ? 'bg-[#0F8F8B]/10 text-[#0F8F8B]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
              {targetData.status === 'tercapai' ? 'Tercapai' : 'Belum Tercapai'}
            </span>
          </div>
        </div>
      ) : trendVal ? (
        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: trendColor }}>
          <span>{trendIcon}</span>
          <span>{trendVal}</span>
        </div>
      ) : null}
    </div>
  )
}
