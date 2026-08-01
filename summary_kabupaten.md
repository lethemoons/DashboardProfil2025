# Kabupaten-Level Dataset — Profil Kesehatan 2025

## Overview

- **Source:** `14072026_Lampiran Profil Kesehatan 2025 FIX.xlsx`
- **Scope:** 76 numbered sheets parsed, 38 kabupaten/kota each
- **Region:** Provinsi Jawa Timur, Tahun 2025
- **Total rows:** 47,913 metric-value rows in combined format

## File Layout

```
kabupaten/
├── tabel_01.csv ... tabel_88.csv     ← 76 wide-format per-table CSVs
└── kabupaten_all.csv                 ← 1 long-format combined CSV
```

### Wide format (`tabel_XX.csv`)
- Rows = kabupaten/kota (usually 38)
- Columns = `no`, `kabupaten`, `metric_name_1`, `metric_name_2`, ...
- Each CSV is self-contained — load only the tables you need

### Long format (`kabupaten_all.csv`)
- Rows = metric values across all tables (47,913 rows)
- Columns: `table_no`, `no`, `kabupaten`, `metric`, `value`
- Best for cross-table queries and programmatic dashboards

## Quick Start

```python
import pandas as pd

# Load specific table
df = pd.read_csv('kabupaten/tabel_01.csv')  # luas wilayah, demografi

# Load combined data
all_data = pd.read_csv('kabupaten_kabupaten_all.csv')
hitungan_dbd = all_data[all_data['metric'].str.contains('dbd', case=False)]

# Join with province indicators
# Use profil_kesehatan_2025.csv: source_table → tabel_XX.csv
```

## Run Command

```bash
uv run --with openpyxl --with pandas python3 scripts/parse_kabupaten.py
```

---

## Table Catalog

### Section I — GAMBARAN UMUM (indicators 1–8)

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 1 | Luas wilayah, desa, kepadatan | 38 | 8 | `luas_wilayah_km2`, `jumlah_penduduk`, `kepadatan_penduduk_per_km2` |

### Section II — SARANA KESEHATAN (indicators 9–28)

| Table | Topic | Rows | Cols | Notes |
|-------|-------|------|------|-------|
| 5 | Kunjungan rawat jalan/inap per fasyankes | 380 | 14 | Multi-section (puskesmas, klinik, RS). Cols use `.1` suffix for duplicates |
| 6 | GDR/NDR RS | 38 | 15 | `jumlah_pasien_keluar_hidup` (L/P/L+P), `gdr`, `ndr` |
| 7 | BOR, BTO, TOI, ALOS | 38 | 11 | `bor`, `bto`, `toi`, `alos` |
| 11 | Ketersediaan obat esensial & vaksin | 38 | 4 | `ketersediaan_obat_esensial`, `ketersediaan_vaksin_irl` |
| 12 | Posyandu | 38 | 6 | `aktif_jumlah`, `aktif`, `tidak_aktif` |

### Section III — SDM KESEHATAN (indicators 29–45)

| Table | Topic | Rows | Cols | Notes |
|-------|-------|------|------|-------|
| 13 | Dokter | 114 | 28 | **Multi-section** (Puskesmas/RS/Sarana Lain = 3×38). See "Multi-Section Tables" below |
| 14 | Keperawatan & kebidanan | 114 | 4 | Multi-section |
| 15 | Kesehatan masyarakat, lingkungan, gizi | 114 | 9 | Multi-section |
| 16 | Kefarmasian, psikologis, tradisional | 114 | 9 | Multi-section |
| 17 | Teknik biomedika, keterapian fisik, medis | 114 | 9 | Multi-section |
| 18 | Tenaga penunjang kesehatan | 190 | 12 | **Multi-section** (5 sections × 38) |

**Key columns in tables 13–17:**
- `l_puskesmas`, `p_puskesmas`, `l+p_puskesmas` → L/P/L+P count at Puskesmas level
- `.1`, `.2` suffixes → next section (RS), then Sarana Lain
- *Note: the higher-level category (e.g., DOKTER, DOKTER SPESIALIS) is lost — column names only show `l_puskesmas`, not `dokter_l_puskesmas`. Cross-reference with original sheet if needed.*

