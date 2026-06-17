# API Documentation - Nexa Order

Dokumen ini merangkum semua API yang benar-benar ada di backend project Nexa Order berdasarkan kode pada `server/src`, Prisma schema, dan pemakaian di frontend.

## 1. Analisis Project

### Arsitektur Singkat
- Backend menggunakan `Express.js` dengan `Prisma` dan database PostgreSQL.
- Frontend memakai Axios dengan base URL default `http://localhost:5000/api`.
- Server menjalankan:
  - REST API utama di bawah prefix `/api`
  - static file untuk gambar di `/uploads`
  - Server-Sent Events di `/api/sse`
  - background worker untuk auto-cancel pesanan pending

### Domain Data Utama
- `User`: akun login untuk admin / kasir.
- `Category`: kategori menu.
- `Product`: menu dengan stok, gambar, dan optional modifier groups.
- `TableMeja`: meja customer dengan token QR.
- `Order` dan `OrderItem`: pesanan customer dan item di dalamnya.
- `Payment`: pembayaran order.
- `StoreProfile`: profil toko.

### Auth dan Role
- Auth memakai JWT di header:
  - `Authorization: Bearer <token>`
- Middleware:
  - `authMiddleware`: wajib token valid.
  - `adminOnly`: hanya `SUPERADMIN` dan `MERCHANT_ADMIN`.
- Role yang dipakai backend:
  - `SUPERADMIN`
  - `MERCHANT_ADMIN`
  - `CASHIER`

### Catatan Implementasi Penting
- Endpoint `PATCH /api/auth/change-password` dipanggil frontend, tetapi belum ada di backend.
- Komentar pada beberapa route tidak selalu sama dengan middleware yang dipasang.
  - Contoh: `PUT /api/dashboard/profile` dikomentari admin only, tetapi implementasinya hanya `authMiddleware`.
  - Contoh: `POST /api/upload` dikomentari admin dan kasir, tetapi implementasinya hanya `authMiddleware`.
- API orders, payments, dan SSE dipakai untuk notifikasi real-time cashier.

## 2. Base URL

Default backend:

```text
http://localhost:5000/api
```

Contoh path lengkap:

```text
http://localhost:5000/api/products
```

## 3. Format Umum Response

### Success
- JSON object atau array, tergantung endpoint.
- Contoh:

```json
{ "status": "ok" }
```

### Error
- Umumnya:

```json
{ "error": "Pesan error" }
```

### Status Code Umum
- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `500` Internal Server Error

## 4. Endpoint Ringkas

### Public
- `GET /api/health`
- `GET /api/sse`
- `POST /api/auth/login`
- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/tables`
- `GET /api/tables/validate/:token`
- `POST /api/orders`
- `GET /api/orders/:id`
- `POST /api/payments/midtrans-webhook`
- `POST /api/payments/dev-simulate`
- `GET /api/dashboard/profile`

### Auth Required
- `POST /api/auth/register`
- `PATCH /api/auth/change-password`
- `POST /api/products`
- `PUT /api/products/:id`
- `PATCH /api/products/:id/stock`
- `DELETE /api/products/:id`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `POST /api/tables`
- `PUT /api/tables/:id`
- `DELETE /api/tables/:id`
- `GET /api/orders`
- `PATCH /api/orders/:id/status`
- `POST /api/payments`
- `GET /api/users`
- `PATCH /api/users/:id`
- `PATCH /api/users/:id/reset-password`
- `DELETE /api/users/:id`
- `GET /api/dashboard`
- `GET /api/dashboard/sales`
- `PUT /api/dashboard/profile`
- `POST /api/upload`

### Admin Only
- `POST /api/auth/register`
- `POST /api/categories`
- `DELETE /api/categories/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/tables`
- `PUT /api/tables/:id`
- `DELETE /api/tables/:id`
- `GET /api/users`
- `PATCH /api/users/:id/reset-password`
- `DELETE /api/users/:id`

---

## 5. Detail API

## Health

### `GET /api/health`
Health check server.

Auth: none

Response:

```json
{
  "status": "ok",
  "time": "2026-06-17T00:00:00.000Z"
}
```

---

## SSE

### `GET /api/sse`
Koneksi Server-Sent Events untuk notifikasi real-time.

Query:
- `token` optional bila client merchant/admin
- `orderId` optional bila client customer tracking order tertentu

Rules:
- Jika `orderId` tidak dikirim, `token` wajib valid.
- Jika `orderId` dikirim, token bisa dilewati.

Event yang dikirim:
- `connected`
- `new-order`
- `order-updated`

Contoh event payload:

```json
{
  "event": "new-order",
  "data": { }
}
```

---

## Auth

### `POST /api/auth/login`
Login pakai `username` atau `email`.

Request body:

```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "secret"
}
```

Catatan:
- Field `username` atau `email` dipakai sebagai identifier.
- Salah satu dari `username` atau `email` cukup, bersama `password`.

Response `200`:

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "SUPERADMIN"
  }
}
```

