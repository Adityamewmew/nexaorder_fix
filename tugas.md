# ⏳ Tugas Mendatang (Pending Tasks)

Bagian ini berisi fitur-fitur krusial yang belum diimplementasikan dan menjadi target pengembangan selanjutnya oleh tim:

## Integrasi Payment Gateway 💳

- Menghubungkan sistem dengan payment gateway pihak ketiga (midtrans:
   - Merchant ID: [REDACTED_IN_GIT]
   - Client Key: [REDACTED_IN_GIT]
   - Server Key: [REDACTED_IN_GIT]
)
- Generate QRIS dinamis atau Virtual Account secara otomatis saat Customer menekan tombol "Buat Pesanan".
- Webhook handler di backend untuk mengubah status pesanan otomatis saat pembayaran berhasil.

## Notifikasi Real-Time (Push & Sound) 🔔

- Saat ini sistem notifikasi kasir masih menggunakan polling API (menarik data setiap 10 detik).
- Target: Mengganti polling dengan WebSockets (Socket.io) atau Server-Sent Events (SSE) agar notifikasi pesanan masuk benar-benar instan (0 delay).
- Menampilkan jendela notifikasi mengambang (floating toast/alert) dan membunyikan alarm/beep di layar Kasir/Dapur.

## Sistem Timeout Pesanan (Auto-Cancel) ⏱️

- Membuat cron job atau background worker (misal: menggunakan Node-Cron atau Redis) di server backend.
- Pesanan akan dibatalkan secara otomatis jika pelanggan tidak melakukan pembayaran dalam batas waktu tertentu (misal: 15 menit), atau jika pesanan tertahan terlalu lama tanpa diproses.

## Deployment & Production 🚀

- Menyiapkan environment produksi (misal: Dockerization).
- Deployment Frontend (bisa menggunakan Vercel, Netlify, atau Cloudflare Pages).
- Deployment Backend (bisa menggunakan Railway, Render, VPS DigitalOcean/AWS).
- Hosting Database neon db (postgresql://neondb_owner:npg_F4xqg5hNLcTV@ep-shiny-frog-aoiexc7u-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require)
- Setup domain kustom dan sertifikat SSL (HTTPS).