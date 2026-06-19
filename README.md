# Nexa Order - Sistem Self-Order dan POS Restoran

Nexa Order adalah platform Point of Sale (POS) dan Self-Ordering berbasis QR Code yang dirancang khusus untuk UMKM F&B. Sistem ini memisahkan antarmuka untuk Customer (pemesanan via HP), Kasir (manajemen pesanan), dan Admin (manajemen toko).

Proyek ini dibangun menggunakan arsitektur monorepo yang memisahkan aplikasi Frontend (Client) dan Backend (Server) ke dalam direktori masing-masing:
- **client/**: Aplikasi frontend menggunakan React, Vite, TypeScript, dan Tailwind CSS.
- **server/**: Aplikasi backend menggunakan Node.js, Express, Prisma ORM, dan PostgreSQL.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Direktori Proyek](#struktur-direktori-proyek)
- [Skema Database](#skema-database)
- [Dokumentasi API Endpoints](#dokumentasi-api-endpoints)
- [Mekanisme Real-Time (Server-Sent Events)](#mekanisme-real-time-server-sent-events)
- [Background Worker (Auto-Cancel Pesanan)](#background-worker-auto-cancel-pesanan)
- [Panduan Instalan & Menjalankan Lokal](#panduan-instalan--menjalankan-lokal)
- [Variabel Lingkungan (Environment Variables)](#variabel-lingkungan-environment-variables)
- [Rute Halaman & Akses](#rute-halaman--akses)
- [Panduan Deployment](#panduan-deployment)

---

## Gambaran Umum

Nexa Order dirancang sebagai solusi end-to-end untuk restoran atau kafe skala UMKM. Alur kerja utamanya adalah sebagai berikut:
1. Admin toko membuat meja dan mengunduh QR Code unik yang tergenerasi otomatis dengan token keamanan UUID.
2. Pelanggan memindai QR Code di meja menggunakan kamera HP untuk mengakses menu digital.
3. Pelanggan memesan makanan/minuman, memasukkan data diri, memilih metode pembayaran (tunai atau QRIS), lalu melakukan checkout.
4. Pesanan langsung masuk ke antrean dasbor Kasir secara real-time.
5. Kasir memproses pesanan melalui antarmuka Kanban Board dan memperbarui status pesanan.
6. Pelanggan memantau status pesanan mereka secara live pada halaman pelacakan status pesanan.

---

## Fitur Utama

### Sisi Pelanggan (Customer App - Mobile First)
- Pemindaian QR Code meja dengan sistem token UUID unik untuk keamanan akses URL.
- Katalog menu dinamis dengan fitur filter kategori, rekomendasi menu terlaris, dan pencarian cepat.
- Keranjang belanja (Cart) dan checkout persisten yang aman ketika halaman dimuat ulang.
- Dukungan pemesanan Dine-In (nomor meja otomatis terdeteksi) dan Takeaway.
- Validasi data pelanggan dan pilihan metode pembayaran (Cash / QRIS).
- Halaman tracking pesanan secara real-time dengan visualisasi stepper status pesanan (Diterima, Diproses, Siap).

### Sisi Kasir (Point of Sale & Antrean)
- Antarmuka Point of Sale (POS) interaktif untuk menginput pesanan manual secara langsung dari kasir.
- Jam digital real-time dan detail profil kasir aktif pada bar navigasi atas.
- Tampilan Kanban Board antrean pesanan (Pending, Processing, Ready) dengan indikator label Dine-In atau Takeaway.
- Struk digital terperinci yang menampilkan daftar produk, modifier, subtotal, catatan, dan total harga.
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

### Frontend (client/)
- **Core**: React (v18), Vite (v5), TypeScript.
- **State Management**: Redux Toolkit & React Redux.
- **Server State / Cache**: TanStack React Query (v5).
- **HTTP Client**: Axios.
- **Styling**: Tailwind CSS, clsx, tailwind-merge.
- **Grafik & Visual**: Recharts (Visualisasi data laporan), Lucide React (Ikon), qrcode.react (Generator QR Code).
- **Ekspor Dokumen**: jsPDF, jspdf-autotable, xlsx.

### Backend (server/)
- **Runtime & Framework**: Node.js, Express (v5).
- **ORM**: Prisma Client (v5).
- **Database**: PostgreSQL.
- **Autentikasi & Enkripsi**: JSON Web Token (JWT), bcryptjs.
- **Upload File**: Multer (untuk upload gambar lokal).
- **CORS**: cors (untuk penanganan CORS origin).
- **Dev Tool**: Nodemon (untuk auto-restart server dev).

---

## Struktur Direktori Proyek

```
nexaorder_fix/
|-- client/               # Direktori Frontend (React)
|   |-- public/           # Aset publik statis (favicon, manifest)
|   |-- src/
|   |   |-- components/   # Komponen global reusable
|   |   |-- contexts/     # React Context providers (contoh: Toast)
|   |   |-- features/     # Modul per area fitur bisnis
|   |   |   |-- auth/     # Logika login & auth state
|   |   |   |-- customer/ # Halaman & komponen sisi pelanggan
|   |   |   |-- merchant/ # Halaman & komponen admin/kasir
|   |   |   |-- platform/ # Halaman dashboard superadmin
|   |   |-- layouts/      # Layout pembungkus utama
|   |   |-- lib/          # Helper global (axios setup)
|   |   |-- store/        # Root configuration Redux store
|   |   |-- types/        # Definisi type TypeScript
|   |   |-- App.tsx       # Root component dan rute navigasi
|   |   |-- main.tsx      # Entry point renderer React
|   |-- package.json
|   |-- vercel.json       # Konfigurasi SPA routing Vercel
|
|-- server/               # Direktori Backend (Express API)
|   |-- prisma/
|   |   |-- schema.prisma # Skema database relasional
|   |   |-- seed.js       # Script inisialisasi data awal
|   |-- src/
|   |   |-- middleware/   # Middleware autentikasi JWT
|   |   |-- routes/       # Endpoint API Express per modul
|   |   |-- app.js        # File inisialisasi server Express
|   |   |-- db.js         # Singleton Prisma Client
|   |   |-- sse.js        # Konfigurasi Server-Sent Events
|   |   |-- worker.js     # Background worker auto-cancel order
|   |-- uploads/          # Tempat penyimpanan file upload lokal
|   |-- package.json
|
|-- README.md             # File dokumentasi utama ini
```

---

## Skema Database

Database dikelola menggunakan PostgreSQL melalui Prisma ORM. Berikut relasi model-model utamanya:

### 1. User
Menyimpan kredensial staf toko (Admin, Kasir, dan Superadmin).
- `id` (Int, PK, Auto-increment)
- `username` (String, Unique)
- `email` (String, Optional, Unique)
- `password` (String, Bcrypt hashed)
- `name` (String, Nama lengkap)
- `role` (String, Default: `CASHIER`, nilai lain: `MERCHANT_ADMIN`, `SUPERADMIN`)
- `status` (String, Default: `aktif`, nilai lain: `nonaktif`)
- `photo` (String, Optional, URL foto profil)

### 2. Category & Product
Klasifikasi kategori dan daftar menu makanan/minuman.
- **Category**: `id` (Int, PK), `name` (String, Unique). Memiliki relasi one-to-many ke `Product`.
- **Product**: `id` (Int, PK), `name` (String), `price` (Int), `stock` (Int), `description` (String), `image` (String), `status` (String, Default: `tersedia`).

### 3. ModifierGroup & Modifier
Sistem add-ons menu (contoh: Level Pedas, Ekstra Topping).
- **ModifierGroup**: `id` (Int, PK), `name` (String), `isRequired` (Boolean), `minSelections` (Int), `maxSelections` (Int), `productId` (Int, FK ke Product dengan Cascade Delete).
- **Modifier**: `id` (Int, PK), `name` (String), `price` (Int), `modifierGroupId` (Int, FK ke ModifierGroup dengan Cascade Delete).

### 4. TableMeja
Informasi meja restoran dan token keamanan QR Code.
- `id` (Int, PK)
- `number` (String, Unique, Nomor meja)
- `status` (String, Default: `aktif`, nilai lain: `nonaktif`)
- `qrCode` (String, Optional)
- `token` (String, Unique, UUID generator otomatis untuk URL meja)

### 5. Order & OrderItem
Data transaksi pemesanan menu.
- **Order**: `id` (Int, PK), `tableId` (Int, Optional, FK ke TableMeja), `customerName` (String), `phone` (String), `total` (Int), `status` (String, Default: `PENDING`, nilai lain: `PROCESSING`, `READY`, `CANCELLED`).
- **OrderItem**: `id` (Int, PK), `orderId` (Int, FK ke Order), `productId` (Int, FK ke Product), `quantity` (Int), `note` (String), `subtotal` (Int), `toppings` (String, Menyimpan detail pilihan modifier dalam JSON string).

### 6. Payment
Data pembayaran pesanan.
- `id` (Int, PK), `orderId` (Int, Unique, FK ke Order), `method` (String, `CASH` atau `QRIS`), `amount` (Int), `createdAt` (DateTime).

### 7. StoreProfile
Konfigurasi informasi restoran (hanya satu baris dengan ID = 1).
- `id` (Int, PK, Default: 1), `name` (String), `description` (String), `logo` (String), `address` (String), `phone` (String), `openTime` (String), `closeTime` (String).

---

## Dokumentasi API Endpoints

Semua endpoint memiliki prefix URL `/api`. Endpoint bertanda **[Private]** memerlukan header `Authorization: Bearer <token_jwt>`.

### Autentikasi (`/api/auth`)
- `POST /api/auth/login` - Login pengguna untuk mendapatkan JWT token (Publik).
- `GET /api/auth/me` - Mengambil detail profil user yang sedang aktif (Private).

### Kategori Menu (`/api/categories`)
- `GET /api/categories` - Mengambil semua kategori (Publik).
- `POST /api/categories` - Membuat kategori menu baru (Private - Admin).
- `DELETE /api/categories/:id` - Menghapus kategori menu (Private - Admin).

### Produk / Menu (`/api/products`)
- `GET /api/products` - Mengambil daftar seluruh produk beserta modifier (Publik).
- `GET /api/products/:id` - Mengambil detail satu produk (Publik).
- `POST /api/products` - Menambahkan produk beserta grup modifier (Private - Admin).
- `PUT /api/products/:id` - Mengubah data produk & modifier (Private - Admin).
- `DELETE /api/products/:id` - Menghapus produk secara permanen (Private - Admin).

### Meja Restoran (`/api/tables`)
- `GET /api/tables` - Mengambil daftar seluruh meja dan statusnya (Private).
- `POST /api/tables` - Menambahkan meja baru dan token QR-nya (Private - Admin).
- `PUT /api/tables/:id` - Mengubah status meja (Private - Admin).
- `DELETE /api/tables/:id` - Menghapus data meja (Private - Admin).

### Manajemen Pesanan (`/api/orders`)
- `GET /api/orders` - Mengambil semua pesanan (Private).
- `GET /api/orders/:id` - Mengambil detail pesanan tertentu berdasarkan ID (Publik).
- `POST /api/orders` - Membuat pesanan baru dan mengurangi stok produk secara otomatis (Publik).
- `PATCH /api/orders/:id/status` - Mengubah status pesanan: PENDING -> PROCESSING -> READY -> CANCELLED (Private).

### Transaksi Pembayaran (`/api/payments`)
- `POST /api/payments` - Mencatat pembayaran tunai/QRIS pesanan (Private).
- `GET /api/payments/history` - Mengambil seluruh riwayat transaksi pembayaran (Private).

### Manajemen Staf (`/api/users`)
- `GET /api/users` - Mengambil daftar seluruh staf kasir/admin (Private - Admin).
- `POST /api/users` - Menambahkan akun staf baru (Private - Admin).
- `PUT /api/users/:id` - Mengubah data atau status staf (Private - Admin).
- `DELETE /api/users/:id` - Menonaktifkan staf (Private - Admin).

### Statistik Laporan (`/api/dashboard`)
- `GET /api/dashboard/stats` - Mengambil ringkasan metrik performa toko (Private - Admin).
- `GET /api/dashboard/report` - Mengambil data grafik penjualan berfilter rentang waktu (Private - Admin).

### Upload Media (`/api/upload`)
- `POST /api/upload` - Mengunggah file gambar ke server lokal atau cloud ImgBB (Private).

### Server-Sent Events (`/api/sse`)
- `GET /api/sse` - Membuka jalur streaming real-time status pesanan (Token JWT atau query `orderId` wajib dilampirkan).

---

## Mekanisme Real-Time (Server-Sent Events)

Sistem menggunakan Server-Sent Events (SSE) sebagai saluran streaming real-time satu arah dari server ke client tanpa membebani browser dengan polling periodik API:
- **Penerima Kasir**: Kasir membuka koneksi dengan JWT token (`/api/sse?token=...`). Kasir akan secara instan menerima event `new-order` (ketika ada pelanggan memesan) dan `order-updated` (ketika pesanan diubah).
- **Penerima Pelanggan**: Halaman tracking pelanggan membuka koneksi dengan orderId (`/api/sse?orderId=...`). Pelanggan hanya akan menerima event `order-updated` jika ID pesanan yang terubah cocok dengan miliknya, sehingga memicu pergeseran animasi stepper status.
- **Heartbeat**: Server mengirim data string `: heartbeat` setiap 30 detik secara otomatis untuk menjaga agar koneksi streaming tidak diputus paksa oleh proxy jaringan.

---

## Background Worker (Auto-Cancel Pesanan)

Backend menjalankan background worker otomatis menggunakan `setInterval` yang aktif sejak server pertama kali menyala:
- **Siklus**: Berjalan otomatis setiap 60 detik sekali.
- **Logika**: Mencari seluruh pesanan berstatus `PENDING` yang telah terbengkalai melebihi waktu 15 menit sejak pesanan dibuat.
- **Restorasi Stok**: Membatalkan pesanan secara atomik (`status` berubah menjadi `CANCELLED`), lalu mengembalikan jumlah kuantitas item pesanan ke stok produk masing-masing dan mereset status produk ke `tersedia` apabila sebelumnya stoknya kosong/habis.
- **SSE Emit**: Memancarkan event `order-updated` ke koneksi kasir aktif agar visual dasbor langsung ter-update secara otomatis.

---

## Panduan Instalan & Menjalankan Lokal

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan aplikasi di komputer lokal Anda:

### 1. Clone Repository

```bash
git clone https://github.com/Adityamewmew/nexaorder_fix.git
cd nexaorder_fix
```

### 2. Setup dan Jalankan Backend (Server)

1. Masuk ke direktori server:
   ```bash
   cd server
   ```
2. Install seluruh dependensi backend:
   ```bash
   npm install
   ```
3. Konfigurasi Environment Variables:
   Buat berkas `.env` di root direktori `server/` (sejajar dengan file `package.json` server) menggunakan template berkas `.env.example` yang telah disediakan:
   ```bash
   copy .env.example .env
   ```
   Buka file `.env` tersebut lalu ubah `DATABASE_URL` sesuai dengan alamat PostgreSQL lokal atau cloud database milik Anda.
4. Jalankan Migrasi Database (untuk membuat tabel-tabel sesuai dengan skema Prisma):
   ```bash
   npx prisma migrate dev
   ```
5. Isi Data Awal / Seed (untuk membuat akun admin default, kategori, dan menu sampel):
   ```bash
   npm run seed
   ```
6. Jalankan server dalam mode development:
   ```bash
   npm run dev
   ```
   Backend akan aktif di port `http://localhost:5000`.

### 3. Setup dan Jalankan Frontend (Client)

1. Buka jendela terminal baru lalu masuk ke direktori client:
   ```bash
   cd client
   ```
2. Install seluruh dependensi frontend:
   ```bash
   npm install
   ```
3. Konfigurasi Environment Variables:
   Buat berkas `.env` di root direktori `client/` (sejajar dengan file `package.json` client) menggunakan template berkas `.env.example` yang telah disediakan:
   ```bash
   copy .env.example .env
   ```
   Buka berkas `.env` tersebut dan pastikan variabel URL backend terisi dengan benar:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Jalankan aplikasi frontend dalam mode development:
   ```bash
   npm run dev
   ```
   Aplikasi frontend akan aktif di alamat `http://localhost:5173`. Buka alamat tersebut di browser Anda untuk menjalankan aplikasi.

---

## Variabel Lingkungan (Environment Variables)

### Backend (server/.env)
- `DATABASE_URL`: URL koneksi database PostgreSQL (contoh: `postgresql://username:password@localhost:5432/nexaorder?schema=public`).
- `JWT_SECRET`: Kunci rahasia unik untuk enkripsi token JWT (contoh: `nexaorder_secret_key_2026`).
- `PORT`: Port server backend dijalankan (default: `5000`).
- `MIDTRANS_SERVER_KEY`: Server Key integration dari dashboard Midtrans (sandbox/production).
- `MIDTRANS_CLIENT_KEY`: Client Key integration dari dashboard Midtrans.
- `IMGBB_API_KEY`: API Key dari ImgBB untuk cloud hosting gambar secara permanen (opsional).

### Frontend (client/.env)
- `VITE_API_URL`: URL utama pemanggilan API backend (contoh: `http://localhost:5000/api`).

---

## Rute Halaman & Akses

Aplikasi frontend membatasi rute halaman berdasarkan role pengguna yang login:

| Rute URL | Tampilan Halaman | Hak Akses | Keterangan |
|---|---|---|---|
| `/` | Landing Page | Publik | Halaman beranda utama dengan tombol demo |
| `/merchant/login` | Login Staf | Publik | Halaman login untuk kasir dan merchant admin |
| `/platform/login` | Login Superadmin | Publik | Halaman login khusus untuk pengelola platform |
| `/platform/dashboard`| Dasbor Platform | SUPERADMIN | Statistik global total transaksi platform |
| `/platform/tenants` | Manajemen Tenant | SUPERADMIN | Kelola pendaftaran tenant merchant restoran |
| `/merchant/dashboard`| Dasbor Merchant | MERCHANT_ADMIN| Metrik ringkasan pendapatan & grafik toko |
| `/merchant/pos` | Point of Sale | CASHIER | Interface pencatatan pesanan manual kasir |
| `/merchant/orders` | Order Board | MERCHANT_ADMIN, CASHIER| Kanban board pemrosesan status antrean pesanan |
| `/merchant/menu` | Daftar Produk | MERCHANT_ADMIN, CASHIER| Daftar seluruh produk restoran |
| `/merchant/menu/add` | Tambah Produk | MERCHANT_ADMIN| Form tambah produk dan grup modifier baru |
| `/merchant/menu/edit/:id`| Edit Produk | MERCHANT_ADMIN| Form edit produk dan grup modifier |
| `/merchant/tables` | Daftar Meja | MERCHANT_ADMIN| Kelola meja dan unduh file QR Code meja |
| `/merchant/staff` | Daftar Staf | MERCHANT_ADMIN| Kelola data akun staf kasir/admin toko |
| `/merchant/reports` | Laporan Penjualan| MERCHANT_ADMIN, CASHIER| Filter data laporan & ekspor file ke CSV/PDF |
| `/merchant/profile` | Profil Toko | MERCHANT_ADMIN, CASHIER| Pengaturan detail informasi dan logo toko |
| `/m/:tenantId/:tableToken`| Katalog Menu | Publik | Katalog menu digital pelanggan via QR Code |
| `/m/:tenantId/:tableToken/cart`| Keranjang Belanja| Publik | Ringkasan daftar belanjaan pelanggan |
| `/m/:tenantId/:tableToken/checkout`| Checkout | Publik | Validasi data checkout pelanggan |
| `/m/:tenantId/:tableToken/status/:orderId`| Pelacakan Status| Publik | Pelacakan status pemesanan real-time via SSE |

---

## Panduan Deployment

### 1. Database (Neon / Supabase)
Gunakan provider cloud terkelola seperti Supabase atau Neon untuk hosting database PostgreSQL. Ambil connection string dari dashboard cloud database Anda dan masukkan ke variabel `DATABASE_URL` di konfigurasi environment backend produksi Anda.

### 2. Frontend (Vercel)
Aplikasi frontend telah menyertakan konfigurasi `client/vercel.json` untuk SPA router:
```json
{
  "cleanUrls": true,
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```
Langkah deploy:
1. Hubungkan akun Vercel Anda dengan repositori `nexaorder_fix`.
2. Tentukan **Root Directory** ke folder `client/`.
3. Set **Framework Preset** ke `Vite`.
4. Masukkan environment variable `VITE_API_URL` dengan alamat URL backend produksi Anda (contoh: `https://api-nexaorder.up.railway.app/api`).
5. Klik **Deploy**.

### 3. Backend (Railway / Render)
Langkah deploy:
1. Hubungkan platform Railway/Render Anda dengan repositori `nexaorder_fix`.
2. Tentukan sub-direktori ke folder `server/` (jika menggunakan Railway, Anda dapat mengatur root directory ke folder `server/`).
3. Set start command ke `npm start` (yang akan mengeksekusi script `node src/app.js`).
4. Daftarkan seluruh Environment Variables yang dibutuhkan (seperti `DATABASE_URL`, `JWT_SECRET`, `PORT`, dll.) pada pengaturan environment platform.
5. Jalankan command `npx prisma migrate deploy` pada build step/release phase produksi untuk menerapkan perubahan skema database secara otomatis.
