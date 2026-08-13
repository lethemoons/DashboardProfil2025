import { useState, useEffect } from 'react'
import sdmJson from '../data/sdm.json'

export type SdmRow = { kabupaten: string; [key: string]: string | number }

const cleanIndicators = [
  "jumlah_dokter",
  "jumlah_dokter_spesialis",
  "jumlah_dokter_sub_spesialis",
  "jumlah_dokter_gigi",
  "jumlah_dokter_gigi_spesialis",
  "jumlah_dokter_gigi_sub_spesialis",
  "jumlah_keperawatan",
  "jumlah_tenaga_kebidanan",
  "jumlah_tenaga_kesehatan_masyarakat",
  "jumlah_tenaga_kesehatan_lingkungan",
  "jumlah_tenaga_gizi",
  "jumlah_tenaga_kefarmasian",
  "jumlah_tenaga_psikologis_klinis",
  "jumlah_tenaga_kesehatan_tradisional",
  "jumlah_tenaga_tehnik_biomedika",
  "jumlah_tenaga_tehnik_keterapian_fisik",
  "jumlah_tenaga_keteknisan_medis"
]

export function clearSdmCache() {
  // Not needed anymore since we are using static JSON
}

export function useSdmData() {
  const [data, setData] = useState<SdmRow[]>([])
  const [indicators, setIndicators] = useState<string[]>(cleanIndicators)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Simulate quick load to keep the UI smooth
      setData(sdmJson)
      setIndicators(cleanIndicators)
      setLoading(false)
    } catch (err: any) {
      setError('Failed to load SDM data')
      setLoading(false)
    }
  }, [])

  return { data, indicators, loading, error }
}