Error:
- `400` jika identifier atau password kosong.
- `401` jika kredensial salah.
- `403` jika akun `nonaktif`.

### `POST /api/auth/register`
Membuat user baru, terutama untuk kasir.

Auth: admin only

Request body:

```json
{
  "username": "kasir1",
  "email": "kasir@example.com",
  "password": "secret123",
  "name": "Kasir Satu",
  "role": "CASHIER",
  "photo": "/uploads/file.png"
}
```

Notes:
- Field **wajib**: `username`, `password`, `name`.
- Field **optional**: `email`, `role` (default `CASHIER`), `photo`.

Response `201`:

```json
{
  "id": 2,
  "username": "kasir1",
  "email": "kasir@example.com",
  "name": "Kasir Satu",
  "role": "CASHIER"
}
```

Error:
- `400` jika `username`, `password`, atau `name` kosong.
- `400` jika username atau email sudah digunakan.

### `PATCH /api/auth/change-password`
Ganti password sendiri (user yang sedang login).

Auth: required

Request body:

```json
{
  "oldPassword": "password-lama",
  "newPassword": "password-baru"
}
```

Notes:
- `newPassword` minimal 6 karakter.
- `oldPassword` diverifikasi terhadap hash di database.

Response `200`:

```json
{ "message": "Password berhasil diubah" }
```

Error:
- `400` jika salah satu field kosong.
- `400` jika `newPassword` kurang dari 6 karakter.
- `401` jika `oldPassword` tidak sesuai.
- `404` jika user tidak ditemukan.

---

## Categories

### `GET /api/categories`
Ambil semua kategori beserta produk di dalamnya.

Auth: none

Response `200`:

```json
[
  {
    "id": 1,
    "name": "Makanan",
    "products": [
      {
        "id": 1,
        "name": "Es Teh",
        "price": 5000,
        "stock": 20,
        "description": null,
        "image": "/uploads/es-teh.png",
        "status": "tersedia",
        "categoryId": 1
      }
    ]
  }
]
```

### `POST /api/categories`
Buat kategori baru.

Auth: admin only

Request body:

```json
{
  "name": "Minuman"
}
```

Response `201`:

```json
{
  "id": 2,
  "name": "Minuman"
}
```

Error:
- `400` jika `name` kosong.
- `400` jika kategori sudah ada.

### `DELETE /api/categories/:id`
Hapus kategori.

Auth: admin only

Path params:
- `id` integer

Response:

```json
{ "message": "Kategori dihapus" }
```

---

## Products

### `GET /api/products`
Ambil semua produk. Bisa difilter per kategori.

Auth: none

Query:
- `categoryId` optional, integer

Response `200`:

```json
[
  {
    "id": 1,
    "name": "Es Teh",
    "price": 5000,
    "stock": 20,
    "description": null,
    "image": "/uploads/es-teh.png",
    "status": "tersedia",
    "categoryId": 1,
    "category": {
      "id": 1,
      "name": "Minuman"
    },
    "modifierGroups": []
  }
]
```

