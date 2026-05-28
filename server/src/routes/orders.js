const express = require('express')
const prisma = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// =============================================
// BAGIAN RAVI — customer endpoints
// =============================================
// POST /api/orders — customer buat pesanan (no auth)
router.post('/', async (req, res) => {
  try {
    const { tableId, customerName, phone, items } = req.body

    // VALIDASI
    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({
        error: 'tableId dan items wajib'
      })
    }

    let total = 0

    const orderItemsData = []

    // LOOP ITEMS
    for (const item of items) {

      // CARI PRODUCT
      const product = await prisma.product.findUnique({
        where: {
          id: item.productId
        }
      })

      // CEK PRODUCT ADA ATAU TIDAK
      if (!product) {
        return res.status(400).json({
          error: `Produk ID ${item.productId} tidak ditemukan`
        })
      }

      // HITUNG SUBTOTAL
      const subtotal = product.price * item.quantity

      total += subtotal

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        note: item.note,
        toppings: item.toppings,
        subtotal
      })
    }

    // CREATE ORDER
    const order = await prisma.order.create({
      data: {
        tableId,
        customerName,
        phone,
        total,
        items: {
          create: orderItemsData
        }
      },

      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    res.status(201).json(order)

  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: 'Internal server error'
    })
  }
})

// GET /api/orders/:id — customer cek status pesanan (no auth)
router.get('/:id', async (req, res) => {
  try {

    const orderId = parseInt(req.params.id)

    const order = await prisma.order.findUnique({
      where: {
        id: orderId
      },

      include: {
        table: true,

        items: {
          include: {
            product: true
          }
        },

        payment: true
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Pesanan tidak ditemukan'
      })
    }

    res.json(order)

  } catch (error) {
    console.log(error)

    res.status(500).json({
      error: 'Internal server error'
    })
  }
})


// POST /api/orders — customer buat pesanan (no auth)
router.post('/', async (req, res) => {
  try {
    const { tableId, items, customerName, phone } = req.body
    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ error: 'tableId dan items wajib' })
    }

    let total = 0
    const orderItems = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product) return res.status(400).json({ error: `Produk ID ${item.productId} tidak ditemukan` })
      const subtotal = product.price * item.quantity
      total += subtotal
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        note: item.note || null,
        toppings: item.toppings || null,
        subtotal
      })
    }

    const order = await prisma.order.create({
      data: {
        tableId: parseInt(tableId),
        customerName: customerName || null,
        phone: phone || null,
        total,
        items: { create: orderItems }
      },
      include: { items: { include: { product: true } }, table: true }
    })

    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/orders/:id — customer cek status pesanan (no auth)
router.get('/:id', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        items: { include: { product: true } },
        table: true,
        payment: true
      }
    })
    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

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
