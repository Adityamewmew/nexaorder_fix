# Nexa Order - Backend Server

Repository ini berisi kode sumber backend (server API) untuk platform Nexa Order, yaitu sistem Self-Order dan Point of Sale (POS) berbasis QR Code untuk usaha kuliner (F&B). REST API ini dibangun menggunakan Node.js, Express, Prisma ORM, dan PostgreSQL.

---

## Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Struktur Direktori](#struktur-direktori)
- [Skema Database (PostgreSQL)](#skema-database-postgresql)
- [Dokumentasi API Endpoints](#dokumentasi-api-endpoints)
- [Mekanisme Real-Time (Server-Sent Events)](#mekanisme-real-time-server-sent-events)
- [Background Worker (Auto-Cancel Pesanan)](#background-worker-auto-cancel-pesanan)
- [Panduan Instalan Lokal](#panduan-instalan-lokal)
- [Variabel Lingkungan (Environment Variables)](#variabel-lingkungan-environment-variables)
- [Panduan Deployment](#panduan-deployment)

---

## Gambaran Umum

Layanan backend ini bertanggung jawab atas:
1. Penyediaan REST API untuk aplikasi pelanggan (customer) dan aplikasi merchant/kasir.
2. Manajemen database PostgreSQL melalui Prisma ORM (migrasi, seeding, query terstruktur).
3. Autentikasi dan otorisasi berbasis JSON Web Token (JWT) dengan enkripsi password menggunakan bcryptjs.
4. Broadcast notifikasi pesanan baru dan update status pesanan secara real-time menggunakan Server-Sent Events (SSE).
5. Pembersihan otomatis transaksi kedaluwarsa via background worker untuk mengamankan ketersediaan stok produk.
6. Upload dan hosting gambar secara lokal (via Multer) atau eksternal (via ImgBB API).

---

## Teknologi yang Digunakan

Layanan server ini dibangun dengan teknologi berikut:

| Kategori | Pustaka / Tools | Versi | Deskripsi |
|---|---|---|---|
| Runtime | Node.js | >= 18.x | Runtime JavaScript server-side |
| Framework | Express | ^5.2.1 | Minimalist web framework untuk API |
| Database | PostgreSQL | - | Sistem manajemen database relasional |
| ORM | Prisma Client | ^5.22.0 | Query builder dan skema database relasional |
| Migrasi | Prisma CLI | ^5.22.0 | Manajemen migrasi database |
| Autentikasi| jsonwebtoken | ^9.0.3 | Token-based session management |
| Enkripsi | bcryptjs | ^3.0.3 | Hashing password sebelum disimpan |
| Upload | Multer | ^2.1.1 | Middleware untuk penanganan file upload |
| CORS | cors | ^2.8.6 | Penanganan cross-origin requests |
| Dev Tool | Nodemon | ^3.1.14 | Auto-restart server selama pengembangan |
| Config | dotenv | ^16.4.5 | Penanganan variabel lingkungan lokal |
| Driver DB | pg | ^8.21.0 | PostgreSQL client driver |

---

## Struktur Direktori

Berikut penjelasan struktur folder pada direktori backend:

```
server/
|-- prisma/
|   |-- schema.prisma       # Definisi model database relasional
|   |-- seed.js             # Data awal untuk testing & setup awal
|   |-- migrations/         # File SQL hasil generate migrasi Prisma
|-- src/
|   |-- middleware/         # Middleware verifikasi token JWT
|   |-- routes/             # Handler route API Express
|   |   |-- auth.js         # Endpoint login & data profil aktif
|   |   |-- dashboard.js    # Data laporan & statistik penjualan
|   |   |-- kategori.js     # Manajemen kategori menu
|   |   |-- orders.js       # Pembuatan & pembaruan status pesanan
|   |   |-- payments.js     # Pencatatan pembayaran transaksi
|   |   |-- products.js     # Manajemen produk & modifier menu
|   |   |-- tables.js       # Manajemen meja & token QR Code
|   |   |-- upload.js       # Handler upload gambar produk/staf
|   |   |-- users.js        # Manajemen akun staf kasir/admin
|   |-- app.js              # Entry point utama inisialisasi Express & port
|   |-- db.js               # Inisialisasi Prisma Client global
|   |-- sse.js              # Penanganan koneksi Server-Sent Events
|   |-- worker.js           # Worker background untuk pembersihan data
|-- uploads/                # Folder penyimpanan upload gambar lokal
|-- package.json            # Konfigurasi dependensi server
```

---

## Skema Database (PostgreSQL)

Berikut adalah struktur tabel yang didefinisikan dalam file `prisma/schema.prisma`:

### 1. User
Akun pengguna sistem (Admin, Kasir, atau Superadmin).
- `id` (Int, PK, Auto-increment)
- `username` (String, Unique)
- `email` (String, Optional, Unique)
- `password` (String, Bcrypt hashed)
- `name` (String, Nama tampilan)
- `role` (String, Default: `CASHIER`, nilai lain: `MERCHANT_ADMIN`, `SUPERADMIN`)
- `status` (String, Default: `aktif`, nilai lain: `nonaktif`)
- `photo` (String, Optional, URL foto profil)
- `createdAt` / `updatedAt` (DateTime)

### 2. Category
Kategori klasifikasi menu produk.
- `id` (Int, PK, Auto-increment)
- `name` (String, Unique)

### 3. Product
Menu makanan, minuman, atau snack yang dijual.
- `id` (Int, PK, Auto-increment)
- `name` (String)
- `price` (Int, Harga dalam Rupiah)
- `stock` (Int, Default: 0)
- `description` (String, Optional)
- `image` (String, Optional, URL gambar)
- `status` (String, Default: `tersedia`, nilai lain: `habis`)
- `categoryId` (Int, FK ke Category)

### 4. ModifierGroup
Grup pilihan tambahan untuk menu (contoh: Level Pedas, Pilihan Topping).
- `id` (Int, PK, Auto-increment)
- `name` (String, Nama grup)
- `isRequired` (Boolean, Default: false)
- `minSelections` (Int, Default: 0)
- `maxSelections` (Int, Default: 1)
- `productId` (Int, FK ke Product dengan Cascade Delete)

### 5. Modifier
Item pilihan di dalam grup modifier (contoh: Level 1, Level 2, Ekstra Keju).
- `id` (Int, PK, Auto-increment)
- `name` (String)
- `price` (Int, Default: 0, harga tambahan jika ada)
- `modifierGroupId` (Int, FK ke ModifierGroup dengan Cascade Delete)

### 6. TableMeja
Informasi meja restoran.
- `id` (Int, PK, Auto-increment)
- `number` (String, Unique, Nomor meja)
- `status` (String, Default: `aktif`, nilai lain: `nonaktif`)
- `qrCode` (String, Optional, Data QR)
- `token` (String, Unique, UUID generator otomatis untuk URL token)

### 7. Order
Transaksi pemesanan.
- `id` (Int, PK, Auto-increment)
- `tableId` (Int, Optional, FK ke TableMeja, null jika Takeaway)
- `customerName` (String, Optional)
- `phone` (String, Optional)
- `total` (Int, Total belanja)
- `status` (String, Default: `PENDING`, nilai lain: `PROCESSING`, `READY`, `CANCELLED`)
- `createdAt` / `updatedAt` (DateTime)

### 8. OrderItem
Detail item menu yang ada dalam pesanan.
- `id` (Int, PK, Auto-increment)
- `orderId` (Int, FK ke Order dengan Cascade Delete)
- `productId` (Int, Optional, FK ke Product, SetNull jika produk dihapus)
- `quantity` (Int)
- `note` (String, Optional, Catatan khusus item)
- `subtotal` (Int)
- `toppings` (String, Optional, Menyimpan pilihan modifier dalam JSON string)

### 9. Payment
Detail data pembayaran pesanan.
- `id` (Int, PK, Auto-increment)
- `orderId` (Int, Unique, FK ke Order)
- `method` (String, Metode pembayaran: `CASH` atau `QRIS`)
- `amount` (Int, Jumlah yang dibayarkan)
- `createdAt` (DateTime)

### 10. StoreProfile
Pengaturan profil restoran (hanya satu baris dengan ID = 1).
- `id` (Int, PK, Default: 1)
- `name` (String, Default: Nexa Order)
- `description` (String, Optional)
- `logo` (String, Optional, URL logo)
- `address` (String, Optional)
- `phone` (String, Optional)
- `openTime` (String, Default: 08:00)
- `closeTime` (String, Default: 22:00)

---

## Dokumentasi API Endpoints

Semua request API menggunakan prefix URL `/api`. Endpoint bertanda **[Private]** memerlukan header `Authorization: Bearer <jwt_token>`.

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

Sistem menggunakan pustaka event bawaan Node.js (`EventEmitter`) untuk memancarkan pesan ke client yang terhubung ke server lewat Express SSE:
- **Koneksi Kasir**: Membutuhkan token JWT sebagai parameter query. Kasir akan menerima broadcast event `new-order` dan `order-updated`.
- **Koneksi Pelanggan**: Menggunakan parameter query `orderId`. Pelanggan hanya akan menerima event `order-updated` apabila id pesanan yang diubah cocok dengan orderId pelanggan.
- **Heartbeat**: Server mengirimkan string kosong `: heartbeat` setiap 30 detik secara otomatis untuk mencegah timeout koneksi dari proxy jaringan (seperti Nginx atau cloud provider).

---

## Background Worker (Auto-Cancel Pesanan)

Backend menjalankan proses background berkala menggunakan `setInterval` yang aktif sejak `app.js` dijalankan:
- **Interval**: Berjalan otomatis setiap 60 detik sekali.
- **Logika**: Mencari semua transaksi berstatus `PENDING` yang telah melewati batas waktu 15 menit sejak pesanan dibuat.
- **Restorasi Stok**: Membatalkan pesanan secara atomik (`status` menjadi `CANCELLED`), mengembalikan jumlah kuantitas item pesanan ke stok produk terkait, serta memperbarui status ketersediaan produk jika sebelumnya habis.
- **Sinkronisasi Kasir**: Memancarkan event `order-updated` ke SSE agar layar Kasir memperbarui status secara otomatis.

---

## Panduan Instalan Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan server API secara lokal:

### 1. Clone Repository

```bash
git clone https://github.com/Adityamewmew/NexaOrder_BackEnd.git
cd NexaOrder_BackEnd
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Database dan Environment

Buat file `.env` di root direktori server Anda dan isi variabel lingkungan yang dibutuhkan (gunakan bagian [Variabel Lingkungan](#variabel-lingkungan-environment-variables) sebagai acuan).

### 4. Jalankan Migrasi Database

Lakukan inisialisasi tabel database menggunakan migrasi Prisma:

```bash
npx prisma migrate dev
```

### 5. Jalankan Seed Data (Opsional)

Untuk mengisi data uji coba awal (seperti akun admin default, kategori, dan menu sampel):

```bash
npm run seed
```

### 6. Jalankan Server API

Untuk menjalankan server dalam mode development (menggunakan Nodemon):

```bash
npm run dev
```

Server akan aktif dan siap menerima request di port default `http://localhost:5000`.

---

## Variabel Lingkungan (Environment Variables)

Isi file `server/.env` Anda dengan variabel-variabel berikut:

| Nama Variabel | Deskripsi | Contoh Nilai |
|---|---|---|
| `DATABASE_URL` | Koneksi URL database PostgreSQL Anda | `postgresql://username:password@localhost:5432/nexaorder?schema=public` |
| `JWT_SECRET` | Kunci rahasia untuk menandatangani token JWT | `nexaorder_secret_key_2026` |
| `PORT` | Port server Express dijalankan | `5000` |
| `MIDTRANS_SERVER_KEY` | Server Key dari portal sandbox/production Midtrans | `Mid-server-xxxxxxxxx` |
| `MIDTRANS_CLIENT_KEY` | Client Key dari portal sandbox/production Midtrans | `Mid-client-xxxxxxxxx` |
| `IMGBB_API_KEY` | API Key ImgBB untuk cloud hosting gambar (opsional) | `xxxxxxxxxxxxxxxxxxxx` |

---

## Panduan Deployment

### 1. Database PostgreSQL
Gunakan PostgreSQL terkelola seperti **Supabase**, **Neon.tech**, atau **Aiven** untuk performa produksi yang stabil. Jangan lupa menambahkan parameter `?sslmode=require` jika diwajibkan oleh provider cloud database Anda.

### 2. Node.js API (Render / Railway / VPS)
- **Railway/Render**: Cukup hubungkan repository server ini, tentukan start command ke `npm start`, dan atur Environment Variables di portal dashboard penyedia cloud.
- **Prisma Migrasi**: Jalankan perintah `npx prisma migrate deploy` pada proses build step deployment produksi untuk memastikan skema tabel database terupdate sebelum server API dijalankan.
