const express = require('express')
const prisma = require('../db')

const router = express.Router()

// POST /api/payments — customer bayar (no auth)
router.post('/', async (req, res) => {
  try {
    const { orderId, method } = req.body
    if (!orderId || !method) {
      return res.status(400).json({ error: 'orderId dan method wajib' })
    }
    if (!['CASH', 'QRIS'].includes(method)) {
      return res.status(400).json({ error: 'Method harus CASH atau QRIS' })
    }

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } })
    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' })

    const payment = await prisma.payment.create({
      data: {
        orderId: parseInt(orderId),
        method,
        amount: order.total
      }
    })

    res.status(201).json(payment)
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Pembayaran sudah ada untuk pesanan ini' })
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
