import { KABUPATEN_LIST, TAHUN_LIST } from '../data/kabupaten'

interface Props {
  kab: string
  onKab: (v: string) => void
  extraFilters?: React.ReactNode
  kabupaten?: string
  hideKabFilter?: boolean
}

export default function FilterBar({ kab, onKab, extraFilters, hideKabFilter }: Props) {
  if (hideKabFilter && !extraFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mb-2">
      {!hideKabFilter && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Kabupaten/Kota</label>
          <select
            value={kab}
            onChange={e => onKab(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-teal-400 cursor-pointer"
          >
            <option value="all">Semua Kab/Kota</option>
            {KABUPATEN_LIST.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      )}
      {extraFilters}
    </div>
  )
}