### Section IV — PEMBIAYAAN KESEHATAN (indicators 46–49)

| Table | Topic | Rows | Cols | Notes |
|-------|-------|------|------|-------|
| 20 | Anggaran kesehatan per kab/kota | 38 | 3 | Columns are years: `2023`, `2024`, `2025` |

### Section V — KESEHATAN KELUARGA (indicators 50–95)

**V.1 Kesehatan Ibu (50–63):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 22 | Kelahiran hidup & mati | 38 | 14 | `hidup_40`, `mati_50`, `hidup_+_mati_60` |
| 24 | Kematian ibu | 38 | 5 | `jumlah_kematian_ibu_hamil`, `bersalin`, `nifas` |
| 25 | Penyebab kematian ibu | 38 | 9 | `hipertensi_dalam_kehamilan`, `perdarahan_obstetrik` |
| 26 | K1, K6, persalinan fasyankes | 38 | 15 | `k1`, `k6`, `persalinan_di_fasyankes` |
| 27 | Imunisasi Td2+ | 38 | 14 | `td1`, `td2`, `td3`, `td4`, `td2+` |
| 28 | Tablet tambah darah | 38 | 10 | `suplementasi_gizi_ibu_hamil` |
| 29 | Peserta KB aktif modern | 38 | 28 | Per metode: `kondom`, `suntik`, `pil`, `akdr`, `implan`, `mop`, `mow` |
| 30 | PUS 4T | 38 | 10 | `pus_4t`, `pus_alki`, `menggunakan_kb` |
| 31 | KB pasca persalinan | 38 | 20 | Per metode KB pasca bersalin |
| 32 | Komplikasi kebidanan | 38 | 19 | `anemia`, `kek`, `infeksi`, `diabetes_melitus` |
| 33 | Bumil komplikasi ditangani | 38 | 16 | Columns have numeric names (`3`, `l_40`, `p_50`) |

**V.2 Kesehatan Anak (64–92):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 35 | Kematian neonatal, bayi, balita | 38 | 22 | `bayi_50`, `anak_balita_60`, `jumlah_total_70` |
| 36 | Penyebab kematian neonatal | 38 | 14 | `malformasi_kongenital`, `trauma_kelahiran`, `infeksi` |
| 37 | Penyebab kematian bayi/balita | 38 | 14 | `diare`, `pneumonia`, `kelainan_kongenital_jantung` |
| 38 | Bayi baru lahir ditimbang & BBLR | 38 | 22 | Cols `l`, `p`, `l_+p` for each sub-indicator |
| 39 | Kunjungan neonatus (KN1, KN lengkap) | 38 | 22 | Same structure as 38 |
| 40 | ASI eksklusif | 38 | 7 | `mendapat_imd`, `diberi_asi_eksklusif` |
| 41 | Cakupan imunisasi (Campak, DPT, Polio) | 38 | 37 | Very wide. Per vaccine by L/P/L+P |
| 42 | Dropout imunisasi | 38 | 37 | Wide. Similar structure to 41 |
| 43 | Imunisasi campak/rubela & dasar lengkap | 38 | 28 | `l`, `p`, `l+p` columns with `.1` suffixes by vaccine |
| 44 | Cakupan imunisasi lanjutan | 38 | 22 | Numeric column names (`3`, `l_40`, `p_50`) |
| 45 | Imunisasi anak sekolah | 38 | 16 | Per vaccine type |
| 46 | Vitamin A (bayi & balita) | 38 | 10 | `mendapat_vit_a`, `mendapat_vit_a.1` |
| 47 | Buku KIA & pantau tumbuh kembang | 38 | 14 | `balita_memiliki_buku_kia`, `balita_dipantau` |
| 48 | Balita ditimbang (D/S) | 38 | 14 | `d_s_l`, `d_s_p`, `d_s_l+p` |
| 49 | Gizi kurang & gizi buruk (BB/TB) | 38 | 18 | `balita_gizi_kurang`, `balita_gizi_buruk` |
| 50 | Pemeriksaan kesehatan gratis SD/SMP/SMA | 38 | 25 | `sd_mi`, `smp_mts`, `sma_ma` per class |
| 51 | Imunisasi HPV & anak sekolah | 38 | 43 | Very wide, many `.1` suffixes |
| 52 | Kesehatan gigi mulut | 38 | 8 | `tumpatan_gigi`, `pencabutan_gigi`, `rasio` |
| 53 | Kesehatan gigi mulut (anak SD) | 38 | 19 | Numeric column names (`3`, `4`, `l_90`, `p_100`) |

