# Pembagian Tugas Backend — Nexa Order

## Tech Stack
- Runtime: Node.js + Express
- ORM: Prisma v7
- Database: PostgreSQL (Neon)
- Auth: JWT (jsonwebtoken)
- Password: bcryptjs
- Upload: multer

## Struktur Folder Backend
```
server/
├── src/
│   ├── app.js              ← entry point Express
│   ├── db.js               ← koneksi Prisma
│   ├── middleware/
│   │   └── auth.js         ← JWT middleware + role guard
│   └── routes/
│       ├── auth.js
│       ├── categories.js
│       ├── products.js
│       ├── tables.js
│       ├── orders.js
│       ├── payments.js
│       ├── users.js
│       ├── dashboard.js
│       └── upload.js
├── prisma/
│   ├── schema.prisma       ← sudah ada, jangan diubah
│   └── seed.js
└── .env                    ← sudah ada, jangan diubah
```

---

---

# 👤 ADITYA — Backend Admin & Kasir

## Deskripsi Umum
Kamu bertanggung jawab atas semua endpoint yang digunakan oleh
Admin (MERCHANT_ADMIN) dan Kasir (CASHIER) untuk mengelola toko.
Termasuk setup awal server, auth, dan semua fitur manajemen.

---

## TASK 1 — Setup Awal Server

### 1a. `src/db.js`
Koneksi Prisma ke database Neon PostgreSQL.

```js
// Gunakan PrismaClient dengan adapter pg (Prisma v7)
// Import: @prisma/client, @prisma/adapter-pg, pg
// Baca DATABASE_URL dari process.env
// Export: prisma instance
```

### 1b. `src/app.js`
Entry point Express. Setup middleware dan daftarkan semua routes.

```js
// Setup:
// - dotenv.config()
// - express()
// - cors()
// - express.json()
// - express.static untuk folder uploads/
//
// Daftarkan routes:
// app.use('/api/auth', authRoutes)
// app.use('/api/categories', categoryRoutes)
// app.use('/api/products', productRoutes)
// app.use('/api/tables', tableRoutes)
// app.use('/api/orders', orderRoutes)
// app.use('/api/payments', paymentRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/dashboard', dashboardRoutes)
// app.use('/api/upload', uploadRoutes)
//
// app.listen(PORT || 5000)
```

### 1c. `src/middleware/auth.js`
JWT middleware untuk proteksi endpoint.

```js
// authMiddleware(req, res, next)
//   - Ambil token dari header: Authorization: Bearer <token>
//   - Verifikasi dengan JWT_SECRET
//   - Simpan decoded ke req.user
//   - Jika tidak ada token → 401
//   - Jika token invalid → 401

// adminOnly(req, res, next)
//   - Cek req.user.role === 'MERCHANT_ADMIN' atau 'SUPERADMIN'
//   - Jika bukan → 403
```

### 1d. `prisma/seed.js`
Isi data awal database.

```js
// Buat user superadmin:
//   username: 'superadmin', email: 'admin@nexaorder.com'
//   password: 'admin123' (di-hash bcrypt), role: 'SUPERADMIN'
//
// Buat user merchant admin:
//   username: 'admin', email: 'arifin@bakso.com'
//   password: 'admin123' (di-hash bcrypt), role: 'MERCHANT_ADMIN'
//
// Buat 3 kategori default:
//   'Makanan', 'Minuman', 'Lainnya'
//
// Gunakan upsert agar bisa dijalankan berulang tanpa error duplikat
```

---

## TASK 2 — `src/routes/auth.js`

### POST `/api/auth/login`
Login untuk semua role (superadmin, admin, kasir).

```
Request body:
{
  "email": "arifin@bakso.com",   // bisa pakai email ATAU username
  "password": "admin123"
}

Response sukses (200):
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "arifin@bakso.com",
    "name": "Arifin (Pemilik)",
    "role": "MERCHANT_ADMIN"
  }
}

Response gagal (401): { "error": "Username/email atau password salah" }
Response nonaktif (403): { "error": "Akun nonaktif" }
```

