# Dashboard Profil Kesehatan Provinsi Jawa Timur

Buat sebuah **Dashboard Profil Kesehatan Provinsi Jawa Timur** berbasis data kabupaten/kota menggunakan dataset yang telah disediakan. Sebelum memulai, **baca dan pahami file `summary_kabupaten.md`** sebagai referensi utama untuk mengetahui struktur dataset, daftar tabel, hubungan antar tabel, serta variabel yang tersedia. Seluruh pemetaan data pada dashboard **wajib mengacu pada file tersebut**.

Dashboard yang dibuat **bukan prototype atau mockup**, melainkan **aplikasi web yang siap digunakan (production-ready), telah terhubung dengan backend data, dan siap di-hosting**.

---

# User Role

Dashboard memiliki dua jenis pengguna.

## Admin

* Login diperlukan.
* Tambah, ubah, hapus data (CRUD).
* Import data (CSV/Excel).
* Export data.
* Validasi data (opsional).

## Guest

* Tidak perlu login.
* Hanya dapat melihat dashboard.
* Menggunakan filter.
* Mengeksplorasi data.
* Mengunduh grafik atau tabel (jika tersedia).

---

# Struktur Dashboard

Gunakan **sidebar navigation** dengan halaman berikut:

1. Gambaran Umum
2. Sarana Kesehatan
3. Sumber Daya Manusia Kesehatan
4. Pembiayaan Kesehatan
5. Kesehatan Keluarga
6. Pengendalian Penyakit
7. Kesehatan Lingkungan

## Submenu

### 2. Sarana Kesehatan

* 2.1 Sarana Kesehatan
* 2.2 Akses dan Mutu Pelayanan Kesehatan
* 2.3 Upaya Kesehatan Bersumberdaya Masyarakat (UKBM)

### 5. Kesehatan Keluarga

* 5.1 Kesehatan Ibu
* 5.2 Kesehatan Anak
* 5.3 Kesehatan Usia Produktif dan Usia Lanjut

### 6. Pengendalian Penyakit

* 6.1 Penyakit Menular Langsung
* 6.2 Penyakit yang Dapat Dicegah Dengan Imunisasi (PD3I)
* 6.3 Penyakit Tular Vektor dan Zoonotik

---

# Filter Global

Setiap halaman wajib memiliki filter yang berlaku untuk seluruh komponen dashboard.

Minimal:

* Kabupaten/Kota
* Tahun

Tambahkan filter dinamis sesuai karakteristik data, seperti:

* Jenis fasilitas kesehatan
* Jenis tenaga kesehatan
* Jenis penyakit
* Jenis imunisasi
* Kelompok umur
* Jenis kelamin

Gunakan **cascading filter**, sehingga seluruh visualisasi, analisis, KPI, dan tabel akan berubah secara otomatis mengikuti filter yang dipilih.

---

# Mapping Data

Gunakan **summary_kabupaten.md** sebagai acuan utama.

* **Gambaran Umum** → demografi, luas wilayah, jumlah penduduk, kepadatan, dll.
* **Sarana Kesehatan** → fasilitas kesehatan, BOR, BTO, TOI, ALOS, GDR, NDR, Posyandu, obat esensial, vaksin.
* **SDM Kesehatan** → seluruh tenaga kesehatan (dokter, dokter gigi, bidan, perawat, farmasi, laboratorium, gizi, kesehatan masyarakat, psikolog, tenaga penunjang, dll.). Perhatikan bahwa tabel 13–18 merupakan **multi-section table**, sehingga data harus dipisahkan berdasarkan jenis fasilitas (Puskesmas, Rumah Sakit, Sarana Lain, dll.).
* **Pembiayaan Kesehatan** → anggaran kesehatan.
* **Kesehatan Keluarga** → kesehatan ibu, kesehatan anak, KB, imunisasi, gizi, kematian ibu, kematian bayi, pelayanan usia produktif, pelayanan lansia.
* **Pengendalian Penyakit** → TBC, HIV, Diare, Hepatitis, Pneumonia, Kusta, DBD, Malaria, Filariasis, Hipertensi, Diabetes Mellitus, Kanker, Gangguan Jiwa.
* **Kesehatan Lingkungan** → air minum, sanitasi, STBM, BABS, TFU, TPP, kualitas udara.

Pastikan setiap halaman hanya menggunakan tabel dan indikator yang relevan sesuai pemetaan pada `summary_kabupaten.md`.

---

# Analisis

Setiap halaman tidak hanya menampilkan visualisasi, tetapi juga menyediakan analisis yang sesuai dengan karakteristik data.

## 1. Statistik Deskriptif

Tampilkan:

* Jumlah data
* Mean
* Median
* Minimum
* Maksimum
* Standar deviasi
* Kuartil (Q1 & Q3)
* Persentase (jika relevan)

## 2. Crosstab

Digunakan untuk data kategorik.

Contoh:

* Kabupaten × Jenis Penyakit
* Kabupaten × Jenis Fasilitas
* Kabupaten × Status Posyandu
* Kabupaten × Kelompok Umur
* Kabupaten × Jenis Kelamin