**V.3 Usia Produktif & Lanjut (93–95):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 54 | Pelayanan usia produktif | 38 | 12 | `lakilaki`, `perempuan`, `lakilaki_+_perempuan` |
| 55 | Catin mendapat layanan kesehatan | 38 | 16 | `lakilaki`, `perempuan`, with `.1` suffixes |
| 56 | Pelayanan usila (60+) | 38 | 8 | `l_40`, `p_50`, `l+p_60` |
| 57 | Puskesmas dengan kelas ibu balita | 38 | 8 | Binary (puskesmas count) |
| 58 | Kelas ibu hamil | 38 | 5 | `ibu_hamil_mengikuti_kelas_ibu_hamil` |

### Section VI — PENGENDALIAN PENYAKIT (indicators 96–142)

**VI.1 Penyakit Menular Langsung (96–119):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 59 | TBC (terduga, kasus, kontak) | 38 | 11 | `jumlah_semua_kasus_tuberkulosis`, `kontak_serumah_tpt` |
| 60 | TBC pengobatan (lengkap, sukses, mati) | 38 | 27 | `l`, `p`, `l_+_p` with `.1` suffixes per outcome |
| 61 | Pneumonia balita | 38 | 17 | `jumlah_kunjungan`, `tatalaksana_standar`, `pneumonia_l` |
| 63 | ODHIV baru & ARV | 38 | 4 | `odhiv_baru_ditemukan`, `mendapat_pengobatan_arv` |
| 64 | Diare (semua umur & balita) | 38 | 14 | `semua_umur`, `balita` |
| 65 | Hepatitis ibu hamil | 38 | 7 | `diperiksa_reaktif`, `diperiksa_non_reaktif` |
| 66 | Hepatitis bayi dari bumil reaktif | 38 | 8 | `24_jam`, `total` |
| 67 | Kusta (PB+MB kasus baru) | 38 | 10 | `pausi_basiler_pb`, `multi_basiler_mb` |
| 68 | Cacat kusta (tingkat 0, 1, 2) | 38 | 12 | `cacat_tingkat_0`, `cacat_tingkat_1`, `cacat_tingkat_2` |
| 69 | Prevalensi kusta | 38 | 10 | Per kategori: `anak`, `dewasa`, `total` |
| 70 | RFT kusta (PB & MB) | 38 | 7 | `rft_rate_pb`, `rft_rate_mb` |

**VI.2 Imunisasi & PD3I (120–129):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 71 | AFP rate | 38 | 3 | `jumlah_kasus_afp_non_polio` |
| 72 | Difteri, pertusis, tetanus, campak per kab | 38 | 18 | `jumlah_kasus_l`, `jumlah_kasus_p`, `meninggal_l+p` |
| 73 | KLB ditangani <24 jam | 38 | 4 | `klb_ditangani_24_jam` |

**VI.3 Penyakit Tular Vektor (130–135):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 75 | DBD (incidence rate & CFR) | 38 | 10 | `jumlah_kasus_l+p`, `cfr_l+p` |
| 76 | Malaria (suspek, lab, positif) | 38 | 15 | `positif_l+p`, `pengobatan_standar` |
| 77 | Filariasis kronis | 38 | 16 | `kasus_kronis_baru_ditemukan`, `meninggal` |

