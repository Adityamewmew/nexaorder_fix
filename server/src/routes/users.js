const express = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../db')
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

// PATCH /api/users/:id — edit nama atau status (admin only)
router.patch('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, status } = req.body
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { name, status },
      select: { id: true, username: true, name: true, role: true, status: true }
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
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'User dihapus' })
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'User tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