### `GET /api/products/:id`
Ambil detail satu produk.

Auth: none

Path params:
- `id` integer

Response `200`:

```json
{
  "id": 1,
  "name": "Es Teh",
  "price": 5000,
  "stock": 20,
  "description": null,
  "image": "/uploads/es-teh.png",
  "status": "tersedia",
  "category": {
    "id": 1,
    "name": "Minuman"
  },
  "modifierGroups": []
}
```

Error:
- `404` jika produk tidak ditemukan.

### `POST /api/products`
Buat produk baru, termasuk optional modifier groups.

Auth: admin only

Request body minimal:

```json
{
  "name": "Nasi Goreng",
  "price": 25000,
  "stock": 10,
  "description": "Pedas sedang",
  "image": "/uploads/nasi-goreng.png",
  "categoryId": 1,
  "status": "tersedia",
  "modifierGroups": [
    {
      "groupName": "Topping",
      "isRequired": false,
      "minSelections": 0,
      "maxSelections": 2,
      "modifiers": [
        { "modifierName": "Telur", "price": 5000 }
      ]
    }
  ]
}
```

Notes:
- `name`, `price`, dan `categoryId` wajib.
- `modifierGroups` optional.
- Field `groupName` / `name` dan `modifierName` / `name` diterima.

Response `201`:
- Object produk lengkap dengan `category` dan `modifierGroups`.

### `PUT /api/products/:id`
Update produk.

Auth: admin only

Path params:
- `id` integer

Request body:

```json
{
  "name": "Nasi Goreng Spesial",
  "price": 30000,
  "stock": 8,
  "description": "Tambah telur",
  "image": "/uploads/nasi-goreng-baru.png",
  "categoryId": 1,
  "status": "tersedia",
  "modifierGroups": []
}
```

Notes:
- Jika `modifierGroups` dikirim, backend menghapus semua modifier group lama lalu membuat ulang yang baru.

Error:
- `404` jika produk tidak ditemukan.

### `PATCH /api/products/:id/stock`
Update stok atau status produk.

Auth: required

Path params:
- `id` integer

Request body:

```json
{
  "stock": 12,
  "status": "tersedia"
}
```

Notes:
- Middleware hanya `authMiddleware`, jadi semua user yang login bisa melewati autentikasi. Jika ingin membatasi ke admin/kasir tertentu, perlu tambahan rule.

### `DELETE /api/products/:id`
Hapus produk dan file gambar jika ada.

Auth: admin only

Response:

```json
{ "message": "Produk dihapus" }
```

Error:
- `404` jika produk tidak ditemukan.

---

## Tables

### `GET /api/tables`
Ambil semua meja.

Auth: none

Response `200`:

```json
[
  {
    "id": 1,
    "number": "A1",
    "status": "aktif",
    "qrCode": null,
    "token": "uuid-token"
  }
]
```

### `GET /api/tables/validate/:token`
Validasi token meja untuk customer.

Auth: none

Path params:
- `token` string UUID

Response `200`:
- Data meja

Error:
- `404` jika meja tidak ditemukan.
- `403` jika meja tidak aktif.

### `POST /api/tables`
Buat meja baru.

Auth: admin only

Request body:

```json
{
  "number": "A2",
  "status": "aktif"
}
```

Response `201`:
- Data meja baru

Error:
- `400` jika number kosong.
- `400` jika nomor meja sudah ada.

### `PUT /api/tables/:id`
Update meja.

Auth: admin only

Path params:
- `id` integer

Request body:

```json
{
  "number": "A3",
  "status": "nonaktif"
}
```

Response `200`:
- Data meja yang telah diupdate

Error:
- `404` jika meja tidak ditemukan.
- `400` jika nomor meja sudah digunakan.

### `DELETE /api/tables/:id`
Hapus meja.

Auth: admin only

Response:

```json
{ "message": "Meja dihapus" }
```

---

## Orders