Catatan:
- Cari user by email ATAU username (pakai `findFirst` dengan `OR`)
- Bandingkan password dengan `bcrypt.compare()`
- Generate token dengan `jwt.sign()`, expire 24 jam
- Simpan di token: `{ id, username, email, role, name }`

### POST `/api/auth/register`
Buat akun kasir baru. Hanya admin yang boleh.

```
Middleware: authMiddleware, adminOnly

Request body:
{
  "username": "kasir1",
  "email": "kasir1@bakso.com",   // opsional
  "password": "password123",
  "name": "Budi Kasir",
  "role": "CASHIER",             // default CASHIER
  "photo": "http://..."          // opsional
}

Response sukses (201):
{
  "id": 2,
  "username": "kasir1",
  "name": "Budi Kasir",
  "role": "CASHIER"
}

Response gagal (400): { "error": "Username atau email sudah digunakan" }
```

---

## TASK 3 — `src/routes/categories.js`

### GET `/api/categories`
Ambil semua kategori. Publik, tidak perlu login.

```
Response (200):
[
  { "id": 1, "name": "Makanan", "products": [...] },
  { "id": 2, "name": "Minuman", "products": [...] },
  { "id": 3, "name": "Lainnya", "products": [...] }
]
```

### POST `/api/categories`
Tambah kategori baru. Hanya admin.

```
Middleware: authMiddleware, adminOnly

Request body: { "name": "Snack" }
Response (201): { "id": 4, "name": "Snack" }
Response gagal (400): { "error": "Nama kategori wajib" }
```

### DELETE `/api/categories/:id`
Hapus kategori. Hanya admin.

```
Middleware: authMiddleware, adminOnly
Response (200): { "message": "Kategori dihapus" }
```

---

## TASK 4 — `src/routes/products.js`

### GET `/api/products`
Ambil semua produk. Publik. Bisa filter by categoryId.

```
Query params: ?categoryId=1 (opsional)

Response (200):
[
  {
    "id": 1,
    "name": "Bakso Urat",
    "price": 20000,
    "stock": 50,
    "description": "...",
    "image": "http://localhost:5000/uploads/xxx.jpg",
    "status": "tersedia",
    "categoryId": 1,
    "category": { "id": 1, "name": "Makanan" }
  },
  ...
]
```

### GET `/api/products/:id`
Detail satu produk. Publik.

```
Response (200): { ...product, category: {...} }
Response (404): { "error": "Produk tidak ditemukan" }
```

### POST `/api/products`
Tambah produk baru. Hanya admin.

```
Middleware: authMiddleware, adminOnly

Request body:
{
  "name": "Bakso Spesial",
  "price": 25000,
  "stock": 30,
  "description": "...",
  "image": "http://...",    // URL dari /api/upload
  "categoryId": 1,
  "status": "tersedia"      // default "tersedia"
}

Response (201): { ...product }
Response (400): { "error": "Nama, harga, dan kategori wajib" }
```

### PUT `/api/products/:id`
Edit produk. Hanya admin.

```
Middleware: authMiddleware, adminOnly
Request body: field yang ingin diubah (semua opsional)
Response (200): { ...product }
```

### PATCH `/api/products/:id/stock`
Update stok saja. Admin dan kasir boleh.

```
Middleware: authMiddleware

Request body:
{
  "stock": 10,          // opsional
  "status": "habis"     // opsional: "tersedia" atau "habis"
}

Response (200): { ...product }
```

### DELETE `/api/products/:id`
Hapus produk. Hanya admin.

```
Middleware: authMiddleware, adminOnly
Response (200): { "message": "Produk dihapus" }
```

---

## TASK 5 — `src/routes/tables.js`

### GET `/api/tables`
Ambil semua meja. Publik (customer perlu ini untuk validasi tableId).

```
Response (200):
[
  { "id": 1, "number": "Meja 01", "status": "aktif", "qrCode": null },
  ...
]
```

### POST `/api/tables`
Tambah meja baru. Hanya admin.

