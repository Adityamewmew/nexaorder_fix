# Nexa Order - Sistem Self-Order & POS Restoran

Nexa Order adalah platform Point of Sale (POS) dan Self-Ordering berbasis QR Code yang dirancang khusus untuk UMKM F&B. Sistem ini memisahkan antarmuka untuk Customer (pemesanan via HP), Kasir (manajemen pesanan), dan Admin (manajemen toko).

---

## 🚀 Status Progres Saat Ini (Tahap Frontend & Integrasi Selesai)

Aplikasi telah menyelesaikan fase pengembangan inti (Frontend & Backend integrasi). Berikut adalah fitur-fitur yang sudah **selesai dan berjalan dengan baik**:

### Sisi Pelanggan (Customer App - Mobile First)
- [x] Pemindaian QR Code cerdas dengan sistem Token (mencegah manipulasi URL meja/akses jarak jauh tanpa izin).
- [x] Katalog Menu Dinamis dengan kategori, rekomendasi menu, dan pencarian cerdas.
- [x] Sistem Keranjang (Cart) & Checkout persisten (tidak hilang saat di-refresh).
- [x] Validasi data diri dan metode pembayaran (CASH/QRIS).
- [x] Live Tracking Pesanan (Stepper animasi: Diterima -> Diproses -> Selesai).
- [x] Dukungan pemesanan Dine-In (otomatis mendeteksi nomor meja) dan Takeaway.

### Sisi Kasir (Point of Sale & Antrean)
- [x] Dashboard POS interaktif dengan keranjang belanja untuk input pesanan manual.
- [x] Real-time Clock & Profil Kasir dinamis di Top Bar.
- [x] Manajemen Antrean Pesanan (Kanban Board: Pending, Process, Ready) dengan indikator Dine In / Takeaway.
- [x] Struk digital (Order Detail Modal) yang terperinci.
- [x] Badge notifikasi merah jumlah pesanan masuk secara real-time.

### Sisi Admin (Merchant Dashboard)
- [x] Manajemen Menu & Stok (stok otomatis berkurang di backend saat ada pesanan).
- [x] Fitur Modifier/Add-ons menu (opsional/wajib).
- [x] Manajemen Meja (Generate QR Code resolusi tinggi siap cetak, nonaktifkan meja).
- [x] Manajemen Akun Staf/Kasir (Role-based access, Email opsional, Upload Foto Profil).
- [x] Laporan Penjualan komprehensif (Rata-rata penjualan, Tren vs Kemarin, Grafik Recharts, Filter Cepat).
- [x] Export Laporan Penjualan ke file `.csv`.
- [x] Pengaturan Profil Toko (Logo Toko otomatis menimpa yang lama, Jam Buka/Tutup Toko).

---

## ⏳ Tugas Mendatang (Pending Tasks)

Bagian ini berisi fitur-fitur krusial yang **belum** diimplementasikan dan menjadi target pengembangan selanjutnya oleh tim:

1. **Integrasi Payment Gateway** 💳
   - Menghubungkan sistem dengan *payment gateway* pihak ketiga (misal: Midtrans, Xendit, atau Duitku).
   - Generate QRIS dinamis atau Virtual Account secara otomatis saat Customer menekan tombol "Buat Pesanan".
   - *Webhook handler* di backend untuk mengubah status pesanan otomatis saat pembayaran berhasil.

2. **Notifikasi Real-Time (Push & Sound)** 🔔
   - Saat ini sistem notifikasi kasir masih menggunakan *polling* API (menarik data setiap 10 detik).
   - **Target:** Mengganti *polling* dengan **WebSockets (Socket.io)** atau **Server-Sent Events (SSE)** agar notifikasi pesanan masuk benar-benar instan (0 delay).
   - Menampilkan jendela notifikasi mengambang (*floating toast/alert*) dan membunyikan *alarm/beep* di layar Kasir/Dapur.

3. **Sistem Timeout Pesanan (Auto-Cancel)** ⏱️
   - Membuat *cron job* atau *background worker* (misal: menggunakan Node-Cron atau Redis) di server backend.
   - Pesanan akan dibatalkan secara otomatis jika pelanggan tidak melakukan pembayaran dalam batas waktu tertentu (misal: 15 menit), atau jika pesanan tertahan terlalu lama tanpa diproses.

4. **Deployment & Production** 🚀
   - Menyiapkan *environment* produksi (misal: Dockerization).
   - Deployment Frontend (bisa menggunakan Vercel, Netlify, atau Cloudflare Pages).
   - Deployment Backend (bisa menggunakan Railway, Render, VPS DigitalOcean/AWS).
   - Hosting Database PostgreSQL (bisa menggunakan Supabase, Neon, atau Aiven).
   - Setup domain kustom dan sertifikat SSL (HTTPS).

---

## 🛠️ Teknologi yang Digunakan

Berikut adalah daftar library utama yang digunakan pada project ini (lihat `package.json` untuk versi spesifik):
- **Frontend (UI & Logic):** React (v18), Vite (v5), TypeScript.
- **State Management:** Redux Toolkit & React Redux.
- **Routing:** React Router DOM (v6/v7).
- **Styling:** Tailwind CSS, clsx, tailwind-merge.
- **Komponen Visual:** Recharts (Grafik), Lucide React (Ikon), qrcode.react.
- **HTTP Client:** Axios.

## 🚀 Cara Menjalankan Aplikasi

Berikut adalah panduan step-by-step untuk menjalankan project frontend Nexa Order secara lokal:

1. **Clone Project:**
   ```bash
   git clone https://github.com/FaraFuru/nexaorder.git
   cd nexaorder
   cd client
   ```

2. **Menyiapkan URL Backend (.env):**
   Buat file `.env` di root directory `client` (sejajar dengan `package.json`), lalu tambahkan URL backend:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Install Packages:**
   ```bash
   npm install
   ```

4. **Jalankan Aplikasi (Development Server):**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173/`. Buka link tersebut di browser.

## 🌐 Struktur Akses Halaman
- **Landing Page & Demo:** `http://localhost:5173/`
- **Platform Admin (Superadmin):** `http://localhost:5173/platform/login`
- **Merchant Login (Admin & Kasir):** `http://localhost:5173/merchant/login`
