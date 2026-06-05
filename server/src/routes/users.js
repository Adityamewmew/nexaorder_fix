const express = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../db')
const fs = require('fs')
const path = require('path')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

// GET /api/users — admin only, bisa filter by role
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.query
    const where = role ? { role } : {}
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        photo: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/users/:id — edit nama, email, status, atau foto
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, email, status, photo } = req.body
    const userIdToUpdate = parseInt(req.params.id)
    
    // Authorization check: User can only update themselves unless they are admin
    if (req.user.id !== userIdToUpdate && req.user.role !== 'MERCHANT_ADMIN' && req.user.role !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Akses ditolak' })
    }

    const existingUser = await prisma.user.findUnique({ where: { id: userIdToUpdate } })
    if (!existingUser) return res.status(404).json({ error: 'User tidak ditemukan' })

    // Validasi email jika diubah
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } })
      if (emailTaken) return res.status(400).json({ error: 'Email sudah digunakan' })
    }

    // Hapus foto lama jika ada update foto baru
    if (photo && existingUser.photo && existingUser.photo !== photo) {
      const oldFilename = existingUser.photo.split('/').pop()
      const oldFilepath = path.join(__dirname, '../../uploads', oldFilename)
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath)
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email !== undefined) updateData.email = email || null
    // Hanya admin yang bisa ubah status
    if (status && (req.user.role === 'MERCHANT_ADMIN' || req.user.role === 'SUPERADMIN')) {
      updateData.status = status
    }
    if (photo) updateData.photo = photo

    const user = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: updateData,
      select: { id: true, username: true, email: true, name: true, role: true, status: true, photo: true }
    })
    res.json(user)
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'User tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/users/:id/reset-password — reset password kasir (admin only)
router.patch('/:id/reset-password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { password } = req.body
    if (!password) return res.status(400).json({ error: 'Password baru wajib' })
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { password: hashed }
    })
    res.json({ message: 'Password berhasil direset' })
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'User tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/users/:id — hapus user (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' })
      
    // Hapus file gambar jika ada
    if (user.photo) {
      const filename = user.photo.split('/').pop()
      const filepath = path.join(__dirname, '../../uploads', filename)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }

    await prisma.user.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'User dihapus' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
