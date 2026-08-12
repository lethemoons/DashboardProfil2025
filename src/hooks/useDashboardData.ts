import { useState, useEffect } from 'react'
import api from '../services/api'
import { KABUPATEN_LIST } from '../data/kabupaten'
import { useFilter } from '../contexts/FilterContext'

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

// ============================================================
// TABLE_METRIC_ALIASES: maps "tableNo_metricKeyFromCSV" -> "cleanUIKey"
// This allows all dashboard pages to use clean key names while
// the raw CSV/DB stores verbose or ambiguous metric names.
// ============================================================
const TABLE_METRIC_ALIASES: Record<string, string> = {
  // === TABLE 6: GDR / NDR ===
  '6_gross_death_rate_l_+_p':   'gdr',
  '6_net_death_rate_l_+_p':     'ndr',

  // === TABLE 7: Indikator RS (BOR, BTO, TOI, ALOS) ===
  '7_tahun_2025_bor':           'bor',
  '7_tahun_2025_bto_kali':      'bto',
  '7_tahun_2025_toi_hari':      'toi',
  '7_tahun_2025_alos_hari':     'alos',

  // === TABLE 24: Kematian Ibu ===
  '24_jumlah_kematian_ibu_hamil_50':    'kematian_ibu_hamil',
  '24_jumlah_kematian_ibu_bersalin_60': 'kematian_ibu_bersalin',
  '24_jumlah_kematian_ibu_nifas_70':    'kematian_ibu_nifas',

  // === TABLE 26: K1, K6, Persalinan di Fasyankes ===
  '26_k1':                          'k1_pct',
  '26_k6':                          'k6_pct',
  '26_persalinan_di_fasyankes':     'persalinan_fasyankes_pct',

  // === TABLE 27: Imunisasi TD Ibu Hamil ===
  '27_td2+':                        'td2plus_pct',

  // === TABLE 28: Tablet Tambah Darah / Suplementasi Gizi ===
  // metric 'suplementasi_gizi' appears twice (bumil & remaja), first is bumil
  '28_suplementasi_gizi_1':         'fe_tablet_pct',

  // === TABLE 29: Peserta KB Aktif ===
  '29_jumlah_peserta_kb_aktif_metode_modern_jumlah': 'kb_aktif_jumlah',
  '29_jumlah_peserta_kb_aktif_metode_modern':        'kb_aktif_pct',

  // === TABLE 32: Ibu Hamil KEK ===
  '32_kurang_energi_kronis_kek':    'bumil_kek_pct',

  // === TABLE 35: Kematian Neonatal / Bayi / Balita ===
  '35_jumlah_total_150':            'kematian_neonatal',
  '35_bayi_170':                    'kematian_bayi',
  '35_jumlah_total_210':            'kematian_balita_total',
  '35_anak_balita_180':             'kematian_balita',

  // === TABLE 38: Bayi Lahir Ditimbang & BBLR ===
  // l_+_p_1 = total lahir L+P, l_+_p_2 = ditimbang %, l_+_p_3 = BBLR %
  '38_l_+_p_3':                     'bblr_pct',

  // === TABLE 39: Kunjungan Neonatus (KN) ===
  // l_+_p_1 = total lahir, l_+_p_2 = KN1 %, l_+_p_3 = KN Lengkap %
  '39_l_+_p_2':                     'kn1_pct',
  '39_l_+_p_3':                     'kn_lengkap_pct',

  // === TABLE 40: ASI Eksklusif ===
  '40_diberi_asi_eksklusif':        'asi_eksklusif_pct',

  // === TABLE 43: Imunisasi Bayi ===
  // l_+_p_1 = DPT-HB-Hib %, l_+_p_2 = campak/rubela %, l_+_p_3 = imunisasi dasar lengkap %
  '43_l_+_p_1':                     'imunisasi_dpt_pct',
  '43_l_+_p_2':                     'imunisasi_campak_pct',
  '43_l_+_p_3':                     'imunisasi_dasar_lengkap_pct',

  // === TABLE 46: Vitamin A ===
  // mendapat_vit_a_1 = bayi 6-11bln %, mendapat_vit_a_2 = balita 12-59bln %, mendapat_vit_a_3 = total
  '46_mendapat_vit_a_2':            'vitamin_a_pct',

  // === TABLE 49: Status Gizi Balita ===
  '49_balita_pendek_tb_u':                    'stunting_pct',
  '49_balita_gizi_kurang_bb_tb_2_sd_3_sd':    'gizi_kurang_pct',
  '49_balita_gizi_buruk_bb_tb_3_sd':          'gizi_buruk_pct',

  // === TABLE 54: Usia Produktif ===
  '54_lakilaki':                    'produktif_laki',
  '54_perempuan':                   'produktif_perempuan',

  // === TABLE 55: Calon Pengantin (Catin) ===
  '55_lakilaki':                    'catin_laki',
  '55_perempuan':                   'catin_perempuan',

  // === TABLE 56: Pelayanan Kesehatan Lansia (60+) ===
  '56_l+p_110':                     'lansia_dilayani',

  // === TABLE 59: Tuberkulosis ===
  '59_jumlah_semua_kasus_tuberkulosis_lakilaki_+_perempuan': 'tbc_kasus',

  // === TABLE 60: Treatment Success Rate TBC ===
  '60_lakilaki_jumlah':             'tbc_sukses_jumlah',
  '60_lakilaki_+_perempuan':        'tbc_sukses_pct',
  '60_lakilaki_+_perempuan_2':      'tbc_pengobatan_lengkap_pct',

  // === TABLE 61: Pneumonia Balita ===
  '61_jumlah_l_+_p':                'pneumonia_balita',
  '61_persentase_yang_diberikan_tatalaksana_standar_1': 'pneumonia_standar_pct',

  // === TABLE 63: HIV / ODHIV ===
  '63_tahun_2025_odhiv_baru_ditemukan':                          'odhiv_baru',
  '63_tahun_2025_odhiv_baru_ditemukan_dan_mendapat_pengobatan_arv': 'odhiv_arv_jumlah',
  '63_tahun_2025_persentase_odhiv_baru_mendapat_pengobatan_arv': 'arv_pct',

  // === TABLE 64: Diare ===
  '64_semua_umur_jumlah':           'diare_semua_umur',
  '64_semua_umur_jumlah_2':         'diare_semua_umur_oralit',
  '64_balita_jumlah':               'diare_balita',
  '64_balita_jumlah_2':             'diare_balita_oralit',
  '64_balita_jumlah_3':             'diare_balita_zinc',

  // === TABLE 65: Hepatitis B pada Bumil ===
  '65_jumlah_ibu_hamil_diperiksa_reaktif': 'hepatitis_bumil_reaktif',
  '65_bumil_reaktif_total':               'hepatitis_bumil_reaktif_pct',

  // === TABLE 67: Kusta ===
  '67_pausi_basiler_pb_kusta_kering_l+p': 'kusta_pb',
  '67_multi_basiler_mb_kusta_basah_l+p':  'kusta_mb',

  // === TABLE 71: AFP ===
  '71_tahun_2025_jumlah_kasus_afp_non_polio': 'afp_kasus',

  // === TABLE 72: Penyakit PD3I ===
  '72_jumlah_kasus_l+p_1':          'difteri_kasus',
  '72_meninggal_l+p_3':             'pertusis_kasus',
  '72_meninggal_l+p_4':             'campak_suspek_kasus',

  // === TABLE 73: Kejadian Luar Biasa (KLB) ===
  '73_klb_di_desa_kelurahan':        'klb_24jam_pct',

  // === TABLE 75: Demam Berdarah Dengue (DBD) ===
  '75_jumlah_kasus_l+p':             'dbd_kasus',
  '75_cfr_l+p':                      'dbd_cfr',

  // === TABLE 76: Malaria ===
  '76_suspek':                       'malaria_suspek',
  '76_positif_l+p':                  'malaria_positif',
  '76_meninggal_l+p':                'malaria_meninggal',

  // === TABLE 77: Filariasis ===
  '77_jumlah_seluruh_kasus_kronis_l+p': 'filariasis_kronis',

  // === TABLE 78: Hipertensi ===
  '78_lakilaki_1':                   'hipertensi_laki',
  '78_perempuan_1':                  'hipertensi_perempuan',

  // === TABLE 79: Diabetes Melitus ===
  '79_terdiagnosis_dm_jumlah':       'dm_terdiagnosis',
  '79_penyandang_dm_terkendali':     'dm_terkendali_pct',

  // === TABLE 81: Gangguan Jiwa ===
  '81_skizofrenia_15_59_th':         'jiwa_skizofrenia',
  '81_psikotik_akut_15_59_th':       'jiwa_psikotik',

  // === TABLE 82: Kualitas Air Minum ===
  '82_sarana_air_minum_yang_diawasi_dan_diperiksa_kualitas_air_minumnya_minimal_e_coli':
    'air_minum_memenuhi_syarat_pct',

  // === TABLE 84: Akses Sanitasi ===
  '84_jumlah_kk_pengguna_1':         'sanitasi_aman_pct',

  // === TABLE 85: Stop BABS / STBM ===
  '85_kk_stop_babs_sbs':             'stop_babs_kk_pct',
  '85_desa_kelurahan_5_pilar_stbm_jumlah': 'stbm_5pilar_jumlah',

  // === TABLE 87: Tempat Pengelolaan Pangan (TPP) ===
  '87_60':                           'tpp_memenuhi_syarat_pct',

  // === TABLE 88: Kualitas Udara ===
  '88_9':                            'kualitas_udara_ms_pct',
}

