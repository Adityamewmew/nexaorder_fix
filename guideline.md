# Nexa Order — Project Guideline

**Celerates Camp Batch 4**
**Kategori:** E-Commerce (F&B Point of Sale & Self-Order)

---

## 👥 Tim

| Role | Nama |
|------|------|
| Project Manager | Rio Adriano Arifin |
| Designer 1 | Nadira Aliya Ramadhani |
| Designer 2 | Satria Nugraha |
| Designer 3 | Putriani Pirma A. Sagala |
| Coder 1 | Rahmanda Juliansyah |
| Coder 2 | Aditya Purnama Herlambang |
| Coder 3 | Ravi Ahmad Prasetya |

---

## 📌 Problem Statement

Pemilik dan pegawai warung makan kesulitan mengelola pesanan pelanggan secara akurat dan efisien karena proses pencatatan pesanan masih dilakukan secara manual menggunakan kertas. Hal ini sering menyebabkan:

- Kesalahan pesanan (human error), terutama pada pesanan dengan catatan khusus
- Keterlambatan pelayanan saat kondisi ramai
- Ketidaksinkronan informasi stok menu (menu habis tapi masih dipesan)
- Kesulitan memantau dan merekap laporan keuangan harian

---

## 💡 Solusi — Nexa Order

Website **self-order ringan berbasis Scan QR Code** meja yang:
- Menghubungkan pelanggan langsung ke dapur/kasir
- Tidak memerlukan instalasi aplikasi tambahan
- Memberikan kontrol visibilitas stok otomatis
- Menyediakan laporan transaksi digital yang terstruktur

---

## 🎯 Target User & Market

**Target User:**
- Customer: usia 15–55 tahun, melek teknologi, terbiasa menggunakan HP dan pembayaran digital
- Pemilik UMKM: sudah lama berjalan, belum terbiasa dengan digitalisasi

**Target Market:**
UMKM kuliner yang masih manual dalam pelayanan dan ingin beralih ke sistem digital

---

## 🔑 Fitur Utama MVP

### Customer Side
1. Daftar Menu & Deskripsi (foto, harga, detail)
2. Search Bar
3. Filter Kategori
4. Catatan Khusus (custom notes per item)
5. Review Keranjang
6. Rincian Biaya (subtotal, pajak, total)
7. Pilihan Pembayaran (QRIS / Tunai)
8. Cek Status Pesanan (real-time)

### Cashier Side
1. Login / Logout
2. Dashboard Pesanan Masuk (real-time)
3. Detail Pesanan
4. Update Status Pesanan (Masuk → Diproses → Selesai)
5. Kelola Menu Tersedia / Habis
6. Konfirmasi Pembayaran
7. Riwayat Pesanan Harian

### Admin Side
Semua fitur Cashier, ditambah:
1. Create / Edit / Delete Menu
2. Manage User (Staff)
3. Manage Table & QR Code
4. Laporan Penjualan *(Sprint 2+)*
5. Manajemen Stok Bahan *(Sprint 2+)*

---

## 🏗️ Arsitektur & Core Entity

| Entity | Deskripsi |
|--------|-----------|
| **User / Account** | Kredensial Admin & Kasir (username, password, role) |
| **Product / Menu** | Nama, harga, deskripsi, foto, status stok |
| **Category** | Pengelompokan menu (Makanan, Minuman, Snack, dll.) |
| **Table / Meja** | Nomor meja + kode unik QR |
| **Order** | Nomor struk, nomor meja, total harga, status (Pending/Proses/Selesai) |
| **Order_Item** | Rincian item per order (qty, catatan khusus, subtotal) |
| **Payment / Transaction** | Metode bayar, jumlah, kembalian, waktu bayar |

---

## 🗃️ Entity Relationship Diagram (ERD)

### DBML Schema

```dbml
Table Category {
  id int [pk, increment]
  name varchar
}

Table Product {
  id int [pk, increment]
  name varchar
  price int
  stock int
  categoryId int
}

Table Order {
  id int [pk, increment]
  tableId int
  total int
  status varchar
}

Table OrderItem {
  id int [pk, increment]
  orderId int
  productId int
  quantity int
  note varchar
}

Table Payment {
  id int [pk, increment]
  orderId int
  method varchar
  amount int
}

Ref: Product.categoryId > Category.id
Ref: OrderItem.productId > Product.id
Ref: OrderItem.orderId > Order.id
Ref: Payment.orderId - Order.id
```

### Relasi Antar Tabel

| Dari | Ke | Tipe | Keterangan |
|------|----|------|------------|
| `Product.categoryId` | `Category.id` | Many-to-One | Banyak produk dalam satu kategori |
| `OrderItem.orderId` | `Order.id` | Many-to-One | Banyak item dalam satu order |
| `OrderItem.productId` | `Product.id` | Many-to-One | Banyak order item merujuk satu produk |
| `Payment.orderId` | `Order.id` | One-to-One | Satu payment untuk satu order |

### Deskripsi Tabel

**Category** — Menyimpan kategori produk (contoh: Makanan, Minuman, Snack).

**Product** — Menyimpan data menu: nama, harga, stok, dan referensi kategori.

**Order** — Menyimpan data kepala pesanan: nomor meja, total harga, dan status (`PENDING` / `PAID` / `DONE`).

**OrderItem** — Menyimpan rincian item di dalam satu order: produk, jumlah, dan catatan khusus (contoh: "tanpa es", "level pedas 2").

**Payment** — Menyimpan data transaksi pembayaran: metode (`CASH` / `QRIS`) dan jumlah yang dibayarkan.

---

## 🖥️ Tech Stack

