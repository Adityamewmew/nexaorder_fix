const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// Buat folder uploads jika belum ada
const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
    cb(null, name)
  }
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(new Error('Format tidak didukung. Gunakan JPG, PNG, atau WebP'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
})

// POST /api/upload — admin dan kasir
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Tidak ada file yang diupload' })

  const apiKey = process.env.IMGBB_API_KEY

  if (apiKey) {
    try {
      // 1. Baca file dan konversi ke base64
      const fileBase64 = fs.readFileSync(req.file.path, 'base64')

      // 2. Kirim ke API ImgBB
      const body = new URLSearchParams()
      body.append('image', fileBase64)

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      // 3. Hapus file lokal setelah berhasil diupload ke ImgBB
      fs.unlinkSync(req.file.path)

      // 4. Kirim URL dari ImgBB ke klien
      return res.json({ url: result.data.url })
    } catch (err) {
      console.error("Gagal mengunggah gambar ke ImgBB:", err.message)
      // Hapus file lokal jika terjadi error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }
      return res.status(500).json({ error: 'Gagal mengunggah gambar ke cloud storage: ' + err.message })
    }
  } else {
    // Fallback ke penyimpanan lokal jika API Key tidak disediakan
    console.warn("Peringatan: IMGBB_API_KEY tidak dikonfigurasi di .env. File disimpan di penyimpanan lokal.")
    const url = `/uploads/${req.file.filename}`
    return res.json({ url })
  }
})

module.exports = router