let dbCache4: Record<number, KabRow[]> = {}
let dbPromise4: Record<number, Promise<KabRow[]>> = {}

export function clearCache() {
  dbCache4 = {}
  dbPromise4 = {}
}

export function useDashboardData() {
  const { year } = useFilter()
  const [data, setData] = useState<KabRow[]>(dbCache4[year] || [])
  const [loading, setLoading] = useState(!dbCache4[year])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (dbCache4[year]) {
      setData(dbCache4[year])
      setLoading(false)
      return
    }

    setLoading(true)
    let isMounted = true
    const fetchData = async () => {
      try {
        if (!dbPromise4[year]) {
          dbPromise4[year] = api.get('/data', { params: { year } }).then(res => {
            const rawData: RawDataRow[] = res.data
            const grouped: Record<string, KabRow> = {}
            
            KABUPATEN_LIST.forEach(k => {
              grouped[k] = { kabupaten: k }
            })

            // Track occurrence count per (kabupaten, tableNo, metric) for de-duplication
            const metricCounter: Record<string, number> = {}

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

              const counterKey = `${normalizedKab}_${row.tableNo}_${row.metric}`
              metricCounter[counterKey] = (metricCounter[counterKey] || 0) + 1
              const count = metricCounter[counterKey]

              const rawKey = row.metric
              const tableKey = `${row.tableNo}_${rawKey}`
              const tableKeyWithCount = `${row.tableNo}_${rawKey}_${count}`

              // Check alias: first try with count suffix, then without
              const alias = TABLE_METRIC_ALIASES[tableKeyWithCount] || TABLE_METRIC_ALIASES[tableKey]
              const storeKey = alias || rawKey

              const num = Number(row.value)
              const storeVal = isNaN(num) ? (row.value ? row.value.trim() : '') : num

              if (grouped[normalizedKab][storeKey] === undefined) {
                grouped[normalizedKab][storeKey] = storeVal
              }
              // Also store with count suffix for raw access (e.g. 'l_+_p_2')
              if (!alias) {
                grouped[normalizedKab][`${rawKey}_${count}`] = storeVal
              }
            })

            return Object.values(grouped).map(obj => {
              return new Proxy(obj, {
                get(target, prop) {
                  if (typeof prop === 'string') {
                    if (prop in target) return target[prop]
                    
                    // Fuzzy match: if UI asks for 'jumlah_penduduk', find 'jumlah_penduduk_desa_+_kelurahan'
                    const matchedKey = Object.keys(target).find(k => k.includes(prop))
                    if (matchedKey) return target[matchedKey]
                  }
                  
                  // Return 0 for missing fields to prevent NaN math crashes in React components
                  return 0
                }
              })
            })
          })
        }

        const result = await dbPromise4[year]
        dbCache4[year] = result

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
  }, [year])

  return { data, loading, error }
}

export function useAdminData(page = 1, limit = 50, search = '') {
  const { year } = useFilter()
  const [data, setData] = useState<RawDataRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get(`/admin/data`, { params: { page, limit, search, year } })
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
  }, [page, limit, search, year])

  return { data, total, loading, error, refetch: fetchData }
}
