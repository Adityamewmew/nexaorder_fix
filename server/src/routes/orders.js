const express = require('express')
const prisma = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// =============================================
// BAGIAN RAVI — customer endpoints
// POST /api/orders  → customer buat pesanan
// GET  /api/orders/:id → customer cek status
// =============================================

// =============================================
// BAGIAN ADITYA — kasir/admin endpoints
// =============================================

// GET /api/orders — kasir dan admin lihat semua pesanan
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status } = req.query
    const where = status ? { status } : {}
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        table: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/orders/:id/status — kasir dan admin update status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['PENDING', 'PROCESS', 'DONE']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid. Gunakan: PENDING, PROCESS, atau DONE' })
    }
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    })
    res.json(order)
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Pesanan tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
