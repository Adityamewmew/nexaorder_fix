const express = require('express')
const prisma = require('../db')
const fs = require('fs')
const path = require('path')
const { authMiddleware, adminOnly } = require('../middleware/auth')

const router = express.Router()

// GET /api/products — publik, bisa filter by categoryId
router.get('/', async (req, res) => {
  try {
    const { categoryId } = req.query
    const where = categoryId ? { categoryId: parseInt(categoryId) } : {}
    const products = await prisma.product.findMany({
      where,
      include: { 
        category: true,
        modifierGroups: {
          include: { modifiers: true }
        }
      },
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
      include: { 
        category: true,
        modifierGroups: {
          include: { modifiers: true }
        }
      }
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
    const { name, price, stock, description, image, categoryId, status, modifierGroups } = req.body
    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Nama, harga, dan kategori wajib' })
    }
    
    // Siapkan data modifierGroups jika ada
    const modifierGroupsData = modifierGroups && modifierGroups.length > 0 ? {
      create: modifierGroups.map(group => ({
        name: group.groupName || group.name,
        isRequired: group.isRequired || false,
        minSelections: group.minSelections || 0,
        maxSelections: group.maxSelections || 1,
        modifiers: {
          create: group.modifiers.map(mod => ({
            name: mod.modifierName || mod.name,
            price: parseInt(mod.price || 0)
          }))
        }
      }))
    } : undefined;

    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        stock: parseInt(stock || 0),
        description: description || null,
        image: image || null,
        categoryId: parseInt(categoryId),
        status: status || 'tersedia',
        ...(modifierGroupsData && { modifierGroups: modifierGroupsData })
      },
      include: { 
        category: true,
        modifierGroups: {
          include: { modifiers: true }
        }
      }
    })
    res.status(201).json(product)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// PUT /api/products/:id — admin only
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, price, stock, description, image, categoryId, status, modifierGroups } = req.body
    
    const productId = parseInt(req.params.id)

    // Jika ada update modifierGroups, kita hapus yang lama dan buat yang baru untuk simplicity
    if (modifierGroups !== undefined) {
      await prisma.modifierGroup.deleteMany({
        where: { productId }
      })
    }

    const modifierGroupsData = modifierGroups && modifierGroups.length > 0 ? {
      create: modifierGroups.map(group => ({
        name: group.groupName || group.name,
        isRequired: group.isRequired || false,
        minSelections: group.minSelections || 0,
        maxSelections: group.maxSelections || 1,
        modifiers: {
          create: group.modifiers.map(mod => ({
            name: mod.modifierName || mod.name,
            price: parseInt(mod.price || 0)
          }))
        }
      }))
    } : undefined;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        price: price !== undefined ? parseInt(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        description,
        image,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        status,
        ...(modifierGroupsData && { modifierGroups: modifierGroupsData })
      },
      include: { 
        category: true,
        modifierGroups: {
          include: { modifiers: true }
        }
      }
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
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    })
    
    if (!product) return res.status(404).json({ error: 'Produk tidak ditemukan' })
      
    // Hapus file gambar jika ada
    if (product.image) {
      const filename = product.image.split('/').pop()
      const filepath = path.join(__dirname, '../../uploads', filename)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
    }

    await prisma.product.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Produk dihapus' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
