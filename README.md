# Dashboard Profil Kesehatan Provinsi Jawa Timur 2025

**Dashboard interaktif** berbasis web untuk memvisualisasikan, menganalisis, dan memperbarui data Profil Kesehatan Provinsi Jawa Timur secara tahunan.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Struktur Proyek](#-struktur-proyek)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Cara Menjalankan Lokal](#-cara-menjalankan-lokal)
- [Panduan Admin: Update Data Tahunan](#-panduan-admin-update-data-tahunan)
- [Panduan Pengembangan Lanjutan](#-panduan-pengembangan-lanjutan)
- [Struktur Data](#-struktur-data)
- [Daftar Halaman & Komponen](#-daftar-halaman--komponen)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| **Dashboard Multi-Bab** | 12+ bab analisis kesehatan sesuai struktur Profil Kesehatan Kemenkes |
| **Peta Choropleth** | Peta sebaran data per kabupaten/kota se-Jawa Timur |
| **Peta Klaster Risiko** | Pemetaan klaster risiko otomatis berbasis algoritma K-Means |
| **Grafik Dinamis** | Grafik batang, area, scatter plot, dan ranking yang interaktif |
| **Insight Otomatis** | Penjelasan data yang dilengkapi implikasi dan sebab-akibat untuk pembaca awam |
| **Crosstab Analysis** | Analisis tabulasi silang antar variabel |
| **Statistik Deskriptif** | Panel ringkasan (mean, median, standar deviasi, min, maks) |
| **Admin Dashboard** | Antarmuka manajemen data lengkap (upload, edit, hapus, export) |
| **Import Data Tahunan** | Mendukung upload file CSV long format **maupun file Excel mentah** (`.xlsx`) |
| **Export Data** | Unduh data ke format CSV |
| **Autentikasi Admin** | Login dengan JWT token |

---

## 📁 Struktur Proyek

```
DashboardProfil2025/
│
├── src/                          # Kode frontend (React + Vite)
│   ├── pages/                    # Halaman-halaman dashboard
│   │   ├── Beranda.tsx           # Halaman utama / landing page
│   │   ├── GambaranUmum.tsx      # Bab 1: Gambaran Umum
│   │   ├── SaranaKesehatan.tsx   # Bab 2: Sarana Kesehatan
│   │   ├── SDMKesehatan.tsx      # Bab 3: SDM Kesehatan
│   │   ├── AksesMutu.tsx         # Bab 4: Akses & Mutu Pelayanan
│   │   ├── UKBM.tsx              # Bab 4: UKBM
│   │   ├── KesehatanKeluarga.tsx # Bab 5: Kesehatan Keluarga
│   │   ├── KesehatanIbu.tsx      # Bab 5.1: Kesehatan Ibu
│   │   ├── KesehatanAnak.tsx     # Bab 5.2: Kesehatan Anak
│   │   ├── UsiaProduktifLansia.tsx # Bab 5.3: Usia Produktif & Lansia
│   │   ├── PembiayaanKesehatan.tsx # Bab 6: Pembiayaan
│   │   ├── KesehatanLingkungan.tsx # Bab 7: Kesehatan Lingkungan
│   │   ├── PengendalianPenyakit.tsx # Bab 8: Pengendalian Penyakit
│   │   ├── PenyakitMenular.tsx   # Bab 8: Penyakit Menular Langsung
│   │   ├── TularVektor.tsx       # Bab 8: Tular Vektor & Zoonotik
│   │   ├── PD3I.tsx              # Bab 8: PD3I
│   │   ├── PenyakitTidakMenular.tsx # Bab 8: PTM
│   │   ├── AdminDashboard.tsx    # Panel Admin
│   │   └── AdminLogin.tsx        # Halaman Login Admin
│   │
│   ├── components/               # Komponen UI yang dapat dipakai ulang
│   │   ├── ChoroplethMap.tsx     # Peta sebaran choropleth
│   │   ├── RiskClusteringMap.tsx # Peta klaster risiko K-Means
│   │   ├── CrosstabSection.tsx   # Analisis crosstab
│   │   ├── DataTable.tsx         # Tabel data sortable & searchable
│   │   ├── RankChart.tsx         # Grafik ranking kabupaten/kota
│   │   ├── InsightBox.tsx        # Kotak insight otomatis
│   │   ├── KPICard.tsx           # Kartu KPI ringkasan
│   │   ├── StatPanel.tsx         # Panel statistik deskriptif
│   │   ├── DynamicAnalysis.tsx   # Analisis dinamis multi-variabel
│   │   └── FilterBar.tsx         # Filter global
│   │
│   ├── contexts/
│   │   └── FilterContext.tsx     # State management filter tahun & kabupaten
│   ├── hooks/
│   │   └── useDashboardData.ts   # Custom hook untuk fetch data dari API
│   ├── services/
│   │   └── api.ts                # Konfigurasi Axios untuk komunikasi backend
│   └── data/                     # Data statis (GeoJSON peta, dll)
│
├── backend/                      # Kode backend (Node.js + Express)
│   ├── src/
│   │   ├── server.ts             # Server utama Express + semua API route
│   │   └── seed.ts               # Script untuk mengisi data awal ke database
│   ├── prisma/
│   │   └── schema.prisma         # Skema database (SQLite)
│   ├── database/
│   │   └── dev.db                # File database SQLite
│   ├── uploads/                  # Folder sementara file upload (auto-dibuat)
│   └── parse_excel.py            # Script Python parser Excel → CSV
│
├── parse_kabupaten.py            # Script Python parser Excel (versi manual)
├── kabupaten_all.csv             # Data CSV long-format yang sudah di-parse
└── README.md                     # Dokumentasi ini
```

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS v4** (styling)
- **Recharts** (grafik dan visualisasi)
- **D3-Geo** + **TopoJSON** (peta choropleth)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express**
- **TypeScript** (via `ts-node`)
- **Prisma ORM** + **SQLite** (database)
- **JWT** (autentikasi)
- **Multer** (file upload)
- **Python 3** + **openpyxl** (parsing Excel)

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- **Node.js** >= 18
- **Python** >= 3.9
- **pnpm** (opsional, bisa juga `npm`)
- Python package: `openpyxl`
  ```bash
  pip install openpyxl
  ```

### 1. Clone Repositori
```bash
git clone https://github.com/lethemoons/DashboardProfil2025.git
cd DashboardProfil2025
```

### 2. Install Dependensi Frontend
```bash
npm install
```

### 3. Install Dependensi Backend
```bash
cd backend
npm install
cd ..
```

### 4. Setup Database
```bash
cd backend
npx prisma generate
npx prisma db push
npm run seed   # Mengisi data awal & akun admin default
cd ..
```

> **Akun Admin Default:** username `admin`, password `admin123`  
> (Ganti password segera setelah login pertama kali!)

### 5. Jalankan Frontend dan Backend

Buka **dua terminal terpisah**:

**Terminal 1 — Frontend:**
```bash
npm run dev
# Berjalan di http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev
# Berjalan di http://localhost:3000
```

---

## 🔄 Panduan Admin: Update Data Tahunan

Ada **dua cara** untuk memperbarui data dashboard dengan data Profil Kesehatan tahun baru.

---

### Cara 1: Upload File Excel Mentah (Direkomendasikan ✅)

> Format file: Lampiran Profil Kesehatan Kemenkes (Excel `.xlsx`) — **tidak perlu diproses manual**.

1. Login ke dashboard sebagai **Admin** → `/admin`
2. Klik tombol **Unggah Data**
3. Atur **Tahun** ke tahun baru (misal: 2026)
4. Klik **Pilih & Unggah File** → pilih file `.xlsx` dari Lampiran Profil Kesehatan
5. Tunggu ~30–60 detik (tombol akan menampilkan *"Memproses Excel..."*)
6. Muncul notifikasi **"Import successful"** → data berhasil masuk

**Catatan penting:**
- File Excel harus memiliki struktur yang **sama** dengan Lampiran Profil Kesehatan Kemenkes (sheet bernomor 1–88)
- Sheet yang hanya berisi data provinsi (sheet 2,3,4,9,10,19,21,34,62) akan otomatis dilewati
- Data lama untuk tahun yang sama akan **tertimpa (overwrite)** secara otomatis

---

### Cara 2: Upload CSV Long-Format (Manual)

Jika Anda perlu melakukan parsing secara manual terlebih dahulu:

1. Jalankan script parser:
   ```bash
   python parse_kabupaten.py
   # Output: file kabupaten_all.csv
   ```

2. Login ke Admin Dashboard → klik **Unggah Data**
3. Atur tahun → pilih file **`kabupaten_all.csv`**
4. Tunggu upload selesai

---

### Format CSV yang Didukung

File CSV harus berformat **long-format** dengan kolom berikut:

```
table_no,no,kabupaten,metric,value
1,1.0,KAB. PACITAN,jumlah_penduduk,630827
1,1.0,KAB. PACITAN,kepadatan_penduduk_per_km2,128
...
```

| Kolom | Keterangan |
|---|---|
| `table_no` | Nomor tabel dari buku profil (integer) |
| `no` | Nomor urut kabupaten di tabel |
| `kabupaten` | Nama kabupaten/kota (contoh: `KAB. PACITAN`, `KOTA SURABAYA`) |
| `metric` | Nama variabel/indikator (snake_case) |
| `value` | Nilai numerik atau string |

---

## 💻 Panduan Pengembangan Lanjutan

### Menambahkan Halaman Baru

1. Buat file baru di `src/pages/NamaHalaman.tsx`
2. Gunakan komponen yang sudah tersedia (lihat bagian [Komponen UI](#komponen-ui))
3. Daftarkan halaman di `src/App.tsx` pada routing dan sidebar

**Template dasar halaman:**
```tsx
import { useMemo } from 'react'
import { useFilter } from '../contexts/FilterContext'
import { useDashboardData } from '../hooks/useDashboardData'
import InsightBox from '../components/InsightBox'
import KPICard from '../components/KPICard'
import DataTable from '../components/DataTable'

export default function NamaHalaman() {
  const { year, kabupaten } = useFilter()
  const { data, loading, error } = useDashboardData()

  const filteredData = useMemo(() => {
    // filter data sesuai variabel yang dibutuhkan
    // contoh: data yang table_no === 1
  }, [data, year, kabupaten])

  if (loading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="..." value="..." icon="📊" color="#0F8F8B" />
      </div>

      {/* Insight */}
      <InsightBox insights={['Insight pertama...', 'Insight kedua...']} />

      {/* Tabel */}
      <DataTable
        data={filteredData}
        columns={[
          { key: 'kabupaten', label: 'Kabupaten/Kota' },
          { key: 'nilai', label: 'Nilai', format: v => v?.toFixed(1) },
        ]}
      />
    </div>
  )
}
```

---

### Komponen UI

| Komponen | Kegunaan | Props Penting |
|---|---|---|
| `<KPICard>` | Kartu ringkasan angka tunggal | `title`, `value`, `icon`, `color` |
| `<InsightBox>` | Kotak narasi otomatis | `insights: string[]` |
| `<StatPanel>` | Panel statistik deskriptif | `stats`, `label`, `format` |
| `<DataTable>` | Tabel sortable + searchable | `data`, `columns` |
| `<RankChart>` | Grafik ranking horizontal | `data`, `dataKey`, `label` |
| `<ChoroplethMap>` | Peta sebaran choropleth | `data`, `valueKey`, `label` |
| `<RiskClusteringMap>` | Peta klaster risiko K-Means | `data`, `variables` |
| `<CrosstabSection>` | Tabulasi silang dua variabel | `data`, `variables` |
| `<DynamicAnalysis>` | Analisis multi-variabel dinamis | `data`, `variables` |

---

### Menambahkan Variabel/Metrik Baru

Variabel baru secara otomatis tersedia jika data sudah ada di database dengan `metric` yang sesuai. Untuk menampilkannya di halaman:

```tsx
// Contoh: menampilkan metrik baru "angka_bebas_jentik"
const myData = useMemo(() =>
  data
    .filter(d => d.metric === 'angka_bebas_jentik')
    .map(d => ({
      kabupaten: d.kabupaten,
      nilai: parseFloat(d.value)
    })),
  [data]
)
```

---

### Struktur API Backend

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Login admin |
| `GET` | `/api/data?year=2025` | Public | Ambil semua data |
| `GET` | `/api/years` | Public | Daftar tahun tersedia |
| `GET` | `/api/admin/data` | Admin | Data dengan pagination & search |
| `POST` | `/api/admin/data` | Admin | Tambah satu record |
| `PUT` | `/api/admin/data/:id` | Admin | Edit satu record |
| `DELETE` | `/api/admin/data/:id` | Admin | Hapus satu record |
| `DELETE` | `/api/admin/data/year/:year` | Admin | Hapus semua data satu tahun |
| `POST` | `/api/admin/import` | Admin | Upload CSV long-format |
| `POST` | `/api/admin/import-excel` | Admin | Upload Excel mentah (auto-parse) |
| `GET` | `/api/admin/export?year=2025` | Admin | Download data sebagai CSV |

---

### Skema Database

```prisma
model DashboardData {
  id        Int    @id @default(autoincrement())
  year      Int    @default(2025)   // Tahun data
  tableNo   Int                     // Nomor tabel dari buku profil
  no        String                  // Nomor urut kabupaten
  kabupaten String                  // Nama kabupaten/kota
  metric    String                  // Nama variabel (snake_case)
  value     String                  // Nilai (disimpan sebagai string)
}
```

---

## 🗄️ Struktur Data

### Cara Membaca `kabupaten_all.csv`

Data disimpan dalam format **long-format** (setiap baris = satu nilai dari satu variabel untuk satu kabupaten).

```
table_no  no    kabupaten       metric                value
85        1.0   KAB. PACITAN    kk_stop_babs_sbs      100
85        1.0   KAB. PACITAN    kk_cuci_tangan_...    76.81
```

Untuk menggunakan data variabel tertentu dalam kode:
```tsx
const myVar = data.filter(d => d.metric === 'nama_variabel_dari_csv')
```

### Konvensi Nama Kabupaten/Kota

| Format | Contoh |
|---|---|
| Kabupaten | `KAB. PACITAN`, `KAB. MALANG` |
| Kota | `KOTA SURABAYA`, `KOTA MALANG` |
| Provinsi | `PROV. JAWA TIMUR` |

> **Perhatian:** Baris dengan `kabupaten = 'PROV. JAWA TIMUR'` biasanya adalah angka total provinsi dan perlu difilter keluar saat analisis per-kabupaten.

---

## 🔧 Troubleshooting

### Port 3000 sudah digunakan saat start backend

```powershell
# Matikan semua proses Node
Get-Process -Name "node" | Stop-Process -Force
# Lalu jalankan ulang
cd backend && npm run dev
```

### Import Excel gagal dengan pesan "openpyxl does not support file format"

Pastikan versi `openpyxl` terinstal:
```bash
pip install openpyxl --upgrade
```

### Import Excel gagal dengan timeout

Proses parsing Excel besar (~88 sheet) membutuhkan waktu 30–60 detik. Pastikan:
- Koneksi antara frontend dan backend stabil
- File Excel tidak rusak (bisa dibuka di Microsoft Excel)
- Timeout di `src/services/api.ts` cukup besar (default: 120 detik untuk Excel)

### Database kosong / data tidak muncul

Jalankan ulang seeding:
```bash
cd backend
npm run seed
```

### Peta tidak muncul / blank

Pastikan file GeoJSON tersedia di `src/data/`. Jika tidak ada, periksa import di `ChoroplethMap.tsx`.

---

## 👥 Tim & Kontribusi

Proyek ini dikembangkan dalam rangka **Praktik Kerja Lapangan (PKL)** di Dinas Kesehatan Provinsi Jawa Timur.

**Data bersumber dari:**  
[Profil Kesehatan Jawa Timur 2025](https://dinkes.jatimprov.go.id/source/bankdata&statis&sekretariat&PPA&105__1784015649_profil-kesehatan-2025-14072026.pdf) — Dinas Kesehatan Provinsi Jawa Timur

---

*Dokumentasi ini dibuat untuk memudahkan pengembang selanjutnya dalam memahami, memelihara, dan mengembangkan proyek ini.*
