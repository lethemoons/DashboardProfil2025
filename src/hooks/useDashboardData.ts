import { useState, useEffect } from 'react'
import api from '../services/api'
import { KABUPATEN_LIST } from '../data/kabupaten'

// Shape of the transformed data
export type KabRow = { kabupaten: string; [key: string]: string | number }

type RawDataRow = {
  id: number
  tableNo: number
  no: string
  kabupaten: string
  metric: string
  value: string
}

let dbCache: KabRow[] | null = null
let dbPromise: Promise<KabRow[]> | null = null

export function clearCache() {
  dbCache = null
  dbPromise = null
}

export function useDashboardData() {
  const [data, setData] = useState<KabRow[]>(dbCache || [])
  const [loading, setLoading] = useState(!dbCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dbCache) {
      setData(dbCache)
      setLoading(false)
      return
    }

    let isMounted = true
    const fetchData = async () => {
      try {
        if (!dbPromise) {
          dbPromise = api.get('/data').then(res => {
            const rawData: RawDataRow[] = res.data
            const grouped: Record<string, KabRow> = {}
            
            KABUPATEN_LIST.forEach(k => {
              grouped[k] = { kabupaten: k }
            })

            rawData.forEach(row => {
              if (!row.kabupaten) return
              // Normalize DB name "KAB. PACITAN" -> "Pacitan", "KOTA SURABAYA" -> "Kota Surabaya"
              let normalizedKab = row.kabupaten.trim()
              if (normalizedKab.startsWith('KAB. ')) {
                normalizedKab = normalizedKab.replace('KAB. ', '').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
              } else if (normalizedKab.startsWith('KOTA ')) {
                normalizedKab = 'Kota ' + normalizedKab.replace('KOTA ', '').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
              }

              if (!grouped[normalizedKab]) {
                grouped[normalizedKab] = { kabupaten: normalizedKab }
              }
              const num = Number(row.value)
              grouped[normalizedKab][row.metric] = isNaN(num) ? (row.value ? row.value.trim() : '') : num
            })

            return Object.values(grouped).map(obj => {
              return new Proxy(obj, {
                get(target, prop) {
                  if (typeof prop === 'string') {
                    if (prop in target) return target[prop]
                    
                    // Fuzzy match: if UI asks for 'jumlah_penduduk', find 'jumlah_penduduk_desa_+_kelurahan'
                    const matchedKey = Object.keys(target).find(k => k.includes(prop) || prop.includes(k))
                    if (matchedKey) return target[matchedKey]
                  }
                  
                  // Return 0 for missing fields to prevent NaN math crashes in React components
                  return 0
                }
              })
            })
          })
        }

        const result = await dbPromise
        dbCache = result

        if (isMounted) {
          setData(result)
          setLoading(false)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data')
          setLoading(false)
        }
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  return { data, loading, error }
}

export function useAdminData(page = 1, limit = 50, search = '') {
  const [data, setData] = useState<RawDataRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/admin/data`, { params: { page, limit, search } })
      setData(response.data.data)
      setTotal(response.data.total)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, limit, search])

  return { data, total, loading, error, refetch: fetchData }
}