```
Middleware: authMiddleware, adminOnly

Request body:
{
  "number": "Meja 05",
  "status": "aktif"    // default "aktif"
}

Response (201): { "id": 5, "number": "Meja 05", "status": "aktif" }
Response (400): { "error": "Nomor meja wajib" }
Response (400): { "error": "Nomor meja sudah ada" }  // jika duplikat
```

### PUT `/api/tables/:id`
Edit meja (ubah nomor atau status). Hanya admin.

```
Middleware: authMiddleware, adminOnly
Request body: { "number": "Meja 05", "status": "nonaktif" }
Response (200): { ...table }
```

### DELETE `/api/tables/:id`
Hapus meja. Hanya admin.

```
Middleware: authMiddleware, adminOnly
Response (200): { "message": "Meja dihapus" }
```

---

## TASK 6 — `src/routes/orders.js` (bagian kasir/admin)

Catatan: Ravi juga mengerjakan file ini (bagian customer).
Koordinasi dengan Ravi agar digabung jadi satu file.

### GET `/api/orders`
Ambil semua pesanan. Kasir dan admin.

```
Middleware: authMiddleware

Query params: ?status=PENDING (opsional)
  Status yang valid: PENDING, PROCESS, DONE

Response (200):
[
  {
    "id": 1,
    "status": "PENDING",
    "total": 45000,
    "customerName": "Budi",
    "createdAt": "2026-05-28T...",
    "table": { "id": 1, "number": "Meja 01" },
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "subtotal": 40000,
        "note": "tanpa bawang",
        "product": { "id": 1, "name": "Bakso Urat", "price": 20000 }
      }
    ],
    "payment": { "id": 1, "method": "CASH", "amount": 45000 }
  }
]
```

### PATCH `/api/orders/:id/status`
Update status pesanan. Kasir dan admin.

```
Middleware: authMiddleware

Request body: { "status": "PROCESS" }
  Status valid: PENDING → PROCESS → DONE

Response (200): { ...order }
Response (400): { "error": "Status tidak valid" }
```

---

## TASK 7 — `src/routes/users.js`

### GET `/api/users`
Ambil semua user. Hanya admin. Bisa filter by role.

```
Middleware: authMiddleware, adminOnly

Query params: ?role=CASHIER (opsional)

Response (200):
[
  {
    "id": 2,
    "username": "kasir1",
    "name": "Budi Kasir",
    "role": "CASHIER",
    "status": "aktif",
    "photo": null,
    "createdAt": "2026-05-28T..."
  }
]
```

### PATCH `/api/users/:id`
Edit nama atau status akun. Hanya admin.

```
Middleware: authMiddleware, adminOnly

Request body:
{
  "name": "Budi Santoso",    // opsional
  "status": "nonaktif"       // opsional: "aktif" atau "nonaktif"
}

Response (200): { id, username, name, role, status }
```

### PATCH `/api/users/:id/reset-password`
Reset password kasir. Hanya admin.

```
Middleware: authMiddleware, adminOnly

Request body: { "password": "passwordbaru123" }
Response (200): { "message": "Password berhasil direset" }
Response (400): { "error": "Password baru wajib" }
```

### DELETE `/api/users/:id`
Hapus akun kasir. Hanya admin.

```
Middleware: authMiddleware, adminOnly
Response (200): { "message": "User dihapus" }
```

---

## TASK 8 — `src/routes/dashboard.js`

### GET `/api/dashboard`
Statistik ringkasan hari ini. Admin dan kasir.

```
Middleware: authMiddleware

Response (200):
{
  "totalMenu": 24,
  "totalMeja": 10,
  "totalKasir": 3,
  "transaksiHariIni": 15,
  "penjualanHariIni": 450000
}
```

Cara hitung:
- `totalMenu` → `prisma.product.count()`
- `totalMeja` → `prisma.tableMeja.count()`
- `totalKasir` → `prisma.user.count({ where: { role: 'CASHIER' } })`
- `transaksiHariIni` → `prisma.order.count({ where: { createdAt: { gte: today } } })`
- `penjualanHariIni` → `prisma.order.aggregate({ _sum: { total: true }, where: { status: 'DONE', createdAt: { gte: today } } })`

