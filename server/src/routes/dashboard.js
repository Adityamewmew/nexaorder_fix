const express = require('express')
const prisma = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// GET /api/dashboard/profile — profil toko
router.get('/profile', async (req, res) => {
  try {
    let profile = await prisma.storeProfile.findFirst()
    if (!profile) {
      profile = await prisma.storeProfile.create({ data: {} })
    }
    res.json(profile)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/dashboard/profile — update profil toko (admin only)
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, description, logo, address, phone, openTime, closeTime } = req.body
    let profile = await prisma.storeProfile.findFirst()
    
    // Hapus logo lama jika ada update logo baru
    if (logo && profile && profile.logo && profile.logo !== logo) {
      const fs = require('fs')
      const path = require('path')
      const oldFilename = profile.logo.split('/').pop()
      const oldFilepath = path.join(__dirname, '../../uploads', oldFilename)
      if (fs.existsSync(oldFilepath)) {
        fs.unlinkSync(oldFilepath)
      }
    }

    if (!profile) {
      profile = await prisma.storeProfile.create({
        data: { name, description, logo, address, phone, openTime, closeTime }
      })
    } else {
      profile = await prisma.storeProfile.update({
        where: { id: profile.id },
        data: { name, description, logo, address, phone, openTime, closeTime }
      })
    }
    res.json(profile)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/dashboard — statistik hari ini (admin dan kasir)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [totalMenu, totalMeja, totalKasir, transaksiHariIni, penjualanHariIni] = await Promise.all([
      prisma.product.count(),
      prisma.tableMeja.count(),
      prisma.user.count({ where: { role: 'CASHIER' } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { status: 'PAID', createdAt: { gte: today } },
        _sum: { total: true }
      })
    ])

    res.json({
      totalMenu,
      totalMeja,
      totalKasir,
      transaksiHariIni,
      penjualanHariIni: penjualanHariIni._sum.total || 0
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/dashboard/sales — laporan penjualan dengan filter tanggal (admin dan kasir)
router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query
    const where = { status: 'PAID' }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        where.createdAt.lte = end
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payment: true,
        table: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalPendapatan = orders.reduce((sum, o) => sum + o.total, 0)
    const totalTransaksi = orders.length
    const totalItemTerjual = orders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    )

    res.json({
      orders,
      summary: { totalPendapatan, totalTransaksi, totalItemTerjual }
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
