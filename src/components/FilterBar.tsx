import { ReactNode } from 'react'

interface Props {
  kab?: string
  onKab?: (v: string) => void
  extraFilters?: ReactNode
  kabupaten?: string
  hideKabFilter?: boolean
}

export default function FilterBar({ extraFilters }: Props) {
  if (!extraFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-2">
      {extraFilters}
    </div>
  )
}
