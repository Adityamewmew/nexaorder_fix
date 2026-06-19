# Nexa Order - Frontend Client

Repository ini berisi aplikasi frontend untuk platform Nexa Order, yaitu sistem Self-Order dan Point of Sale (POS) berbasis QR Code untuk usaha kuliner (F&B). Aplikasi ini dirancang menggunakan React, Vite, TypeScript, dan Tailwind CSS.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Direktori](#struktur-direktori)
- [Panduan Instalan Lokal](#panduan-instalan-lokal)
- [Variabel Lingkungan (Environment Variables)](#variabel-lingkungan-environment-variables)
- [Struktur Rute Aplikasi (Routing)](#struktur-rute-aplikasi-routing)
- [Integrasi Real-Time (Server-Sent Events)](#integrasi-real-time-server-sent-events)
- [Deployment ke Vercel](#deployment-ke-vercel)

---

## Gambaran Umum

Aplikasi frontend ini membagi antarmuka pengguna menjadi empat area utama:
1. **Aplikasi Pelanggan (Customer App)**: Berbasis mobile-first untuk memindai QR Code meja, memesan makanan, dan memantau status pesanan secara langsung.
2. **Aplikasi Kasir (Cashier/POS)**: Dasbor berbasis desktop/tablet untuk mencatat pesanan manual, mengelola antrean pesanan via Kanban Board, dan mencetak struk digital.
3. **Dasbor Merchant (Admin)**: Panel kontrol untuk pemilik usaha untuk mengelola menu, modifier/add-ons, data meja, staf, serta menganalisis laporan penjualan dengan grafik interaktif.
4. **Dasbor Superadmin (Platform)**: Tampilan khusus pengelola sistem untuk mengelola daftar tenant (merchant) yang menggunakan platform Nexa Order.

---

## Fitur Utama

### Sisi Pelanggan (Customer App)
- Pemindaian QR Code meja dengan sistem token UUID unik untuk mencegah manipulasi URL pesanan.
- Katalog menu dinamis yang dikelompokkan per kategori dengan pencarian cepat serta rekomendasi produk terlaris.
- Keranjang belanja (Cart) dan checkout persisten (data tidak hilang ketika halaman dimuat ulang).
- Pilihan mode pemesanan Dine-In (nomor meja otomatis terdeteksi) atau Takeaway.
- Formulir checkout dengan input nama, nomor telepon, dan metode pembayaran (CASH/QRIS).
- Halaman tracking pesanan secara real-time dengan tampilan stepper animasi status pesanan.

### Sisi Kasir (Point of Sale)
- Dasbor kasir interaktif untuk menginput pesanan manual secara cepat.
- Tampilan Kanban Board antrean pesanan (Pending, Processing, Ready) dengan indikator label Dine-In atau Takeaway.
- Struk digital terperinci yang menampilkan daftar produk, add-ons, subtotal, catatan pelanggan, dan total harga.
- Jam digital real-time dan detail profil kasir aktif pada bar navigasi atas.
- Badge notifikasi merah pada menu navigasi samping yang menampilkan jumlah pesanan berstatus pending secara real-time.

### Sisi Merchant Admin
- Dasbor statistik visual berisi pendapatan harian, total transaksi, rata-rata penjualan, produk terlaris, dan grafik tren penjualan.
- Manajemen produk lengkap dengan fitur tambah, ubah, hapus, upload gambar produk, status ketersediaan, dan integrasi stok otomatis.
- Sistem Modifier/Add-ons menu yang fleksibel (bisa bersifat opsional atau wajib dengan batas minimum/maksimum pemilihan).
- Manajemen kategori menu restoran.
- Manajemen meja dengan fitur generate QR Code resolusi tinggi siap cetak per meja serta kemampuan menonaktifkan meja.
- Manajemen akun staf (kasir/admin) lengkap dengan upload foto profil, filter status aktif/nonaktif, dan kontrol akses.
- Export laporan penjualan ke format file CSV atau PDF secara cepat.
- Halaman profil toko untuk mengatur jam buka/tutup, logo toko, alamat, dan nomor kontak.

---

## Teknologi yang Digunakan

Aplikasi frontend dibangun dengan pustaka dan peralatan berikut:

| Kategori | Library / Tools | Versi | Deskripsi |
|---|---|---|---|
| Core | React | ^18.2.0 | Framework UI utama |
| Build Tool | Vite | ^5.1.4 | Bundler berkecepatan tinggi |
| Bahasa | TypeScript | ^5.2.2 | Penulisan kode dengan tipe statis |
| Routing | React Router DOM | ^6.22.3 | Manajemen navigasi halaman |
| State | Redux Toolkit | ^2.2.1 | Manajemen global state client |
| Server State | TanStack Query | ^5.24.1 | Manajemen data cache dari API |
| HTTP Client | Axios | ^1.6.7 | Pengiriman request HTTP ke server |
| Styling | Tailwind CSS | ^3.4.1 | Utility-first CSS framework |
| Grafik | Recharts | ^3.8.1 | Pembuatan grafik laporan penjualan |
| QR Code | qrcode.react | ^4.2.0 | Generator QR Code meja |
| File Export | jsPDF | ^4.2.1 | Export laporan penjualan ke PDF |
| File Export | xlsx | ^0.18.5 | Export laporan penjualan ke Excel/CSV |
| Ikon | Lucide React | ^0.344.0| Set ikon SVG |

---

## Struktur Direktori

Berikut adalah struktur kode sumber pada direktori `src`:

```
src/
|-- components/         # Komponen global reusable (contoh: ProtectedRoute)
|-- contexts/           # React Context providers
|-- features/           # Pembagian modul berdasarkan fitur bisnis
|   |-- auth/           # Login flow dan state token auth (Redux)
|   |-- customer/       # Modul khusus aplikasi pelanggan
|   |   |-- components/ # Sidebar khusus, keranjang belanja, dll.
|   |   |-- layouts/    # Layout pembungkus aplikasi mobile
|   |   |-- pages/      # Halaman katalog, keranjang, checkout, dan tracking
|   |   |-- store/      # Redux slice untuk keranjang belanja pelanggan
|   |-- merchant/       # Modul untuk kasir dan merchant admin
|   |   |-- menu/       # Halaman daftar menu dan form produk/modifier
|   |   |-- orders/     # Kanban board manajemen pesanan kasir
|   |   |-- pos/        # Sistem pencatatan pesanan kasir
|   |   |-- profile/    # Form pengaturan profil toko merchant
|   |   |-- reports/    # Laporan penjualan dan visualisasi grafik
|   |   |-- staff/      # Manajemen akun staf kasir/admin
|   |   |-- tables/     # Generator QR Code dan manajemen meja
|   |-- platform/       # Modul dashboard superadmin (tenant management)
|-- layouts/            # Layout utama (MerchantLayout, PlatformLayout)
|-- lib/                # Konfigurasi axios instance dan helper global
|-- store/              # Konfigurasi store Redux dan reducer global
|-- types/              # Definisi interface TypeScript global
|-- App.tsx             # Pengaturan rute aplikasi utama
|-- index.css           # Integrasi Tailwind CSS dan variabel warna custom
|-- main.tsx            # Entry point rendering React
```

---

## Panduan Instalan Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi secara lokal di komputer Anda:

### 1. Clone Repository

```bash
git clone https://github.com/Adityamewmew/NexaOrder_frontend.git
cd NexaOrder_frontend
```

### 2. Konfigurasi Environment Variables

Buat sebuah file bernama `.env` di direktori root proyek (sejajar dengan file `package.json` Anda), kemudian masukkan konfigurasi URL API backend:

```env
VITE_API_URL=http://localhost:5000/api
```

Pastikan backend Anda berjalan pada port tersebut atau ubah nilainya menyesuaikan port backend produksi Anda.

### 3. Install Dependensi

Jalankan perintah berikut untuk menginstal seluruh pustaka yang dibutuhkan:

```bash
npm install
```

### 4. Jalankan Server Development

Mulai server development lokal menggunakan perintah:

```bash
npm run dev
```

Secara default, aplikasi akan berjalan pada alamat `http://localhost:5173`. Buka tautan tersebut di browser Anda.

---

## Variabel Lingkungan (Environment Variables)

Aplikasi frontend hanya membutuhkan satu variabel lingkungan utama:

| Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `VITE_API_URL` | Endpoint utama API server backend | `http://localhost:5000/api` |

---

## Struktur Rute Halaman (Routing)

Aplikasi menggunakan React Router DOM dengan pembatasan akses berbasis peran (role). Berikut detail rutenya:

| Path Halaman | Halaman Terkait | Hak Akses | Deskripsi |
|---|---|---|---|
| `/` | Landing Page | Semua / Publik | Halaman beranda utama dengan link demo |
| `/merchant/login` | Login Portal | Semua / Publik | Halaman login untuk kasir dan merchant admin |
| `/platform/login` | Login Platform | Semua / Publik | Halaman login untuk superadmin pengelola |
| `/platform/dashboard` | Platform Stats | SUPERADMIN | Statistik global jumlah tenant dan transaksi |
| `/platform/tenants` | Tenant List | SUPERADMIN | Manajemen pendaftaran tenant merchant baru |
| `/merchant/dashboard` | Merchant Stats | MERCHANT_ADMIN | Visualisasi laporan penjualan dan ringkasan |
| `/merchant/pos` | Point of Sale | CASHIER | Interface pencatatan pesanan kasir |
| `/merchant/orders` | Order Board | MERCHANT_ADMIN, CASHIER | Kanban board untuk memproses pesanan |
| `/merchant/menu` | Product List | MERCHANT_ADMIN, CASHIER | Tampilan daftar produk restoran |
| `/merchant/menu/add` | Add Product | MERCHANT_ADMIN | Formulir tambah menu & modifier baru |
| `/merchant/menu/edit/:id` | Edit Product | MERCHANT_ADMIN | Formulir edit menu restoran |
| `/merchant/tables` | Tables List | MERCHANT_ADMIN | Kelola meja dan unduh QR Code |
| `/merchant/staff` | Staff List | MERCHANT_ADMIN | Kelola akun staf kasir |
| `/merchant/reports` | Sales Report | MERCHANT_ADMIN, CASHIER | Halaman export laporan transaksi |
| `/merchant/profile` | Store Settings | MERCHANT_ADMIN, CASHIER | Konfigurasi detail toko dan logo |
| `/m/:tenantId/:tableToken` | Customer Catalog| Publik | Katalog menu digital pelanggan via QR |
| `/m/:tenantId/:tableToken/cart`| Customer Cart | Publik | Ringkasan item belanjaan pelanggan |
| `/m/:tenantId/:tableToken/checkout`| Checkout Page| Publik | Pilihan bayar dan validasi pesanan |
| `/m/:tenantId/:tableToken/status/:orderId`| Order Tracking | Publik | Tracking status pesanan pelanggan via SSE |

---

## Integrasi Real-Time (Server-Sent Events)

Aplikasi ini menggunakan Server-Sent Events (SSE) untuk komunikasi real-time dari server ke client tanpa polling intensif:
- **Kasir (Order Board)**: Client membuka koneksi ke `/api/sse?token=<jwt_token>`. Setiap kali ada pesanan masuk, state antrean langsung terupdate secara real-time dan badge pending bertambah otomatis.
- **Halaman Tracking Pelanggan**: Client membuka koneksi ke `/api/sse?orderId=<id_pesanan>`. Jika status pesanan diubah oleh kasir, animasi tahapan pesanan di layar HP pelanggan akan langsung bergeser secara instan.

---

## Deployment ke Vercel

Aplikasi ini sudah dilengkapi dengan file `vercel.json` untuk menangani rute aplikasi satu halaman (Single Page Application/SPA):

```json
{
  "cleanUrls": true,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

### Langkah Deployment:
1. Hubungkan repository GitHub Anda (`NexaOrder_frontend`) ke akun Vercel.
2. Buat proyek baru di Vercel dan pilih repository tersebut.
3. Atur **Framework Preset** ke `Vite`.
4. Pada bagian **Environment Variables**, tambahkan `VITE_API_URL` dengan URL API backend produksi Anda.
5. Klik **Deploy**. Vercel akan otomatis membangun aplikasi dan mengunggah hasilnya ke server produksi.
