const express = require('express')
const prisma = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

// GET /api/products — publik, bisa filter by categoryId
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query
    const where = categoryId ? { categoryId: parseInt(categoryId) } : {}
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(products)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/products/:id — publik
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true }
    })
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' })
    res.json(product)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// POST /api/products — admin only
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, price, stock, description, image, categoryId, status } = req.body
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Nama, harga, dan kategori wajib' })
    }
    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        stock: parseInt(stock || 0),
        description: description || null,
        image: image || null,
        categoryId: parseInt(categoryId),
        status: status || 'tersedia'
      },
      include: { category: true }
    })
    res.status(201).json(product)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/products/:id — admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, price, stock, description, image, categoryId, status } = req.body
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        price: price !== undefined ? parseInt(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        description,
        image,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        status
      },
      include: { category: true }
    })
    res.json(product)
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Produk tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

// PATCH /api/products/:id/stock — admin dan kasir
router.patch('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { stock, status } = req.body
    const data = {}
    if (stock !== undefined) data.stock = parseInt(stock)
    if (status) data.status = status
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data
    })
    res.json(product)
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Produk tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

// DELETE /api/products/:id — admin only
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Produk dihapus' })
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Produk tidak ditemukan' })
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
