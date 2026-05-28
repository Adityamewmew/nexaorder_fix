const express = require('express')
const prisma = require('../db')
const { authMiddleware, adminOnly } = require('../middleware/auth')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ include: { products: true } })
    res.json(categories)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Nama kategori wajib' })
    const category = await prisma.category.create({ data: { name } })
    res.status(201).json(category)
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Kategori sudah ada' })
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } })
    res.json({ message: 'Kategori dihapus' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

module.exports = router
