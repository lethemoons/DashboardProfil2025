# Dashboard Profil Kesehatan Provinsi Jawa Timur 2025

**Dashboard interaktif** berbasis web untuk memvisualisasikan, menganalisis, dan memperbarui data Profil Kesehatan Provinsi Jawa Timur secara tahunan.

🔗 **Link Akses Dashboard (Vercel Deployment):**  
[https://dashboard-profil2025-pi.vercel.app/](https://dashboard-profil2025-pi.vercel.app/)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Dokumentasi & Panduan](#-dokumentasi--panduan)
- [Struktur Proyek](#-struktur-proyek)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Cara Menjalankan Lokal](#-cara-menjalankan-lokal)
- [Panduan Admin: Update Data Tahunan](#-panduan-admin-update-data-tahunan)
- [Panduan Pengembangan Lanjutan](#-panduan-pengembangan-lanjutan)
- [Struktur Data](#-struktur-data)
- [Struktur API Backend](#-struktur-api-backend)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| **Dashboard Multi-Bab** | 12+ bab analisis kesehatan sesuai struktur Profil Kesehatan Kemenkes |
| **Peta Choropleth** | Peta sebaran data per kabupaten/kota se-Jawa Timur |
| **Peta Klaster Risiko** | Pemetaan klaster risiko otomatis berbasis algoritma K-Means (Dapat diakses Publik/Guest) |
| **Grafik Dinamis** | Grafik batang, area, scatter plot, dan ranking yang interaktif |
| **Insight Otomatis** | Penjelasan data yang dilengkapi implikasi dan sebab-akibat untuk pembaca awam |
| **Crosstab Analysis** | Analisis tabulasi silang antar variabel kinerja (Dapat diakses Publik/Guest) |
| **Statistik Deskriptif** | Panel ringkasan (mean, median, standar deviasi, min, maks) |
| **Admin Dashboard** | Antarmuka manajemen data lengkap (upload, edit, hapus, export) |
| **Import Data Tahunan** | Mendukung upload file CSV long format **maupun file Excel mentah** (`.xlsx`) |
| **Export Data** | Unduh data ke format CSV |
| **Role-Based Access** | Pemisahan hak akses publik (Guest) dan manajemen (Admin) dengan JWT |
| **Buku Panduan Internal**| Akses langsung ke PDF Panduan Penggunaan & Pengelolaan dari Halaman Beranda |

---

## 📖 Dokumentasi & Panduan

Platform ini dilengkapi dengan dua buku panduan resmi (format PDF) yang dapat diunduh langsung dari Hero Section halaman Beranda:

1. **Panduan Penggunaan (Guest)**: Ditujukan untuk masyarakat umum. Membahas cara membaca KPI, grafik, peta Choropleth, hingga cara memanfaatkan fitur analisis data mandiri (Crosstab, Korelasi, dan Klasterisasi).
2. **Panduan Pengelolaan (Admin)**: Ditujukan khusus untuk administrator tingkat provinsi. Membahas tata cara login, *overwrite*/pembaruan data dengan file Excel, hingga pengelolaan baris data. *(Tautan unduhan dokumen ini disembunyikan bagi pengunjung Guest dan hanya muncul setelah login).*

*Catatan: Dokumen PDF ini secara fisik disimpan di direktori `public/` agar mudah diakses/di-serve oleh Vite.*

---

## 📁 Struktur Proyek

```
DashboardProfil2025/
│
├── public/                       # Aset publik
│   ├── Panduan_User_Penggunaan_Dashboard_Profil_Kesehatan_Jawa_Timur.pdf
│   ├── Panduan_Admin_Pengelolaan_Dashboard_Profil_Kesehatan_Jawa_Timur.pdf
│   └── ...
│
├── src/                          # Kode frontend (React + Vite)
│   ├── pages/                    # Halaman-halaman dashboard
│   │   ├── Beranda.tsx           # Halaman utama / landing page
│   │   ├── GambaranUmum.tsx      # Bab 1: Gambaran Umum
│   │   ├── AdminDashboard.tsx    # Panel Admin
│   │   └── ... (Halaman bab lainnya)
│   │
│   ├── components/               # Komponen UI yang dapat dipakai ulang
│   │   ├── ChoroplethMap.tsx     # Peta sebaran choropleth
│   │   ├── RiskClusteringMap.tsx # Peta klaster risiko K-Means
│   │   ├── CrosstabSection.tsx   # Analisis crosstab
│   │   └── ...
│   │
│   ├── contexts/                 # State management (FilterContext, AuthContext)
│   ├── hooks/                    # Custom hook untuk fetch data API
│   ├── services/                 # Konfigurasi Axios
│   └── data/                     # Data statis (GeoJSON peta, dll)
│
├── backend/                      # Kode backend (Node.js + Express)
│   ├── src/
│   │   ├── server.ts             # Server Express utama
│   │   └── seed.ts               # Script seed awal
│   ├── prisma/
│   │   └── schema.prisma         # Skema SQLite
│   ├── database/                 # dev.db (Database SQLite)
│   ├── uploads/                  # Temporary folder
│   └── parse_excel.py            # Python script parser Excel → CSV
│
└── README.md                     # Dokumentasi proyek
```

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React 19** + **TypeScript**
- **Vite 8** (Build tool)
- **Tailwind CSS v4** (Styling)
- **Recharts** (Grafik & visualisasi)
- **D3-Geo** + **TopoJSON** (Peta choropleth spasial)
- **Axios** (HTTP client)

### Backend
- **Node.js** + **Express**
- **TypeScript** (via `ts-node`)
- **Prisma ORM** + **SQLite** (Database)
- **JWT** (Autentikasi keamanan)
- **Multer** (File upload)
- **Python 3** + **openpyxl** (Parsing dataset Excel/Kemenkes)

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- **Node.js** >= 18
- **Python** >= 3.9
- **pnpm** (opsional, disarankan) atau `npm`
- Python package `openpyxl`:
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

### 5. Jalankan Frontend dan Backend (Dev Mode)

Buka **dua terminal terpisah**:

**Terminal 1 — Frontend:**
```bash
npm run dev
# Aplikasi terbuka di http://localhost:5173
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run dev
# API server berjalan di http://localhost:3000
```

---

## 🔄 Panduan Admin: Update Data Tahunan

Ada **dua cara** memperbarui data dashboard dengan rilis Profil Kesehatan tahun terbaru. Sistem tidak menggunakan form *edit-cell-by-cell*, melainkan dengan mekanisme **Timpa/Overwrite**.

### Cara 1: Upload File Excel Mentah (Sangat Direkomendasikan ✅)

> Format: Gunakan **Lampiran Profil Kesehatan Kemenkes (Excel `.xlsx`)** asli.

1. Buka dashboard dan Login sebagai **Admin** (`/admin`).
2. Klik tombol **Unggah Data**.
3. Atur **Tahun** tujuan (misal: 2026).
4. Klik **Pilih & Unggah File**, pilih file `.xlsx`.
5. Tunggu proses parsing server (± 30–60 detik).
6. Muncul notifikasi **"Import successful"**.

**Catatan Penting Overwrite:**
- **Perhatian:** Data baru akan secara absolut menggantikan (overwrite) data sebelumnya pada tahun tersebut. Pastikan nilai di file sudah benar.

### Cara 2: Upload CSV Long-Format (Manual)
Jika Anda perlu parsing manual (menggunakan script `parse_kabupaten.py`), Anda dapat mengunggah file CSV berformat long-format dengan kolom `table_no, no, kabupaten, metric, value`.

---

## 💻 Panduan Pengembangan Lanjutan

### Menambahkan Halaman / Modul Baru
1. Buat file halaman baru di direktori `src/pages/NamaHalaman.tsx`.
2. Gunakan komponen UI global yang ada (`KPICard`, `InsightBox`, `DataTable`).
3. Daftarkan rute halaman baru Anda di `src/App.tsx` (tambahkan ke menu Sidebar dan `PAGE_TO_NAV_GROUP`).

### Menambahkan Variabel/Metrik Baru
Variabel baru akan **secara otomatis tersedia** di frontend apabila data indikatornya telah masuk (disimpan di database SQLite) dengan nama `metric` (format `snake_case`) yang sesuai dari backend.

Contoh penggunaannya di frontend:
```tsx
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

## 🌐 Struktur API Backend

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Mendapatkan Token JWT Admin |
| `GET` | `/api/data?year=2025` | Public | Mengambil seluruh dataset per tahun |
| `GET` | `/api/years` | Public | Daftar tahun yang tersedia |
| `GET` | `/api/admin/data` | Admin | Data terpaginasi (untuk tabel admin) |
| `DELETE` | `/api/admin/data/:id` | Admin | Hapus per-baris record individual |
| `DELETE` | `/api/admin/data/year/:year` | Admin | Hapus semua data di tahun terkait |
| `POST` | `/api/admin/import` | Admin | Upload CSV long-format |
| `POST` | `/api/admin/import-excel` | Admin | Upload & Parsing otomatis Excel Mentah |
| `GET` | `/api/admin/export?year=2025` | Admin | Ekspor ke CSV |

---

## 🗄️ Struktur Data (Long-Format)

Data tersimpan dalam format **long-format**.
Setiap baris di database mewakili **satu nilai spesifik** dari satu variabel untuk **satu kabupaten**.

```
table_no  no    kabupaten       metric                value
85        1.0   KAB. PACITAN    kk_stop_babs_sbs      100
85        1.0   KAB. PACITAN    kk_cuci_tangan_...    76.81
```

> **Perhatian Analisis:** Baris dengan `kabupaten = 'PROV. JAWA TIMUR'` menyimpan nilai agregrat total tingkat provinsi. Seringkali baris ini harus di-*exclude* (difilter keluar) ketika Anda merender grafik bar-chart per wilayah.

---

## 🔧 Troubleshooting

1. **Port 3000 sudah digunakan (EADDRINUSE)**  
   ```powershell
   Get-Process -Name "node" | Stop-Process -Force
   ```
2. **Import Excel gagal dengan pesan "openpyxl does not support file format"**  
   Pastikan versi openpyxl terbaru: `pip install openpyxl --upgrade`.
3. **Peta Choropleth tidak muncul**  
   Pastikan file GeoJSON untuk batas admin kabupaten/kota sudah tersedia di dalam folder `src/data/` dan telah di-import dengan benar pada komponen peta.
4. **Data Kosong**  
   Cobalah jalankan `npm run seed` di folder backend untuk me-*reset* database lokal.

---

## 👥 Tim & Kontribusi

Proyek ini dikembangkan dalam rangka **Praktik Kerja Lapangan (PKL)** di Dinas Kesehatan Provinsi Jawa Timur.

**Sumber Data Utama:**  
[Profil Kesehatan Jawa Timur 2025](https://dinkes.jatimprov.go.id/source/bankdata&statis&sekretariat&PPA&105__1784015649_profil-kesehatan-2025-14072026.pdf) — Dinas Kesehatan Provinsi Jawa Timur

---

*Dokumentasi ini dibuat untuk memudahkan pengembang selanjutnya dalam memahami, memelihara, dan melakukan serah-terima (handover) proyek aplikasi.*
