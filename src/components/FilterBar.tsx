import { KABUPATEN_LIST, TAHUN_LIST } from '../data/kabupaten'

interface Props {
  kab: string
  tahun: string
  onKab: (v: string) => void
  onTahun: (v: string) => void
  extraFilters?: React.ReactNode
  kabupaten?: string
  hideKabFilter?: boolean
}

export default function FilterBar({ kab, tahun, onKab, onTahun, extraFilters, hideKabFilter }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
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
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500">Tahun</label>
        <select
          value={tahun}
          onChange={e => onTahun(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 outline-none focus:border-teal-400 cursor-pointer"
        >
          {TAHUN_LIST.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {extraFilters}
      <div className="ml-auto">
        <div className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          Data Provinsi Jawa Timur
        </div>
      </div>
    </div>
  )
}
