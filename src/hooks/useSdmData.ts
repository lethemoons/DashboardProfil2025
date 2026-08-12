import { useState, useEffect } from 'react'
import api from '../services/api'
import { KABUPATEN_LIST } from '../data/kabupaten'

export type SdmRow = { kabupaten: string; [key: string]: string | number }

type RawDataRow = {
  id: number
  tableNo: number
  no: string
  kabupaten: string
  metric: string
  value: string
}

let dbCache: SdmRow[] | null = null
let indicatorsCache: string[] = []
let dbPromise: Promise<{ data: SdmRow[], indicators: string[] }> | null = null

export function clearSdmCache() {
  dbCache = null
  indicatorsCache = []
  dbPromise = null
}

export function useSdmData() {
  const [data, setData] = useState<SdmRow[]>(dbCache || [])
  const [indicators, setIndicators] = useState<string[]>(indicatorsCache)
  const [loading, setLoading] = useState(!dbCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dbCache) {
      setData(dbCache)
      setIndicators(indicatorsCache)
      setLoading(false)
      return
    }

    let isMounted = true
    const fetchData = async () => {
      try {
        if (!dbPromise) {
          dbPromise = api.get('/data').then(res => {
            const rawData: RawDataRow[] = res.data
            const grouped: Record<string, SdmRow> = {}
            const indSet = new Set<string>()
            
            KABUPATEN_LIST.forEach(k => {
              grouped[k] = { kabupaten: k }
            })

            rawData.forEach(row => {
              if (!row.kabupaten) return
              if (row.tableNo < 13 || row.tableNo > 18) return

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
              if (!isNaN(num) && row.value.trim() !== '') {
                grouped[normalizedKab][row.metric] = num
                if (!row.metric.toUpperCase().includes('PUSKESMAS')) {
                  indSet.add(row.metric)
                }
              }
            })

            const finalData = Object.values(grouped).map(obj => {
              return new Proxy(obj, {
                get(target, prop) {
                  if (typeof prop === 'string' && prop in target) {
                    return target[prop]
                  }
                  if (typeof prop === 'string' && prop !== 'kabupaten') return 0
                  return target[prop as keyof typeof target]
                }
              })
            })

            return {
              data: finalData,
              indicators: Array.from(indSet).sort()
            }
          })
        }

        const result = await dbPromise
        dbCache = result.data
        indicatorsCache = result.indicators

        if (isMounted) {
          setData(result.data)
          setIndicators(result.indicators)
          setLoading(false)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch SDM data')
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => { isMounted = false }
  }, [])

  return { data, indicators, loading, error }
}