### GET `/api/dashboard/sales`
Laporan penjualan dengan filter tanggal. Admin dan kasir.

```
Middleware: authMiddleware

Query params:
  ?startDate=2026-05-01   (opsional)
  ?endDate=2026-05-31     (opsional)

Response (200):
{
  "orders": [
    {
      "id": 1,
      "total": 45000,
      "status": "DONE",
      "createdAt": "2026-05-28T...",
      "items": [...],
      "payment": { "method": "CASH" },
      "table": { "number": "Meja 01" }
    }
  ],
  "summary": {
    "totalPendapatan": 450000,
    "totalTransaksi": 15,
    "totalItemTerjual": 42
  }
}
```

---

## TASK 9 — `src/routes/upload.js`

### POST `/api/upload`
Upload gambar produk atau foto profil. Admin dan kasir.

```
Middleware: authMiddleware
Content-Type: multipart/form-data
Field name: "image"

Validasi:
- Format: JPG, PNG, WebP saja
- Ukuran max: 2MB
- Simpan ke folder: server/uploads/
- Nama file: timestamp + random + ekstensi (misal: 1716900000000-123456.jpg)

Response (200): { "url": "/uploads/1716900000000-123456.jpg" }
Response (400): { "error": "Tidak ada file yang diupload" }
Response (400): { "error": "Format file tidak didukung" }
```

Catatan: Folder `uploads/` harus dibuat otomatis jika belum ada.
File bisa diakses via: `http://localhost:5000/uploads/namafile.jpg`

---

---

# 👤 RAVI — Backend Customer + Integrasi Frontend Customer

## Deskripsi Umum
Ravi bertanggung jawab atas endpoint yang digunakan customer
(tidak perlu login) dan menyambungkan halaman customer di frontend
ke backend.

---

## TASK 1 — `src/routes/orders.js` (bagian customer)

Koordinasi dengan Aditya — ini file yang sama, digabung jadi satu.
Aditya buat bagian GET dan PATCH, Ravi buat bagian POST dan GET/:id.

### POST `/api/orders`
Customer buat pesanan baru. Tidak perlu login.

```
Request body:
{
  "tableId": 1,
  "customerName": "Budi",    // opsional
  "phone": "08123456789",    // opsional
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "note": "tanpa bawang",   // opsional
      "toppings": null          // opsional
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}

Response sukses (201):
{
  "id": 1,
  "tableId": 1,
  "total": 55000,
  "status": "PENDING",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "subtotal": 40000,
      "note": "tanpa bawang",
      "product": { "id": 1, "name": "Bakso Urat", "price": 20000 }
    }
  ]
}

Response gagal (400): { "error": "tableId dan items wajib" }
Response gagal (400): { "error": "Produk ID 99 tidak ditemukan" }
```

Cara hitung total:
- Loop setiap item → cari harga produk dari database
- `subtotal = product.price * item.quantity`
- `total = jumlah semua subtotal`

### GET `/api/orders/:id`
Customer cek status pesanannya. Tidak perlu login.

```
Response (200):
{
  "id": 1,
  "status": "PROCESS",
  "total": 55000,
  "createdAt": "2026-05-28T...",
  "table": { "id": 1, "number": "Meja 01" },
  "items": [
    {
      "quantity": 2,
      "subtotal": 40000,
      "note": "tanpa bawang",
      "product": { "name": "Bakso Urat", "price": 20000 }
    }
  ],
  "payment": { "method": "CASH", "amount": 55000 }
}

Response (404): { "error": "Pesanan tidak ditemukan" }
```

---

## TASK 2 — `src/routes/payments.js`

### POST `/api/payments`
Customer bayar pesanan. Tidak perlu login.

