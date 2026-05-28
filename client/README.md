# Nexa Order - Frontend

Website E-Commerce Self-Order berbasis QR Code untuk UMKM Kuliner.

## Tools dan Library

Berikut adalah daftar library utama yang digunakan pada project ini (lihat `package.json` untuk versi spesifik):
- **React (v18)**: Library utama untuk membangun UI.
- **Vite (v5)**: Build tool yang sangat cepat untuk React.
- **TypeScript**: Static typing untuk keamanan dan keterbacaan kode (readability).
- **React Router DOM**: Untuk navigasi dan routing antar halaman (Customer, Merchant, Admin).
- **Redux Toolkit & React Redux**: State management global (untuk mengelola state keranjang belanja customer dan sesi login user).
- **TanStack Query (React Query)**: Untuk data fetching, caching, dan sinkronisasi data dengan backend secara efisien.
- **Axios**: HTTP client untuk melakukan request ke backend API.
- **Tailwind CSS**: Utility-first CSS framework untuk styling yang cepat dan responsif.
- **shadcn/ui**: Kumpulan komponen UI yang dapat diakses (accessible) dan dikustomisasi (menggunakan Radix UI di balik layar).
- **lucide-react**: Kumpulan ikon yang konsisten dan modern.
- **clsx & tailwind-merge**: Utility untuk menggabungkan class Tailwind secara dinamis.
- **qrcode.react**: Library untuk men-generate QR Code dinamis (digunakan pada fitur Manajemen Meja).

## Cara Menjalankan Aplikasi

Berikut adalah panduan step-by-step untuk menjalankan project frontend Nexa Order secara lokal:

1. **Clone Project:**
   ```bash
   git clone https://github.com/FaraFuru/nexa-order.git
   cd nexa-order
   ```

2. **Menambahkan URL Backend:**
   Buat file `.env` di root directory project (sejajar dengan `package.json`), lalu tambahkan URL backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   *(Sesuaikan port dengan backend yang sedang berjalan)*

3. **Install Packages:**
   Jalankan perintah berikut untuk mengunduh semua dependency utama:
   ```bash
   npm install
   ```

   **Catatan Penting:** Pastikan juga untuk menginstal library QR Code dengan menjalankan perintah berikut (jika belum terinstal otomatis):
   ```bash
   npm install qrcode.react
   ```

4. **Jalankan Aplikasi (Development Server):**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173/` (atau port lain seperti 5174 jika 5173 sedang dipakai). Buka link tersebut di browser.

## Struktur URL / Akses Halaman Terkini
Saat ini aplikasi masih menggunakan mock-data/UI statis (Backend belum terintegrasi). Anda dapat mengakses halaman berikut:
- **Platform Admin (Superadmin):** `http://localhost:5173/platform/login`
- **Merchant Login (Admin & Kasir):** `http://localhost:5173/merchant/login`
- **Merchant Dashboard:** `http://localhost:5173/merchant/dashboard`
- **Customer Self-Order (Simulasi QR Scan):** `http://localhost:5173/m/kopi-kenangan/meja-4` (URL dinamis berdasarkan ID Merchant dan Meja)

## Roadmap Pengembangan

- [x] **Tahap 1:** Setup Project (Vite, React, TS, Tailwind).
- [x] **Tahap 2:** Sisi Platform Admin (Dashboard, Manajemen Tenant/Merchant, Mock Data).
- [x] **Tahap 3:** Sisi Merchant & Kasir (Dashboard, Manajemen Menu, Meja, Kasir, Auth UI, Toast Notification System).
- [x] **Tahap 4:** Sisi Customer (Halaman Scan QR, Katalog Menu, Keranjang Belanja, Checkout, State Management).
- [ ] **Tahap 5:** Integrasi Backend API & State Management Lanjutan.