### `POST /api/orders`
Buat pesanan customer atau POS.

Auth: none

Request body:

```json
{
  "tableId": 1,
  "customerName": "Budi",
  "phone": "08123456789",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "note": "tanpa es",
      "toppings": "[{\"name\":\"Telur\",\"price\":5000}]"
    }
  ]
}
```

Rules:
- `items` wajib ada dan tidak boleh kosong.
- Jika `tableId` dikirim, backend memastikan meja valid.
- `product.stock` harus cukup.
- `toppings` dibaca sebagai JSON string dan ikut dihitung ke subtotal.
- Setelah order dibuat, stok produk dikurangi.
- Jika stok menjadi 0, status produk diubah ke `habis`.

Response `201`:
- Data order lengkap dengan `items`, `product`, dan `table`.

Error:
- `400` jika `items` kosong.
- `400` jika meja tidak ditemukan.
- `400` jika produk tidak ditemukan.
- `400` jika stok tidak mencukupi.

### `GET /api/orders/:id`
Ambil detail order untuk tracking customer.

Auth: none

Path params:
- `id` integer

Response `200`:
- Order lengkap dengan `items`, `table`, dan `payment`

Error:
- `404` jika order tidak ditemukan.

### `GET /api/orders`
Ambil semua order untuk cashier/admin.

Auth: required

Query:
- `status` optional, misalnya `PENDING`, `PROCESS`, `READY`, `PAID`, `CANCELLED`

Response `200`:
- Array order terbaru, termasuk relasi `items`, `table`, `payment`

### `PATCH /api/orders/:id/status`
Update status order.

Auth: required

Path params:
- `id` integer

Request body:

```json
{
  "status": "PROCESS"
}
```

Status valid:
- `PENDING`
- `PROCESS`
- `READY`
- `PAID`
- `CANCELLED`

Behavior khusus:
- Jika status menjadi `CANCELLED`, stok produk dikembalikan dan status produk diset ke `tersedia`.
- Setelah update, server emit event SSE `order-updated`.

Response `200`:
- Object order lengkap dengan `items` (termasuk `product`), `table`, dan `payment`.

Error:
- `400` jika status tidak valid.
- `404` jika order tidak ditemukan.

---

## Payments

### `POST /api/payments`
Membuat pembayaran untuk order.

Auth: none (public) — tidak ada middleware di endpoint ini.

Request body:

```json
{
  "orderId": 1,
  "method": "CASH"
}
```

Method valid:
- `CASH`
- `QRIS`

Flow `CASH`:
- Payment dibuat dengan `amount = order.total`, status code `201`.
- SSE emit `new-order`.
- Response berisi payment record.

Flow `QRIS`:
- Jika `isManual: true`, backend membuat payment record QRIS lokal dengan `amount = order.total`, status code `201`.
- Jika `isManual` tidak ada:
  - Backend memanggil Midtrans Core API v2 `/v2/charge`.
  - Upsert payment dengan `amount = 0` sebagai marker "menunggu pembayaran".
  - Emit SSE `new-order`.
  - Response berisi QR image URL, QR string, expiry, dan transaction ID, status code `201`.

Optional field:
- `isManual`: boolean

Response CASH `201`:
- Object payment record.

Response QRIS `201`:

```json
{
  "qrImageUrl": "https://...",
  "qrString": "...",
  "expiryTime": "...",
  "transactionId": "...",
  "orderId": 1
}
```

Error:
- `400` jika `orderId` atau `method` kosong.
- `400` jika method bukan `CASH` atau `QRIS`.
- `404` jika order tidak ditemukan.
- `400` jika payment sudah ada untuk order ini — **hanya berlaku untuk method `CASH`**. Method `QRIS` menggunakan `upsert` sehingga tidak akan error jika payment sudah ada.

### `POST /api/payments/midtrans-webhook`
Webhook dari Midtrans.

Auth: none

Request body wajib berisi:

```json
{
  "order_id": "NEXA-1-1710000000000",
  "transaction_status": "settlement",
  "status_code": "200",
  "gross_amount": "25000",
  "signature_key": "sha512..."
}
```

Behavior:
- Verifikasi signature dengan `MIDTRANS_SERVER_KEY`
- Jika status `settlement` atau `capture`:
  - order diubah ke `PAID`
  - payment dibuat jika belum ada
  - emit SSE `order-updated`
- Jika status `cancel`, `deny`, atau `expire`:
  - order diubah ke `CANCELLED`
  - stok produk dikembalikan
  - emit SSE `order-updated`

Error:
- `400` jika payload kurang lengkap.
- `403` jika signature invalid.
- `500` jika server key belum diset atau terjadi error internal.

### `POST /api/payments/dev-simulate`
Simulasi konfirmasi QRIS untuk development.

Auth: none

Request body:

```json
{
  "orderId": 1
}
```

Behavior:
- Upsert payment QRIS: jika sudah ada payment dengan `amount = 0` (pending), nilai `amount` diupdate menjadi `order.total` (confirmed).
- Ini yang membedakan QRIS pending (belum dibayar) vs QRIS lunas di merchant UI.
- Emit SSE `order-updated` agar merchant UI melakukan refresh.
- Order tetap `PENDING` agar masuk antrean dapur/kasir sesuai flow normal.

Error:
- `400` jika `orderId` kosong.
- `404` jika order tidak ditemukan.

Response:

```json
{
  "status": "ok",
  "message": "Pembayaran QRIS order #1 dikonfirmasi"
}
```

---

## Users

### `GET /api/users`
Ambil daftar user.

Auth: admin only

Query:
- `role` optional, misalnya `CASHIER` atau `MERCHANT_ADMIN`