```
Request body:
{
  "orderId": 1,
  "method": "CASH"    // "CASH" atau "QRIS"
}

Response sukses (201):
{
  "id": 1,
  "orderId": 1,
  "method": "CASH",
  "amount": 55000,
  "createdAt": "2026-05-28T..."
}

Response gagal (400): { "error": "orderId dan method wajib" }
Response gagal (400): { "error": "Method harus CASH atau QRIS" }
Response gagal (404): { "error": "Pesanan tidak ditemukan" }
Response gagal (400): { "error": "Pembayaran sudah ada untuk pesanan ini" }
```

Catatan:
- Ambil `amount` dari `order.total` (jangan dari request body)
- Cek apakah payment sudah ada untuk orderId tersebut (unique constraint)

---

## TASK 3 — Integrasi Frontend: `MenuCatalogPage.tsx`

File: `client/src/features/customer/pages/MenuCatalogPage.tsx`

Ganti semua `MOCK_PRODUCTS` dan `MOCK_CATEGORIES` dengan API call.

```
Yang diubah:
1. Hapus import MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_TENANTS dari mockData
2. Tambah useEffect untuk fetch data saat halaman load:
   - GET http://localhost:5000/api/products  → simpan ke state products
   - GET http://localhost:5000/api/categories → simpan ke state categories
3. Tampilkan loading state saat fetch
4. Tampilkan error state jika fetch gagal
5. Gunakan data dari state (bukan mock) untuk render menu grid

Gunakan axios (sudah ada di src/lib/api.ts):
import api from '@/lib/api'
const res = await api.get('/products')
```

---

## TASK 4 — Integrasi Frontend: `CheckoutPage.tsx`

File: `client/src/features/customer/pages/CheckoutPage.tsx`

Ganti simulasi `setTimeout` dengan API call nyata.

```
Yang diubah:
1. Saat tombol "Bayar" diklik:
   a. POST /api/orders dengan data dari Redux cart:
      {
        tableId: (dari URL params),
        customerName: (dari form input),
        items: cart.items.map(item => ({
          productId: item.id,
          quantity: item.qty,
          note: item.notes
        }))
      }
   b. Jika order berhasil, ambil orderId dari response
   c. POST /api/payments:
      {
        orderId: orderId,
        method: selectedPaymentMethod  // "CASH" atau "QRIS"
      }
   d. Jika semua berhasil:
      - Clear cart (dispatch clearCart)
      - Simpan orderId ke Redux customerSlice
      - Navigate ke /m/:tenantId/:tableId/status/:orderId

2. Tampilkan loading state saat proses berlangsung
3. Tampilkan error jika gagal
```

---

## TASK 5 — Integrasi Frontend: `OrderStatusPage.tsx`

File: `client/src/features/customer/pages/OrderStatusPage.tsx`

Ganti Redux mock dengan polling API.

```
Yang diubah:
1. Ambil orderId dari URL params
2. Fetch status pesanan: GET /api/orders/:orderId
3. Polling setiap 5 detik (pakai setInterval di useEffect)
4. Stop polling jika status sudah "DONE"
5. Tampilkan status dengan visual yang jelas:
   - PENDING  → "Pesanan diterima, menunggu konfirmasi"
   - PROCESS  → "Pesanan sedang diproses"
   - DONE     → "Pesanan selesai, silakan ambil"
6. Cleanup interval saat komponen unmount (return () => clearInterval)
```

---

## Info Penting untuk Keduanya

### Koneksi Database
```
DATABASE_URL sudah ada di server/.env
Jangan commit file .env ke git
```

### Cara jalankan backend
```bash
cd server
npm run dev   # pakai nodemon, auto-restart
# Server jalan di http://localhost:5000
```

### Cara test endpoint
Gunakan Postman atau Thunder Client (VS Code extension).
Untuk endpoint yang butuh auth, tambahkan header:
```
Authorization: Bearer <token dari login>
```

### Role yang valid
```
SUPERADMIN     → akses semua
MERCHANT_ADMIN → akses semua kecuali platform
CASHIER        → akses terbatas (lihat pesanan, update stok)
```

### Status pesanan
```
PENDING  → baru masuk, belum diproses kasir
PROCESS  → kasir sudah konfirmasi, sedang dibuat
DONE     → selesai
```
