import type { ReactNode } from 'react'
import type { TargetEvaluation } from '../utils/targets'
import { useAuth } from '../contexts/AuthContext'

interface Props {
  title: string
  value: ReactNode
  sub?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendVal?: string
  color?: string
  targetData?: TargetEvaluation | { status: 'tercapai' | 'belum_tercapai'; targetLabel: string } | null
  targetText?: string
}

export default function KPICard({ title, value, sub, icon, trend, trendVal, color = '#0F8F8B', targetData, targetText = 'Target' }: Props) {
  const { isAdmin } = useAuth()
  const trendColor = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#6b7280'
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</span>
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</div>
          {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
        </div>
      </div>

      <div className="mt-auto">
        {targetData && isAdmin ? (
          <div className={`pt-3 border-t flex items-center justify-between gap-1 ${targetData.status === 'tercapai' ? 'border-[#0F8F8B]/20' : 'border-[#ef4444]/20'}`}>
            <span className="text-[8px] xl:text-[9px] font-bold uppercase tracking-wide text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis">{targetText}: {targetData.targetLabel}</span>
            <span className={`text-[8px] xl:text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full whitespace-nowrap shrink-0 ${targetData.status === 'tercapai' ? 'bg-[#0F8F8B]/10 text-[#0F8F8B]' : 'bg-[#ef4444]/10 text-[#ef4444]'}`}>
              {targetData.status === 'tercapai' ? 'Tercapai' : 'Belum Tercapai'}
            </span>
          </div>
        ) : trendVal ? (
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-gray-50" style={{ color: trendColor }}>
            <span>{trendIcon}</span>
            <span>{trendVal}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