Tampilkan dalam bentuk:

* Tabel
* Heatmap
* Stacked Bar Chart

## 3. Analisis Korelasi

Jika tersedia lebih dari satu variabel numerik:

* Dropdown pemilihan dua variabel.
* Scatter Plot.
* Garis regresi.
* Nilai korelasi (Pearson/Spearman sesuai karakteristik data).
* p-value (jika tersedia).
* Interpretasi kekuatan hubungan.

Seluruh analisis harus bersifat dinamis mengikuti filter yang dipilih.

---

# Visualisasi

Setiap visualisasi wajib memiliki dropdown pemilihan indikator atau variabel.

Gunakan visualisasi yang paling sesuai, seperti:

* KPI Cards
* Bar Chart
* Horizontal Bar Chart
* Grouped Bar Chart
* Stacked Bar Chart
* Line Chart
* Area Chart
* Donut Chart
* Heatmap
* Scatter Plot
* Histogram
* Box Plot
* Bubble Chart
* Treemap
* Choropleth Map Kabupaten/Kota Jawa Timur
* Ranking Chart
* Interactive Data Table

Hindari Pie Chart kecuali jumlah kategori sangat sedikit.

---

# Insight Otomatis

Setiap analisis maupun visualisasi wajib memiliki **kotak interpretasi otomatis** di bawahnya berdasarkan data yang sedang difilter.

Contoh insight:

* Kabupaten dengan nilai tertinggi dan terendah.
* Rata-rata Provinsi Jawa Timur.
* Sebaran nilai antar kabupaten.
* Tren peningkatan atau penurunan.
* Hubungan antar variabel (hasil korelasi).

Insight harus diperbarui secara otomatis ketika filter berubah.

---

# Layout Halaman

Susunan komponen setiap halaman:

1. Header halaman
2. Filter
3. KPI Cards
4. Visualisasi utama
5. Visualisasi pendukung
6. Analisis statistik
7. Crosstab/Korelasi (jika relevan)
8. Tabel data interaktif
9. Insight otomatis

Layout harus responsive dan konsisten di seluruh halaman.

---

# UI/UX

Gunakan desain:

* Clean
* Modern
* Professional
* Minimalis
* Enterprise Analytics
* Government Dashboard

Gunakan whitespace yang cukup, card dengan border-radius 12–16 px, shadow halus, ikon sederhana, tipografi yang mudah dibaca, serta konsistensi ukuran dan jarak antar komponen.

Skema warna:

* Background: **#FFFFFF**
* Primary: **#0FB0AA**
* Accent 1: **#CBD92C**
* Accent 2: **#06B5D0**

Pastikan memenuhi standar aksesibilitas (WCAG AA).

---

# Interaktivitas

Dashboard harus mendukung:

* Drill-down (jika memungkinkan)
* Hover tooltip
* Zoom chart
* Export grafik (PNG/PDF)
* Export tabel (CSV/Excel)
* Reset filter
* Pencarian kabupaten
* Sorting
* Pagination
* Responsive untuk desktop dan tablet

---

# Backend & Implementasi

Dashboard harus berupa aplikasi yang siap digunakan (**production-ready**) dengan frontend dan backend yang telah terintegrasi.

Persyaratan:

* Frontend terhubung dengan backend melalui API.
* Seluruh data diambil dari database secara dinamis (tidak hardcoded).
* Mendukung CRUD untuk Admin.
* Mendukung autentikasi dan otorisasi berdasarkan user role.
* Struktur project modular, scalable, maintainable, dan mudah dikembangkan.
* Seluruh filter, analisis, visualisasi, serta insight bekerja secara dinamis berdasarkan data.
* Siap di-deploy ke server/cloud tanpa perubahan arsitektur yang signifikan.
* Sertakan struktur folder project, dokumentasi instalasi, konfigurasi environment (.env), panduan menjalankan aplikasi secara lokal, dan panduan deployment.

---

# Output yang Diharapkan

Hasil akhir yang diharapkan adalah **aplikasi Dashboard Profil Kesehatan Provinsi Jawa Timur yang lengkap, fungsional, production-ready, dan siap di-hosting**, bukan sekadar desain antarmuka.

Dashboard harus mencakup:

1. Struktur navigasi dan subhalaman.
2. Mapping tabel dan variabel dari `summary_kabupaten.md`.
3. KPI utama pada setiap halaman.
4. Analisis statistik, crosstab, dan korelasi yang sesuai.
5. Visualisasi terbaik beserta alasan pemilihannya.
6. Layout/wireframe setiap halaman.
7. Desain UI/UX yang konsisten.
8. Komponen interaktif.
9. Insight otomatis pada setiap visualisasi.
10. Frontend dan backend yang telah terintegrasi.
11. Database yang terhubung dengan aplikasi.
12. Sistem login dan manajemen hak akses.
13. Dokumentasi instalasi dan deployment.
14. Aplikasi yang dapat langsung dijalankan, digunakan, dan di-hosting tanpa memerlukan pengembangan ulang arsitektur utama.