### Backend
- **Runtime:** Node.js + Express
- **ORM:** Prisma (SQLite/dev)
- **Auth:** Role-based header (`Authorization: admin / user`)
- **Repo:** https://github.com/raviahmad-p/nexaorder

### Frontend
- **Framework:** React + TypeScript (Vite)
- **Routing:** React Router DOM
- **State Management:** Redux Toolkit (`cartSlice`)
- **Data Fetching:** TanStack Query + Axios
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Repo:** https://github.com/FaraFuru/nexa-order

### Design Tools
- **Wireframe & Prototype:** Figma
- **Affinity Mapping:** FigJam
- **Interview Notes:** Google Docs

---

## 🗂️ Routes Mapping (Frontend)

| Route | Role | Deskripsi |
|-------|------|-----------|
| `/platform/login` | Superadmin | Login platform |
| `/platform` | Superadmin | Dashboard platform |
| `/platform/tenants` | Superadmin | Manajemen tenant/UMKM |
| `/merchant/login` | Admin / Kasir | Login merchant |
| `/merchant` | Admin / Kasir | Dashboard merchant |
| `/merchant/pos` | Admin / Kasir | Point of Sale |
| `/merchant/orders` | Admin / Kasir | Manajemen pesanan |
| `/merchant/menu` | Admin | Manajemen menu |
| `/merchant/tables` | Admin | Manajemen meja & QR |
| `/merchant/staff` | Admin | Manajemen staff |
| `/merchant/reports` | Admin | Laporan penjualan |
| `/merchant/profile` | Admin | Profil toko |
| `/` | Customer (Publik) | Katalog self-order via QR |

---

## 🔌 API Endpoints (Backend)

| No | Fitur | Method | Endpoint | Role |
|----|-------|--------|----------|------|
| 1 | Create Category | POST | `/categories` | Admin |
| 2 | Check Categories | GET | `/categories` | Admin |
| 3 | Create Product | POST | `/products` | Admin |
| 4 | Check Product by ID | GET | `/products/:id` | Admin & User |
| 5 | Create Order | POST | `/orders` | User |
| 6 | Check Orders | GET | `/orders` | Admin & User |
| 7 | Create Payment | POST | `/payments` | User |
| 8 | Check Payments | GET | `/payments` | Admin |

**Standard Error Responses:**
- `400 Bad Request` — field wajib kosong / data tidak valid
- `401 Unauthorized` — tidak ada header Authorization
- `403 Forbidden` — role tidak memiliki akses
- `404 Not Found` — resource / endpoint tidak ditemukan

---

## 🚀 Cara Menjalankan

### Backend
```bash
git clone https://github.com/raviahmad-p/nexaorder.git
cd nexaorder
npm install
npx prisma generate
npx prisma migrate dev --name init
node src/app.js
# Server berjalan di port 3000
```

**Dummy Credentials:**
- Username: `admin` | Password: `P@ssword_kuat123` | Role: Admin

### Frontend
```bash
git clone https://github.com/FaraFuru/nexa-order.git
cd nexa-order
npm install
npm install qrcode.react
# Buat file .env
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
# Buka http://localhost:5173
```

**Dummy Credentials:**
| Role | Email | Password |
|------|-------|----------|
| Superadmin Platform | admin@nexaorder.com | admin123 |
| Admin Merchant | arifin@bakso.com | password |
| Kasir Merchant | kasir1@bakso.com | password |

---

## 📅 Sprint Plan

### Sprint 1 (6 April – 3 Mei 2026) — 35 SP
**Goal:** Autentikasi pedagang selesai. Pelanggan dapat melihat katalog, mencari, dan filter menu.

| Fitur | Task | Assignee |
|-------|------|----------|
| Register & Login | UI Auth + API + Integrasi FE | Designer + Coder |
| Manajemen Menu | UI Dashboard + API CRUD + Integrasi | Designer + Coder |
| Daftar Menu | UI Katalog + API GET + Render | Designer + Coder |
| Search & Filter | UI + Logic client-side | Designer + Coder |
| Kelola Stok | API PATCH + UI Toggle | Designer + Coder |

### Sprint 2 (Mei – 3 Juni 2026) — 45 SP
**Goal:** Pelanggan dapat checkout. Pedagang menerima notifikasi real-time dan memproses pesanan.

| Fitur | Task | Assignee |
|-------|------|----------|
| Keranjang & Bayar | UI + State management + API | Designer + Coder |
| Notifikasi Real-Time | WebSocket backend + UI badge | Coder |
| Detail & Status Pesanan | UI Modal + API + Integrasi | Designer + Coder |
| Tracking Status (Customer) | UI progress bar + auto-refresh | Designer + Coder |
| Riwayat Transaksi | UI tabel + API GET | Coder |

---

## 🔍 Key Research Insights

1. **Transparansi Stok** — Pelanggan kecewa saat memesan menu yang sudah habis; pedagang kewalahan menginformasikannya secara manual saat jam sibuk.
2. **UI Ringan & Responsif** — Pelanggan sangat menghindari sistem yang loading lambat, tidak responsif, atau navigasinya rumit.
3. **Custom Order Rawan Error** — Pencatatan catatan khusus secara manual sangat rentan human error dan berdampak pada kepuasan pelanggan.

---

## 🏁 Opportunity

Merancang Nexa Order sebagai **website self-order lightweight & mobile-friendly** dengan:
- Alur pesanan < 5 klik untuk Customer
- Dashboard real-time untuk Kasir/Admin
- Sinkronisasi stok instan (menu habis otomatis tidak bisa diklik)
- Laporan keuangan otomatis yang bisa diekspor

---

*Dokumen ini merangkum seluruh tahapan: User Research, Agile Planning, Backend Development, UI/UX Fundamentals, dan Frontend Development dari proyek Nexa Order — Celerates Camp Batch 4.*
