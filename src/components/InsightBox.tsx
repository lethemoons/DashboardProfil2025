import { ReactNode } from 'react'

interface Props {
  insights?: string[]
  children?: ReactNode
}

function renderFormattedText(text: string): ReactNode {
  if (!text.includes('**')) {
    return text
  }

  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

export default function InsightBox({ insights, children }: Props) {
  if ((!insights || insights.length === 0) && !children) return null
  
  return (
    <div className="bg-[#F5FBFB] rounded-xl p-5 border border-[#CCEEED] text-sm text-gray-700 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#0F8F8B] text-white flex items-center justify-center font-serif text-[13px] font-bold">i</div>
        <span className="text-[#0F8F8B] font-bold text-sm tracking-wide">INSIGHT OTOMATIS</span>
      </div>
      <div className="flex items-start gap-2 ml-1">
        <div className="w-1.5 h-1.5 rounded-full bg-[#0F8F8B] mt-1.5 flex-shrink-0" />
        <div className="leading-relaxed w-full">
          {children}
          {insights && insights.length > 0 && (
            <ul className="space-y-1 mt-1">
              {insights.map((ins, i) => (
                <li key={i} className="text-gray-700 flex gap-2">
                  <span className="text-[#0F8F8B] mt-0.5 shrink-0">•</span>
                  <span>{renderFormattedText(ins)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
