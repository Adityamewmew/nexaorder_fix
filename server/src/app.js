const path = require('path')
// Load .env manual tanpa dotenv (hindari dotenvx hook)
const fs = require('fs')
const envPath = path.join(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...vals] = line.split('=')
    if (key && key.trim() && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '')
    }
  })
}
const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const categoryRoutes = require('./routes/kategori')
const productRoutes = require('./routes/products')
const tableRoutes = require('./routes/tables')
const orderRoutes = require('./routes/orders')
const paymentRoutes = require('./routes/payments')
const userRoutes = require('./routes/users')
const dashboardRoutes = require('./routes/dashboard')
const uploadRoutes = require('./routes/upload')

const app = express()

app.use(cors())
app.use(express.json())

// Serve uploaded images
const serveStatic = require('serve-static')
app.use('/uploads', serveStatic(path.join(__dirname, '../uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/upload', uploadRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