**VI.4 Penyakit Tidak Menular (136–142):**

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 78 | Hipertensi | 38 | 10 | `lakilaki`, `perempuan`, `lakilaki_+_perempuan` |
| 79 | Diabetes Melitus | 38 | 6 | `terdiagnosis_dm`, `penyandang_dm_terkendali` |
| 80 | Kanker (IVA, SADANIS, USG) | 38 | 27 | Numeric column names. Cross-reference with original sheet 80 |
| 81 | Gangguan jiwa berat | 38 | 13 | `skizofrenia`, `psikotik_akut` per age group |

### Section VII — KESEHATAN LINGKUNGAN (indicators 143–150)

| Table | Topic | Rows | Cols | Key Columns |
|-------|-------|------|------|-------------|
| 82 | Sarana air minum | 38 | 8 | `perusahaan_daerah_air_minum`, `sarana_air_minum_memenuhi_syarat` |
| 83 | Air minum rumah tangga | 38 | 4 | `rumah_tangga_dengan_kualitas_air_minum_memenuhi_syarat` |
| 84 | Akses sanitasi | 38 | 18 | `akses_sanitasi_aman`, `layak_bersama`, `babs_tertutup` |
| 85 | Stop BABS & 5 Pilar STBM | 38 | 14 | `kk_stop_babs_sbs`, `desa_kelurahan_5_pilar_stbm` |
| 86 | TFU (Tempat Fasilitas Umum) | 38 | 37 | Very wide. Numeric column names |
| 87 | TPP (Tempat Pengelolaan Pangan) | 38 | 25 | `sd_mi`, `smp_mts`, `sma_ma` |
| 88 | Kualitas udara dalam ruang | 38 | 8 | `ms_130`, `tms_140` (memenuhi/tidak syarat) |

---

## Multi-Section Tables

Tables 13–18 have data organized by facility type within each kabupaten:

| Table | Sections | Rows |
|-------|----------|------|
| 13 (Dokter) | Puskesmas / RS / Sarana Lain | 38 × 3 = 114 |
| 14 (Keperawatan) | Puskesmas / RS / Sarana Lain | 38 × 3 = 114 |
| 15 (Kesmas) | Puskesmas / RS / Sarana Lain | 38 × 3 = 114 |
| 16 (Kefarmasian) | Puskesmas / RS / Sarana Lain | 38 × 3 = 114 |
| 17 (Teknik) | Puskesmas / RS / Sarana Lain | 38 × 3 = 114 |
| 18 (Penunjang) | 5 facility types | 38 × 5 = 190 |

**Structure:**
- First 38 rows: Puskesmas section
- Next 38 rows: RS section
- Next 38 rows: Sarana Lain section (table 18 has 2 more)

**How to filter by section:**
```python
df = pd.read_csv('kabupaten/tabel_13.csv')
puskesmas = df.iloc[0:38]  # rows 0-37
rs = df.iloc[38:76]        # rows 38-75
sarana_lain = df.iloc[76:114]  # rows 76-113
```

**Column names in multi-section tables:**
- Column names like `l_puskesmas` apply to the Puskesmas section
- `.1` suffix names (e.g., `l_puskesmas.1`) = RS section
- `.2` suffix = Sarana Lain section
- The higher-level category (DOKTER, DOKTER SPESIALIS, etc.) is NOT reflected in column names — only the facility type is

Table 5 (Kunjungan) also has 380 rows = 10 section × 38 rows. Sections include Puskesmas, RS, Klinik, and more.

---

## Column Name Quirks

### Problem: Duplicate names → `.1`, `.2` suffixes
When `merge_headers` produces identical column names for different columns, pandas auto-renames them:

```
l_puskesmas → for Puskesmas section (original)
l_puskesmas.1 → for RS section
l_puskesmas.2 → for Sarana Lain section
```

**Fix in dashboard code:**
```python
df = pd.read_csv('tabel_13.csv')
# Rename to meaningful names
cols = list(df.columns)
cols = ['no', 'kabupaten'] + [f'dokter_{c}' for c in cols[2:]]  # example
df.columns = cols
```

