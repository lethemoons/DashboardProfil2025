import { useState, useRef } from 'react'
import { useAdminData } from '../hooks/useDashboardData'
import api from '../services/api'
import { useFilter } from '../contexts/FilterContext'

export default function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { year, refreshYears } = useFilter()
  const [page, setPage] = useState(1)
  const limit = 50
  const [search, setSearch] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [importYear, setImportYear] = useState(new Date().getFullYear())
  const [showUploadForm, setShowUploadForm] = useState(false)
  
  const { data, total, loading, error, refetch } = useAdminData(page, limit, search)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setPage(1)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await api.delete(`/admin/data/${id}`)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete')
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get(`/admin/export?year=${year}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `export_${year}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
    } catch (err: any) {
      alert('Failed to export data')
    }
  }

  const handleDeleteYear = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL data for the year ${year}? This action cannot be undone.`)) return
    try {
      await api.delete(`/admin/data/year/${year}`)
      alert(`Data for year ${year} deleted successfully`)
      refetch()
    } catch (err: any) {
      alert(err.message || 'Failed to delete data for year')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    const isExcel = file.name.endsWith('.xlsx')
    setUploadingExcel(isExcel)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('year', importYear.toString())
    
    try {
      const endpoint = file.name.endsWith('.xlsx') ? '/admin/import-excel' : '/admin/import';
      const timeoutMs = file.name.endsWith('.xlsx') ? 120000 : 30000;
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: timeoutMs,
      })
      alert('Import successful')
      refetch()
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.response?.data?.error || err.message || 'Import failed'
      alert(`Import gagal: ${detail}`)
    } finally {
      setIsUploading(false)
      setUploadingExcel(false)
      if (fileInput.current) fileInput.current.value = ''
      await refreshYears()
      setShowUploadForm(false)
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-end gap-3 mb-4 shrink-0">
        <button onClick={handleExport} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium bg-white text-gray-700 shadow-sm transition-colors">
          Unduh Data ({year})
        </button>
        
        {!showUploadForm ? (
          <button 
            onClick={() => setShowUploadForm(true)}
            className="px-4 py-2 bg-[#0F8F8B] hover:bg-[#0da09a] text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
          >
            Unggah Data
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-xl shadow-sm">
            <input type="file" accept=".csv, .xlsx" ref={fileInput} className="hidden" onChange={handleImport} />
            <div className="flex items-center gap-1.5 px-2 text-sm text-gray-600 font-medium">
              Tahun:
              <input
                type="number"
                value={importYear}
                onChange={e => setImportYear(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0F8F8B] bg-white"
                title="Tahun data yang akan diunggah"
              />
            </div>
            <button 
              onClick={() => fileInput.current?.click()} 
              disabled={isUploading}
              className="px-3 py-1.5 bg-[#0F8F8B] hover:bg-[#0da09a] text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
              title={`Akan menimpa (overwrite) data tahun ${importYear}`}
            >
              {isUploading 
                ? (uploadingExcel ? 'Memproses Excel... (30-60 detik)' : 'Mengunggah...')
                : 'Pilih & Unggah File'}
            </button>
            <button 
              onClick={() => setShowUploadForm(false)}
              className="px-3 py-1.5 border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 rounded text-sm font-medium transition-colors"
            >
              Batal
            </button>
          </div>
        )}
        <button 
          onClick={handleDeleteYear} 
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
          title={`Hapus semua data tahun ${year}`}
        >
          Hapus Data ({year})
        </button>
        <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium border border-red-100">
          Logout
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b shrink-0">
            <input
              type="text"
              placeholder="Search kabupaten or metric..."
              value={search}
              onChange={handleSearch}
              className="w-full max-w-sm px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F8F8B]"
            />
          </div>
          
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading data...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-900 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Table No</th>
                    <th className="px-6 py-3 font-medium">No</th>
                    <th className="px-6 py-3 font-medium">Kabupaten</th>
                    <th className="px-6 py-3 font-medium">Metric</th>
                    <th className="px-6 py-3 font-medium">Value</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3">{row.id}</td>
                      <td className="px-6 py-3">{row.tableNo}</td>
                      <td className="px-6 py-3">{row.no}</td>
                      <td className="px-6 py-3">{row.kabupaten}</td>
                      <td className="px-6 py-3">{row.metric}</td>
                      <td className="px-6 py-3 font-medium">{row.value}</td>
                      <td className="px-6 py-3 text-right space-x-2">
                        <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No data found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="p-4 border-t flex items-center justify-between bg-gray-50 text-sm">
            <div>
              Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page * limit >= total} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}
