const express = require('express')
const prisma = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

// GET /api/tables — publik (customer butuh ini untuk validasi tableId)
router.get('/', async (req, res) => {
  try {
    const tables = await prisma.tableMeja.findMany({ orderBy: { id: 'asc' } })
    res.json(tables)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/tables — admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { number, status } = req.body
    if (!number) return res.status(400).json({ error: 'Nomor meja wajib' })
    const table = await prisma.tableMeja.create({
      data: { number, status: status || 'aktif' }
    })
    res.status(201).json(table)
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Nomor meja sudah ada' })
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/tables/:id — admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { number, status } = req.body
    const table = await prisma.tableMeja.update({
      where: { id: parseInt(req.params.id) },
      data: { number, status }
    })
    res.json(table)
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Meja tidak ditemukan' })
    if (e.code === 'P2002') return res.status(400).json({ error: 'Nomor meja sudah ada' })
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/tables/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.tableMeja.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Meja dihapus' })
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Meja tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