### Problem: Missing header text → `col_2`, `col_3`, numeric names
Some cells in the original header rows are empty, so auto-generated names fall back to `col_2`, `col_3`, or numbers like `3`, `5`, `jumlah_60`.

**These columns typically represent:**
| Generic name | Likely meaning |
|-------------|----------------|
| `col_2` | Number of puskesmas in kab |
| `col_3` | Target population / denominator |
| `col_4` | Count of target sub-group |
| `3`, `4`, `5` | Index or sub-header numbers |
| `jumlah_60`, `jumlah_80` | "Jumlah" (total) for column group at that position |

**For numeric column names, cross-reference with the original xlsx sheet header rows 7–9:**

```python
# Quick sanity: read original headers
import openpyxl
wb = openpyxl.load_workbook('14072026_Lampiran Profil Kesehatan 2025 FIX.xlsx', read_only=True, data_only=True)
ws = wb['35']  # table number
for row in ws.iter_rows(min_row=7, max_row=10, max_col=10, values_only=True):
    print([v for v in row])
```

---

## Known Issues

### Data quality (from original xlsx)

| Table | Issue | Impact |
|-------|-------|--------|
| 13 | Text values 'Row Labels', 'Grand Total' in `l_puskesmas.9` column | ~5 cells with non-numeric pivot table labels |
| 13 | 'L', 'P' gender labels in `l_puskesmas.10`–`.11` columns | Section label bleed from pivot table |
| 35–37 | 5 cells with Indonesian notes like "tidak sama jumlahnya dengan kab" | Notes in original data — not numeric |
| 58 | 1 cell = "sk bupati" | Note about regulation |
| 74 | "NIHIL" in `20_10` column | Means "no data" in original |
| 84 | 1 cell with note about data discrepancy | Original xlsx note |

### Parsing limitations

| Table | Issue | Cause |
|-------|-------|-------|
| 13–17 | Column names lost higher-level category (e.g., `l_puskesmas` not `dokter_l_puskesmas`) | Section header ("PUSKESMAS") overwrote parent header ("DOKTER") in forward-fill |
| 5 | `.1`–`.12` suffix explosion across sections | 10 facility sections with same column pattern |
| 35, 50, 53, 80, 86, 87 | Numeric column names from empty header cells | Original headers had gaps or numeric-only cells |
| All | `no` column is float (`1.0` not `1`) | openpyxl data_only mode returns floats |

### `#VALUE!` and `#DIV/0!`
Both are converted to `null`/`None` in CSVs. The combined CSV excludes them.

---

## Skipped Tables

| Sheet | Reason |
|-------|--------|
| 2 | Penduduk by age group — province only, no kab rows |
| 3 | Melek huruf by education level — province only |
| 4 | Fasilitas by ownership — province only (Kemenkes, Swasta, etc.) |
| 8 | 10 penyakit terbanyak rawat jalan — province level ranking |
| 9 | 10 penyakit terbanyak rawat inap — province level ranking |
| 10 | 10 penyakit terbanyak kematian RS — province level |
| 19 | Cakupan JKN — 1 row province total only |
| 21 | Penduduk per kecamatan — per-kecamatan level, not per-kab |
| 23 | Kematian ibu per kecamatan — per-kecamatan level |
| 34 | Hipertensi 15+ — province only summary |
| 62 | Kasus HIV per kelompok umur — province only, no kab breakdown |
| 74 (partial) | Outbreak events — per-event data, not structured per-kab. 9/38 kab have data |

---

## Cross-Reference: Table → Indicator

For the full mapping of which indicators map to which tables, see `summary.md` → "Table Reference Map" section.

Quick summary:
- `tabel_01` → indicators 1, 2, 4, 5 (demografi)
- `tabel_13` → indicators 29–34 (dokter)
- `tabel_20` → indicators 47–49 (anggaran)
- `tabel_35` → indicators 64–69 (kematian anak)
- `tabel_59` → indicators 96–98 (TBC)
- `tabel_75` → indicators 130–131 (DBD)

For dashboard building, combine `kabupaten_all.csv` with `profil_kesehatan_2025.csv` using `table_no` = `source_table`.
