import { useState, useRef, useEffect } from 'react'

interface Col { key: string; label: string; format?: (v: any) => string }
interface Props {
  data: Record<string, any>[]
  columns: Col[]
  pageSize?: number
  searchPlaceholder?: string
  initialVisibleKeys?: string[]
}

export default function DataTable({ data, columns, pageSize = 10, searchPlaceholder = 'Cari kabupaten/kota…', initialVisibleKeys }: Props) {
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [search, setSearch] = useState('')
  
  // Column visibility state
  const [visibleKeys, setVisibleKeys] = useState<string[]>(initialVisibleKeys || columns.map(c => c.key))
  const [showColMenu, setShowColMenu] = useState(false)
  const colMenuRef = useRef<HTMLDivElement>(null)

  // Sync initialVisibleKeys if it changes externally
  useEffect(() => {
    if (initialVisibleKeys) {
      setVisibleKeys(prev => {
        // Only override if the parent explicitly provides a different set, 
        // to allow dynamic changes when analysis indicator changes.
        return initialVisibleKeys;
      });
    }
  }, [initialVisibleKeys]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleColumn = (key: string) => {
    setVisibleKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const exportCSV = () => {
    const headers = visibleCols.map(c => c.label).join(',')
    const rows = sorted.map(row => 
      visibleCols.map(c => {
        const val = c.format ? c.format(row[c.key]) : row[c.key] ?? '-'
        return `"${String(val).replace(/"/g, '""')}"`
      }).join(',')
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'export_data.csv'
    link.click()
  }

  const visibleCols = columns.filter(c => visibleKeys.includes(c.key))

  const filtered = search ? data.filter(row => {
    const searchTarget = row.kabupaten ?? row.name ?? row[columns[0].key] ?? ''
    return searchTarget.toString().toLowerCase().includes(search.toLowerCase())
  }) : data

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey]
        if (typeof av === 'number' && typeof bv === 'number')
          return sortDir === 'asc' ? av - bv : bv - av
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
    : filtered

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <input
          className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 w-52 outline-none focus:border-teal-400"
          placeholder={searchPlaceholder}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400 mr-2">{filtered.length} baris</span>
          
          <div className="relative" ref={colMenuRef}>
            <button 
              onClick={() => setShowColMenu(!showColMenu)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-400 text-gray-600 transition-colors flex items-center gap-1 bg-white"
            >
              Pilih Kolom <span>▼</span>
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-2 w-64 max-h-60 overflow-y-auto bg-white border border-gray-100 shadow-xl rounded-xl z-50 p-2 flex flex-col gap-1">
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer text-xs text-gray-700">
                    <input type="checkbox" checked={visibleKeys.includes(col.key)} onChange={() => toggleColumn(col.key)} className="accent-teal-500" />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button onClick={exportCSV} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-teal-400 text-gray-600 transition-colors bg-white">
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-gray-500 font-semibold sticky left-0 z-10 bg-gray-50 border-r border-gray-100">#</th>
              {visibleCols.map((col, idx) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-gray-500 font-semibold cursor-pointer select-none hover:text-teal-600 whitespace-nowrap ${idx === 0 && col.key === 'kabupaten' ? 'sticky left-10 z-10 bg-gray-50 border-r border-gray-100' : ''}`}
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr key={i} className="border-t border-gray-50 hover:bg-teal-50/30 transition-colors">
                <td className="px-4 py-2.5 text-gray-400 font-mono sticky left-0 z-10 bg-white border-r border-gray-50">{page * pageSize + i + 1}</td>
                {visibleCols.map((col, idx) => (
                  <td key={col.key} className={`px-4 py-2.5 text-gray-700 font-medium whitespace-nowrap ${idx === 0 && col.key === 'kabupaten' ? 'sticky left-10 z-10 bg-white border-r border-gray-50' : ''}`}>
                    {col.format ? col.format(row[col.key]) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-teal-400 transition-colors">← Prev</button>
          <span className="text-xs text-gray-400">Halaman {page + 1} / {totalPages}</span>
          <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-teal-400 transition-colors">Next →</button>
        </div>
      )}
    </div>
  )
}
