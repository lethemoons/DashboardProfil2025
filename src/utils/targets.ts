export type TargetDirection = '>=' | '<=' | '<' | '>' | '=';

export interface TargetConfig {
  indicator_name: string;
  indicator_key: string;
  target_value: number;
  target_unit: string;
  target_direction: TargetDirection;
  isPercentage?: boolean;
}

export interface TargetEvaluation {
  status: 'tercapai' | 'belum_tercapai';
  difference: number;
  text: string;
  targetValue: number;
  targetUnit: string;
  targetLabel: string;
  direction: TargetDirection;
}

export const TARGETS: Record<string, TargetConfig> = {
  // === SDM Kesehatan ===
  rasio_dokter_umum: { indicator_name: 'Rasio Dokter', indicator_key: 'rasio_dokter_umum', target_value: 1, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_dokter_spesialis: { indicator_name: 'Rasio Dokter Spesialis', indicator_key: 'rasio_dokter_spesialis', target_value: 0.20, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_dokter_gigi: { indicator_name: 'Rasio Dokter Gigi', indicator_key: 'rasio_dokter_gigi', target_value: 0.12, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_dokter_gigi_spesialis: { indicator_name: 'Rasio Dokter Gigi Spesialis', indicator_key: 'rasio_dokter_gigi_spesialis', target_value: 0.20, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_perawat: { indicator_name: 'Rasio Tenaga Perawat', indicator_key: 'rasio_perawat', target_value: 2.40, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_bidan: { indicator_name: 'Rasio Tenaga Bidan', indicator_key: 'rasio_bidan', target_value: 2.00, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_kesmas: { indicator_name: 'Rasio Tenaga Kesehatan Masyarakat', indicator_key: 'rasio_kesmas', target_value: 1.00, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_kesling: { indicator_name: 'Rasio Tenaga Kesehatan Lingkungan', indicator_key: 'rasio_kesling', target_value: 0.21, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_gizi: { indicator_name: 'Rasio Tenaga Gizi', indicator_key: 'rasio_gizi', target_value: 0.35, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_kefarmasian: { indicator_name: 'Rasio Tenaga Kefarmasian', indicator_key: 'rasio_kefarmasian', target_value: 1.00, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_teknik_biomedika: { indicator_name: 'Rasio Tenaga Teknik Biomedika', indicator_key: 'rasio_teknik_biomedika', target_value: 0.354, target_unit: 'per 1.000 pddk', target_direction: '>=' },
  rasio_keterapian_fisik: { indicator_name: 'Rasio Tenaga Keterapian Fisik', indicator_key: 'rasio_keterapian_fisik', target_value: 0.15, target_unit: 'per 1.000 pddk', target_direction: '>=' },

  // === Pembiayaan Kesehatan ===
  jkn_cakupan_pct: { indicator_name: 'Cakupan kepesertaan JKN', indicator_key: 'jkn_cakupan_pct', target_value: 98.6, target_unit: '%', target_direction: '>=', isPercentage: true },
  jkn_aktif_pct: { indicator_name: 'Cakupan kepesertaan aktif JKN', indicator_key: 'jkn_aktif_pct', target_value: 80, target_unit: '%', target_direction: '>=', isPercentage: true },

  // === Kesehatan Ibu ===
  aki_angka: { indicator_name: 'Angka Kematian Ibu (AKI)', indicator_key: 'aki_angka', target_value: 100, target_unit: 'per 100.000 KH', target_direction: '<' },
  k6_pct: { indicator_name: 'Pelayanan kesehatan ibu hamil/K6', indicator_key: 'k6_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },
  pf_pct: { indicator_name: 'Pertolongan persalinan oleh nakes', indicator_key: 'pf_pct', target_value: 95, target_unit: '%', target_direction: '>=', isPercentage: true },
  kn_lengkap_pct: { indicator_name: 'Kunjungan Neonatal Lengkap', indicator_key: 'kn_lengkap_pct', target_value: 91, target_unit: '%', target_direction: '>=', isPercentage: true },

  // === Kesehatan Anak dan Gizi ===
  underweight_pct: { indicator_name: 'Prevalensi balita underweight', indicator_key: 'underweight_pct', target_value: 15, target_unit: '%', target_direction: '<=', isPercentage: true },
  stunting_pct: { indicator_name: 'Prevalensi balita stunting', indicator_key: 'stunting_pct', target_value: 18.8, target_unit: '%', target_direction: '<=', isPercentage: true },
  wasting_pct: { indicator_name: 'Prevalensi balita wasting', indicator_key: 'wasting_pct', target_value: 8, target_unit: '%', target_direction: '<=', isPercentage: true },
  imd_pct: { indicator_name: 'Inisiasi Menyusu Dini (IMD)', indicator_key: 'imd_pct', target_value: 73, target_unit: '%', target_direction: '>=', isPercentage: true },
  asi_eksklusif_pct: { indicator_name: 'ASI eksklusif', indicator_key: 'asi_eksklusif_pct', target_value: 61, target_unit: '%', target_direction: '>=', isPercentage: true },
  balita_ditimbang_pct: { indicator_name: 'Balita ditimbang/D-S', indicator_key: 'balita_ditimbang_pct', target_value: 80, target_unit: '%', target_direction: '>=', isPercentage: true },
  vit_a_bayi_pct: { indicator_name: 'Vitamin A bayi usia 6–11 bln', indicator_key: 'vit_a_bayi_pct', target_value: 91, target_unit: '%', target_direction: '>=', isPercentage: true },
  ttd_remaja_putri_pct: { indicator_name: 'Konsumsi TTD remaja putri', indicator_key: 'ttd_remaja_putri_pct', target_value: 65, target_unit: '%', target_direction: '>=', isPercentage: true },
  pkg_sd_pct: { indicator_name: 'PKG siswa SD/MI', indicator_key: 'pkg_sd_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },
  pkg_smp_pct: { indicator_name: 'PKG siswa SMP/MTs', indicator_key: 'pkg_smp_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },
  pkg_sma_pct: { indicator_name: 'PKG siswa SMA/MA', indicator_key: 'pkg_sma_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },
  pkg_dasar_pct: { indicator_name: 'PKG usia pendidikan dasar', indicator_key: 'pkg_dasar_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },

  // === Imunisasi ===
  idl_pct: { indicator_name: 'Imunisasi dasar lengkap', indicator_key: 'idl_pct', target_value: 95, target_unit: '%', target_direction: '>=', isPercentage: true },
  imunisasi_lengkap_14_pct: { indicator_name: 'Imunisasi lengkap 14 antigen', indicator_key: 'imunisasi_lengkap_14_pct', target_value: 77, target_unit: '%', target_direction: '>=', isPercentage: true },
  mr1_pct: { indicator_name: 'Imunisasi MR1 bayi', indicator_key: 'mr1_pct', target_value: 85, target_unit: '%', target_direction: '>=', isPercentage: true },
  antigen_baru_pct: { indicator_name: 'Imunisasi antigen baru', indicator_key: 'antigen_baru_pct', target_value: 81, target_unit: '%', target_direction: '>=', isPercentage: true },
  hpv_kelas5_pct: { indicator_name: 'Imunisasi HPV kelas 5 SD', indicator_key: 'hpv_kelas5_pct', target_value: 98, target_unit: '%', target_direction: '>=', isPercentage: true },
  imunisasi_baduta_pct: { indicator_name: 'Imunisasi lengkap baduta', indicator_key: 'imunisasi_baduta_pct', target_value: 85, target_unit: '%', target_direction: '>=', isPercentage: true },
  imunisasi_sekolah_dasar_pct: { indicator_name: 'Imunisasi lengkap usia sekolah dasar', indicator_key: 'imunisasi_sekolah_dasar_pct', target_value: 96, target_unit: '%', target_direction: '>=', isPercentage: true },
  t2plus_wus_bumil_pct: { indicator_name: 'Status imunisasi T2 Plus WUS/ibu hamil', indicator_key: 't2plus_wus_bumil_pct', target_value: 83, target_unit: '%', target_direction: '>=', isPercentage: true },
  shk_pct: { indicator_name: 'Skrining Hipotiroid Kongenital', indicator_key: 'shk_pct', target_value: 65, target_unit: '%', target_direction: '>=', isPercentage: true },

  // === Pengendalian Penyakit Menular ===
  tbc_penemuan_pct: { indicator_name: 'Penemuan kasus TBC', indicator_key: 'tbc_penemuan_pct', target_value: 90, target_unit: '%', target_direction: '>=', isPercentage: true },
  tbc_tsr_pct: { indicator_name: 'TSR TB Sensitif Obat', indicator_key: 'tbc_tsr_pct', target_value: 90, target_unit: '%', target_direction: '>=', isPercentage: true },
  tbc_tsr_ro_pct: { indicator_name: 'TSR TB Resisten Obat', indicator_key: 'tbc_tsr_ro_pct', target_value: 80, target_unit: '%', target_direction: '>=', isPercentage: true },
  pneumonia_balita_ditemukan_pct: { indicator_name: 'Penemuan pneumonia balita', indicator_key: 'pneumonia_balita_ditemukan_pct', target_value: 75, target_unit: '%', target_direction: '>=', isPercentage: true },
  puskesmas_pneumonia_standar_pct: { indicator_name: 'Puskesmas tatalaksana pneumonia', indicator_key: 'puskesmas_pneumonia_standar_pct', target_value: 60, target_unit: '%', target_direction: '>=', isPercentage: true },
  diare_semua_umur_ditemukan_pct: { indicator_name: 'Penemuan diare semua umur', indicator_key: 'diare_semua_umur_ditemukan_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },
  diare_balita_ditemukan_pct: { indicator_name: 'Penemuan diare balita', indicator_key: 'diare_balita_ditemukan_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },
  diare_balita_standar_pct: { indicator_name: 'Pengobatan diare balita standar', indicator_key: 'diare_balita_standar_pct', target_value: 85, target_unit: '%', target_direction: '>=', isPercentage: true },
  odhiv_arv_pct: { indicator_name: 'ODHIV mendapat ARV', indicator_key: 'odhiv_arv_pct', target_value: 75, target_unit: '%', target_direction: '>=', isPercentage: true },
  hepb_bumil_dd_pct: { indicator_name: 'Deteksi dini Hepatitis B ibu hamil', indicator_key: 'hepb_bumil_dd_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },
  kusta_anak_pct: { indicator_name: 'Kasus kusta anak <15 th', indicator_key: 'kusta_anak_pct', target_value: 5, target_unit: '%', target_direction: '<', isPercentage: true },
  kusta_cacat2_pct: { indicator_name: 'Cacat tingkat 2 kusta', indicator_key: 'kusta_cacat2_pct', target_value: 5, target_unit: '%', target_direction: '<', isPercentage: true },
  kusta_rft_pct: { indicator_name: 'RFT kusta', indicator_key: 'kusta_rft_pct', target_value: 90, target_unit: '%', target_direction: '>=', isPercentage: true },

  // === PD3I ===
  tetanus_neonatorum_rate: { indicator_name: 'Tetanus neonatorum', indicator_key: 'tetanus_neonatorum_rate', target_value: 1, target_unit: 'per 1.000 KH', target_direction: '<' },
  klb_24jam_pct: { indicator_name: 'KLB ditangani <24 jam', indicator_key: 'klb_24jam_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },

  // === Penyakit Tular Vektor ===
  dbd_cfr: { indicator_name: 'CFR DBD', indicator_key: 'dbd_cfr', target_value: 0.5, target_unit: '%', target_direction: '<', isPercentage: true },

  // === Penyakit Tidak Menular ===
  hipertensi_pelayanan_pct: { indicator_name: 'Pelayanan penderita hipertensi', indicator_key: 'hipertensi_pelayanan_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },
  skrining_kanker_rahim_pct: { indicator_name: 'Skrining kanker leher rahim', indicator_key: 'skrining_kanker_rahim_pct', target_value: 75, target_unit: '%', target_direction: '>=', isPercentage: true },
  odgj_pelayanan_pct: { indicator_name: 'Pelayanan ODGJ berat', indicator_key: 'odgj_pelayanan_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },

  // === Kesehatan Lingkungan ===
  sam_memenuhi_syarat_pct: { indicator_name: 'Sarana air minum standar', indicator_key: 'sam_memenuhi_syarat_pct', target_value: 70, target_unit: '%', target_direction: '>=', isPercentage: true },
  tfu_memenuhi_syarat_pct: { indicator_name: 'TFU memenuhi syarat', indicator_key: 'tfu_memenuhi_syarat_pct', target_value: 70, target_unit: '%', target_direction: '>=', isPercentage: true },
  tpp_memenuhi_syarat_pct: { indicator_name: 'TPP memenuhi syarat', indicator_key: 'tpp_memenuhi_syarat_pct', target_value: 70, target_unit: '%', target_direction: '>=', isPercentage: true },
  desa_stop_babs_pct: { indicator_name: 'Pilar 1 STBM - Stop BABS', indicator_key: 'desa_stop_babs_pct', target_value: 100, target_unit: '%', target_direction: '=', isPercentage: true },
  desa_ctps_pct: { indicator_name: 'Pilar 2 STBM - CTPS', indicator_key: 'desa_ctps_pct', target_value: 75, target_unit: '%', target_direction: '>', isPercentage: true },
  desa_pammrt_pct: { indicator_name: 'Pilar 3 STBM - PAMMRT', indicator_key: 'desa_pammrt_pct', target_value: 75, target_unit: '%', target_direction: '>', isPercentage: true },
  desa_psrt_pct: { indicator_name: 'Pilar 4 STBM - PSRT', indicator_key: 'desa_psrt_pct', target_value: 75, target_unit: '%', target_direction: '>', isPercentage: true },
  desa_paldrt_pct: { indicator_name: 'Pilar 5 STBM - PALDRT', indicator_key: 'desa_paldrt_pct', target_value: 30, target_unit: '%', target_direction: '>', isPercentage: true },

  // === ALIASES FOR UI COMPONENTS ===
  persalinan_fasyankes_pct: { indicator_name: 'Pertolongan persalinan oleh nakes', indicator_key: 'persalinan_fasyankes_pct', target_value: 95, target_unit: '%', target_direction: '>=', isPercentage: true },
  gizi_kurang_pct: { indicator_name: 'Prevalensi balita underweight', indicator_key: 'gizi_kurang_pct', target_value: 15, target_unit: '%', target_direction: '<=', isPercentage: true },
  gizi_buruk_pct: { indicator_name: 'Prevalensi balita wasting', indicator_key: 'gizi_buruk_pct', target_value: 8, target_unit: '%', target_direction: '<=', isPercentage: true },
  imunisasi_dasar_lengkap_pct: { indicator_name: 'Imunisasi dasar lengkap', indicator_key: 'imunisasi_dasar_lengkap_pct', target_value: 95, target_unit: '%', target_direction: '>=', isPercentage: true },
  imunisasi_campak_pct: { indicator_name: 'Imunisasi MR1 bayi', indicator_key: 'imunisasi_campak_pct', target_value: 85, target_unit: '%', target_direction: '>=', isPercentage: true },
  vitamin_a_pct: { indicator_name: 'Vitamin A bayi usia 6–11 bln', indicator_key: 'vitamin_a_pct', target_value: 91, target_unit: '%', target_direction: '>=', isPercentage: true },
  imunisasi_dpt_pct: { indicator_name: 'Imunisasi DPT-HB-Hib', indicator_key: 'imunisasi_dpt_pct', target_value: 77, target_unit: '%', target_direction: '>=', isPercentage: true },
  kn1_pct: { indicator_name: 'Kunjungan Neonatus KN1', indicator_key: 'kn1_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },
  k1_pct: { indicator_name: 'Cakupan K1', indicator_key: 'k1_pct', target_value: 100, target_unit: '%', target_direction: '>=', isPercentage: true },
};

export function evaluateTarget(actualValue: number, indicatorKey: string): TargetEvaluation | null {
  const config = TARGETS[indicatorKey];
  if (!config) return null;

  let status: 'tercapai' | 'belum_tercapai' = 'belum_tercapai';
  let diff = Math.abs(actualValue - config.target_value);
  let formattedDiff = Number.isInteger(diff) ? diff.toString() : diff.toFixed(1).replace('.', ',');

  let unitText = config.isPercentage ? 'poin persentase' : config.target_unit;

  if (config.target_direction === '>=') {
    status = actualValue >= config.target_value ? 'tercapai' : 'belum_tercapai';
  } else if (config.target_direction === '<=') {
    status = actualValue <= config.target_value ? 'tercapai' : 'belum_tercapai';
  } else if (config.target_direction === '<') {
    status = actualValue < config.target_value ? 'tercapai' : 'belum_tercapai';
  } else if (config.target_direction === '>') {
    status = actualValue > config.target_value ? 'tercapai' : 'belum_tercapai';
  } else if (config.target_direction === '=') {
    status = actualValue === config.target_value ? 'tercapai' : 'belum_tercapai';
  }

  let text = '';
  if (['>=', '>'].includes(config.target_direction)) {
    if (status === 'tercapai') {
      text = diff === 0 ? `Tepat di batas target` : `${formattedDiff} ${unitText} di atas target`;
    } else {
      text = `${formattedDiff} ${unitText} di bawah target`;
    }
  } else if (['<=', '<'].includes(config.target_direction)) {
    // For <= and < targets
    if (status === 'tercapai') {
      text = diff === 0 ? `Tepat di batas target` : `${formattedDiff} ${unitText} lebih rendah dari batas target`;
    } else {
      text = `${formattedDiff} ${unitText} melebih batas target maksimal`;
    }
  } else if (config.target_direction === '=') {
    if (status === 'tercapai') {
      text = `Tepat di target`;
    } else {
      text = actualValue < config.target_value ? `${formattedDiff} ${unitText} di bawah target` : `${formattedDiff} ${unitText} di atas target`;
    }
  }

  return {
    status,
    difference: diff,
    text,
    targetValue: config.target_value,
    targetUnit: config.target_unit,
    targetLabel: `${config.target_direction} ${config.target_value.toLocaleString('id-ID')}${config.isPercentage ? '%' : ''}`,
    direction: config.target_direction
  };
}
