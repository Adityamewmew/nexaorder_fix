# Nexa Order - Sistem Self-Order dan POS Restoran

Nexa Order adalah platform Point of Sale (POS) dan Self-Ordering berbasis QR Code yang dirancang khusus untuk UMKM F&B. Sistem ini memisahkan antarmuka untuk Customer (pemesanan via HP), Kasir (manajemen pesanan), dan Admin (manajemen toko).

Proyek ini telah dipersiapkan untuk dipisahkan menjadi dua repositori mandiri sesuai kebutuhan deployment dan pengembangan:
1. **Frontend (Client)**: Menggunakan React, Vite, TypeScript, dan Tailwind CSS.
2. **Backend (Server)**: Menggunakan Node.js, Express, Prisma ORM, dan PostgreSQL.

---

## Tautan Repositori Resmi

Silakan merujuk ke masing-hari repositori berikut untuk pembaruan kode dan kolaborasi:

- **Repositori Frontend (Client)**:
  `https://github.com/Adityamewmew/NexaOrder_frontend.git`

- **Repositori Backend (Server)**:
  `https://github.com/Adityamewmew/NexaOrder_BackEnd.git`

---

## Dokumentasi Lengkap Masing-Masing Layanan

Setiap direktori utama memiliki panduan instalasi, konfigurasi environment variables, skema database, rute navigasi, dan daftar endpoint API secara terperinci. Silakan baca file dokumentasi pada masing-masing folder:

- **Dokumentasi Frontend**:
  Lihat panduan lengkap di [client/README.md](file:///c:/laragon/www/nexaorder-1/client/README.md) untuk detail rute halaman, instalasi modul React, dan konfigurasi build Vite.

- **Dokumentasi Backend**:
  Lihat panduan lengkap di [server/README.md](file:///c:/laragon/www/nexaorder-1/server/README.md) untuk detail skema database PostgreSQL, API endpoints, Server-Sent Events (SSE), dan background worker.

---

## Struktur Direktori Monorepo Saat Ini

```
nexaorder-1/
|-- client/           # Folder aplikasi Frontend (pindahkan isi folder ini ke repo NexaOrder_frontend)
|   |-- README.md     # Panduan konfigurasi & rute frontend
|   |-- package.json
|   |-- src/
|
|-- server/           # Folder aplikasi Backend (pindahkan isi folder ini ke repo NexaOrder_BackEnd)
|   |-- README.md     # Panduan skema database & API backend
|   |-- package.json
|   |-- src/
|
|-- README.md         # File ini (indeks repositori)
```

---

## Langkah Pemisahan Folder ke Repositori Baru

Jika Anda ingin memindahkan folder secara fisik ke repositori yang telah disediakan:

### 1. Inisialisasi Repositori Frontend

Salin seluruh isi direktori `client/` (termasuk file tersembunyi seperti `.gitignore` dan `.env`) ke folder baru, kemudian jalankan perintah berikut:

```bash
git init
git remote add origin https://github.com/Adityamewmew/NexaOrder_frontend.git
git add .
git commit -m "Inisialisasi repositori frontend Nexa Order"
git branch -M main
git push -u origin main
```

### 2. Inisialisasi Repositori Backend

Salin seluruh isi direktori `server/` (termasuk file tersembunyi seperti `.gitignore` dan `.env`) ke folder baru lainnya, kemudian jalankan perintah berikut:

```bash
git init
git remote add origin https://github.com/Adityamewmew/NexaOrder_BackEnd.git
git add .
git commit -m "Inisialisasi repositori backend Nexa Order"
git branch -M main
git push -u origin main
```

---

## Integrasi Cepat (Local Development)

Setelah kedua repositori dipisahkan dan dikloning masing-masing:

1. **Jalankan Backend**:
   - Masuk ke folder backend, atur database URL di `.env`.
   - Jalankan `npm install`.
   - Jalankan `npx prisma migrate dev` dan `npm run dev`.
   - Backend berjalan pada `http://localhost:5000`.

2. **Jalankan Frontend**:
   - Masuk ke folder frontend, atur `VITE_API_URL=http://localhost:5000/api` di `.env`.
   - Jalankan `npm install`.
   - Jalankan `npm run dev`.
   - Frontend berjalan pada `http://localhost:5173`.
