# Dashboard Profil Kesehatan

Aplikasi ini adalah dashboard untuk Profil Kesehatan yang terdiri dari antarmuka React (Vite + Tailwind CSS v4) dan backend Express.js dengan Prisma ORM.

## Struktur Proyek

- `/src`: Kode sumber frontend (React, komponen, halaman).
- `/backend`: Kode sumber backend (Express.js, Prisma schema, API).
- `/*.py` dan `/*.cjs`: Script utilitas yang digunakan untuk memproses data mentah.

## Prasyarat (Requirements)

Pastikan Anda sudah menginstal aplikasi berikut sebelum menjalankan proyek ini:
- **Node.js** (versi 18 atau 20+ disarankan).
- **pnpm** (sebagai package manager utama untuk frontend, bisa diinstal via `npm i -g pnpm`).
- **Python 3** (opsional, hanya jika perlu menjalankan ulang script pengolahan data Python).

## Cara Menjalankan Aplikasi

Aplikasi ini memiliki dua bagian yang harus dijalankan secara paralel: Backend dan Frontend.

### 1. Setup & Menjalankan Backend

Buka terminal baru dan jalankan perintah berikut:

```bash
# Pindah ke folder backend
cd backend

# Instal dependencies (disarankan pakai npm sesuai package-lock.json yang ada)
npm install

# Generate Prisma Client & buat tabel SQLite lokal (jika belum)
npx prisma generate
npx prisma db push

# (Opsional) Jika perlu data awal, jalankan script seed
npm run seed

# Jalankan server backend (mode development dengan nodemon)
npm run dev
```

Backend akan berjalan dan menggunakan database SQLite lokal yang disimpan di `/database/dev.db`.

### 2. Setup & Menjalankan Frontend

Buka terminal yang lain dan pastikan Anda berada di direktori utama proyek (`/dashboard_dinkes`), lalu jalankan:

```bash
# Instal semua dependencies frontend menggunakan pnpm
pnpm install

# Jalankan development server (Vite)
pnpm run dev
```

Server frontend akan berjalan. Anda bisa mengakses aplikasi melalui browser pada URL yang ditampilkan di terminal (biasanya `http://localhost:8443` atau `http://localhost:5173`).

## Catatan Khusus

- **File Data Mentah**: File berukuran besar seperti `.xlsx` tidak di-commit ke repositori (sudah ditambahkan ke `.gitignore`) agar repositori tidak menjadi terlalu besar. 
- **Tailwind CSS v4**: Proyek ini menggunakan Tailwind versi terbaru yang cukup di-import via `src/index.css`. Tidak ada file konfigurasi `tailwind.config.js` karena v4 menggunakan pendekatan baru.