Response `200`:

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "name": "Admin",
    "role": "SUPERADMIN",
    "status": "aktif",
    "photo": null,
    "createdAt": "2026-06-17T00:00:00.000Z"
  }
]
```

### `PATCH /api/users/:id`
Update profil user.

Auth: required

Rules:
- User hanya boleh update dirinya sendiri.
- Admin (`MERCHANT_ADMIN` atau `SUPERADMIN`) boleh update user lain.
- Field `status` hanya bisa diubah oleh admin.

Request body:

```json
{
  "name": "Nama Baru",
  "email": "baru@example.com",
  "status": "aktif",
  "photo": "/uploads/profile.png"
}
```

Notes:
- Jika foto diganti, file lama dihapus dari folder `uploads`.
- Email harus unik.
- Field `status` hanya bisa diubah oleh admin (`MERCHANT_ADMIN` atau `SUPERADMIN`).

Response `200`:

```json
{
  "id": 1,
  "username": "admin",
  "email": "baru@example.com",
  "name": "Nama Baru",
  "role": "SUPERADMIN",
  "status": "aktif",
  "photo": "/uploads/profile.png"
}
```

Error:
- `403` jika user mencoba update user lain tanpa hak admin.
- `404` jika user tidak ditemukan.
- `400` jika email sudah digunakan.

### `PATCH /api/users/:id/reset-password`
Reset password user.

Auth: admin only

Request body:

```json
{
  "password": "password-baru"
}
```

Response:

```json
{ "message": "Password berhasil direset" }
```

### `DELETE /api/users/:id`
Hapus user.

Auth: admin only

Path params:
- `id` integer

Behavior:
- Jika ada foto lama, file dihapus dari `uploads`.

Response:

```json
{ "message": "User dihapus" }
```

Error:
- `404` jika user tidak ditemukan.

---

## Dashboard

### `GET /api/dashboard`
Statistik ringkas hari ini.

Auth: required

Response `200`:

```json
{
  "totalMenu": 10,
  "totalMeja": 8,
  "totalKasir": 3,
  "transaksiHariIni": 12,
  "penjualanHariIni": 250000
}
```

### `GET /api/dashboard/sales`
Laporan penjualan.

Auth: required

Query:
- `startDate` optional, format ISO/date
- `endDate` optional, format ISO/date

Response `200`:

```json
{
  "orders": [],
  "summary": {
    "totalPendapatan": 0,
    "totalTransaksi": 0,
    "totalItemTerjual": 0
  }
}
```

Catatan:
- Hanya order dengan status `PAID` yang dihitung.
- `endDate` di-set sampai 23:59:59.999 pada hari tersebut.

### `GET /api/dashboard/profile`
Ambil profil toko.

Auth: none

Behavior:
- Jika belum ada record, backend otomatis membuat `StoreProfile` default.

Response `200`:

```json
{
  "id": 1,
  "name": "Nexa Order",
  "description": null,
  "logo": null,
  "address": null,
  "phone": null,
  "openTime": "08:00",
  "closeTime": "22:00",
  "updatedAt": "2026-06-17T00:00:00.000Z"
}
```

### `PUT /api/dashboard/profile`
Update profil toko.

Auth: required

Request body:

```json
{
  "name": "Nama Toko",
  "description": "Deskripsi",
  "logo": "/uploads/logo.png",
  "address": "Alamat",
  "phone": "0812xxxx",
  "openTime": "08:00",
  "closeTime": "22:00"
}
```

Behavior:
- Jika logo berubah, file lama dihapus dari `uploads`.
- Jika record belum ada, backend membuat record baru.

Catatan:
- Implementasi saat ini hanya memakai `authMiddleware`, bukan `adminOnly`.

---

## Upload

### `POST /api/upload`
Upload file gambar.

Auth: required

Form-data:
- field: `image`

Allowed file type:
- `.jpg`
- `.jpeg`
- `.png`
- `.webp`

Max size:
- 2 MB

Response `200`:

```json
{
  "url": "/uploads/filename.png"
}
```

Error:
- `400` jika tidak ada file.
- error jika format tidak didukung.

---

## 6. Static Asset

### `/uploads/:filename`
Folder file upload di-serve langsung oleh Express.

Contoh:

```text
http://localhost:5000/uploads/1700000000-123456.png
```

Dipakai untuk:
- gambar produk
- foto user
- logo toko

---

## 7. Alur API Utama di Frontend

### Customer Flow
1. Validasi meja via `GET /api/tables/validate/:token`
2. Load menu via `GET /api/products` dan `GET /api/categories`
3. Buat order via `POST /api/orders`
4. Buat payment via `POST /api/payments`
5. Tracking order via `GET /api/orders/:id` atau `GET /api/sse`

### Merchant Flow
1. Login via `POST /api/auth/login`
2. Load dashboard via `GET /api/dashboard`
3. Kelola menu via `/api/products`
4. Kelola meja via `/api/tables`
5. Kelola user/staff via `/api/users` dan `/api/auth/register`
6. Update order status via `PATCH /api/orders/:id/status`
7. Laporan sales via `GET /api/dashboard/sales`

### Real-time Flow
- `POST /api/payments` emit `new-order`
- `PATCH /api/orders/:id/status` emit `order-updated`
- `POST /api/payments/midtrans-webhook` emit `order-updated`
- `POST /api/payments/dev-simulate` emit `order-updated`
- background worker juga emit `order-updated` saat auto-cancel

---

## 8. Gaps yang Perlu Diperhatikan

- Tidak ada endpoint khusus untuk `logout` di backend; logout dilakukan di client dengan menghapus token.
- Tidak ada endpoint `GET /api/me`; frontend membaca user dari JWT/local state.
- Belum ada endpoint terpisah untuk validasi payment gateway selain Midtrans webhook.

---

## 9. Ringkasan Cepat

API backend yang aktif di project ini terdiri dari:
- Auth
- Categories
- Products
- Tables
- Orders
- Payments
- Users
- Dashboard
- Upload
- Health check
- SSE

Jika ingin, dokumen ini bisa dipecah lagi menjadi:
- versi developer yang lebih detail per request/response
- versi Postman collection
- versi OpenAPI/Swagger YAML

