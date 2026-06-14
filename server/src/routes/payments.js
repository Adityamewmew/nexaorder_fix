const express = require('express')
const crypto = require('crypto')
const prisma = require('../db')
const { sseEvents } = require('../sse')

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

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { table: true }
    })
    if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' })

    if (method === 'QRIS') {
      if (req.body.isManual) {
        const payment = await prisma.payment.create({
          data: {
            orderId: parseInt(orderId),
            method: 'QRIS',
            amount: order.total
          }
        })
        return res.status(201).json(payment)
      }

      // Generate QRIS charge via Midtrans Core API v2 (direct QR, no Snap popup)
      const serverKey = process.env.MIDTRANS_SERVER_KEY
      if (!serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY tidak ditemukan di environment variables')
      }
      const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64')

      // Core API v2 charge endpoint — berbeda dari Snap API
      const midtransUrl = 'https://api.sandbox.midtrans.com/v2/charge'

      // Append timestamp agar retrying tidak gagal karena duplicate order_id
      const midtransOrderId = `NEXA-${orderId}-${Date.now()}`

      const midtransRes = await fetch(midtransUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          payment_type: 'qris',
          transaction_details: {
            order_id: midtransOrderId,
            gross_amount: order.total
          },
          qris: {
            acquirer: 'gopay'
          },
          customer_details: {
            first_name: order.customerName || 'Customer',
            phone: order.phone || ''
          }
        })
      })

      const midtransData = await midtransRes.json()

      if (!midtransRes.ok || !['200', '201'].includes(String(midtransData.status_code))) {
        console.error('Midtrans Core API Error:', midtransData)
        return res.status(500).json({ error: midtransData.status_message || 'Gagal membuat transaksi QRIS di Midtrans' })
      }

      // Extract QR image URL dari actions array Midtrans
      const qrAction = midtransData.actions?.find(a => a.name === 'generate-qr-code')
      const qrImageUrl = qrAction?.url || null

      // Buat payment record dengan amount=0 sebagai marker "QRIS menunggu pembayaran"
      // amount akan di-update ke nilai sebenarnya ketika pembayaran dikonfirmasi
      await prisma.payment.upsert({
        where: { orderId: parseInt(orderId) },
        create: { orderId: parseInt(orderId), method: 'QRIS', amount: 0 },
        update: { method: 'QRIS', amount: 0 }
      })

      // Ambil order lengkap dengan payment untuk dikirim ke merchant
      const orderWithPayment = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { items: { include: { product: true } }, table: true, payment: true }
      })

      // Notifikasi merchant — pesanan masuk tapi terkunci (QRIS belum dibayar)
      sseEvents.emit('new-order', orderWithPayment)

      return res.status(201).json({
        qrImageUrl,
        qrString: midtransData.qr_string,
        expiryTime: midtransData.expiry_time,
        transactionId: midtransData.transaction_id,
        orderId
      })
    } else {
      // CASH payment method — buat payment dan langsung notifikasi merchant
      await prisma.payment.create({
        data: {
          orderId: parseInt(orderId),
          method,
          amount: order.total
        }
      })

      // Ambil order lengkap dengan payment
      const orderWithPayment = await prisma.order.findUnique({
        where: { id: parseInt(orderId) },
        include: { items: { include: { product: true } }, table: true, payment: true }
      })

      // Emit new-order dengan info payment lengkap agar merchant tahu ini CASH
      sseEvents.emit('new-order', orderWithPayment)

      return res.status(201).json(orderWithPayment?.payment)
    }
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Pembayaran sudah ada untuk pesanan ini' })
    res.status(500).json({ error: e.message })
  }
})

// POST /api/payments/midtrans-webhook — webhook handler from Midtrans
router.post('/midtrans-webhook', async (req, res) => {
  try {
    const { order_id, transaction_status, status_code, gross_amount, signature_key } = req.body

    if (!order_id || !transaction_status || !status_code || !gross_amount || !signature_key) {
      return res.status(400).json({ error: 'Payload tidak lengkap' })
    }

    // Verify webhook signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY
    if (!serverKey) {
      console.error('Webhook Error: MIDTRANS_SERVER_KEY tidak terkonfigurasi')
      return res.status(500).json({ error: 'Server key tidak terkonfigurasi' })
    }
    const dataToHash = `${order_id}${status_code}${gross_amount}${serverKey}`
    const calculatedSignature = crypto.createHash('sha512').update(dataToHash).digest('hex')

    if (calculatedSignature !== signature_key) {
      console.warn(`Webhook Warn: Invalid signature for transaction order_id: ${order_id}`)
      return res.status(403).json({ error: 'Signature tidak valid' })
    }

    // Parse order ID from NEXA-{orderId}-{timestamp}
    const parts = order_id.split('-')
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Format order_id tidak valid' })
    }
    const orderId = parseInt(parts[1])

    console.log(`Webhook Log: Received payment notification for order #${orderId} with status: ${transaction_status}`)

    if (['settlement', 'capture'].includes(transaction_status)) {
      // Update order status to PAID
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
        include: {
          items: { include: { product: true } },
          table: true,
          payment: true
        }
      })

      // Check if Payment record already exists, if not create it
      const existingPayment = await prisma.payment.findUnique({
        where: { orderId: orderId }
      })

      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            orderId: orderId,
            method: 'QRIS',
            amount: order.total
          }
        })
      }

      // Notify cashiers via SSE of the order update (paid)
      sseEvents.emit('order-updated', order)
      console.log(`Webhook Success: Order #${orderId} marked as PAID.`)
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      // Update order status to CANCELLED
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
        include: {
          items: { include: { product: true } },
          table: true,
          payment: true
        }
      })

      // Restore stocks for each product in the order items
      for (const item of order.items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              status: 'tersedia'
            }
          })
        }
      }

      // Notify cashiers via SSE
      sseEvents.emit('order-updated', order)
      console.log(`Webhook Cancel: Order #${orderId} cancelled due to transaction status: ${transaction_status}`)
    }

    return res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error("Webhook Error: Error processing Midtrans webhook:", error)
    return res.status(500).json({ error: error.message })
  }
})

// POST /api/payments/dev-simulate — konfirmasi pembayaran QRIS (simulasi)
// Mengubah payment.amount dari 0 (pending) menjadi nilai sebenarnya (confirmed)
// Order tetap PENDING agar masuk antrean dapur
router.post('/dev-simulate', async (req, res) => {
  try {
    const { orderId } = req.body
    if (!orderId) {
      return res.status(400).json({ error: 'orderId wajib diisi' })
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: { include: { product: true } }, table: true, payment: true }
    })

    if (!order) {
      return res.status(404).json({ error: 'Pesanan tidak ditemukan' })
    }

    // Update payment: amount dari 0 (unconfirmed) ke nilai sebenarnya (confirmed)
    // Ini yang membedakan QRIS pending vs QRIS lunas di merchant UI
    await prisma.payment.upsert({
      where: { orderId: parseInt(orderId) },
      create: { orderId: parseInt(orderId), method: 'QRIS', amount: order.total },
      update: { amount: order.total }
    })

    // Ambil order terbaru dengan payment yang sudah diupdate
    const updatedOrder = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { items: { include: { product: true } }, table: true, payment: true }
    })

    // Emit order-updated agar merchant UI refresh tampilan (buka kunci pesanan)
    sseEvents.emit('order-updated', updatedOrder)

    console.log(`[QRIS] Pembayaran dikonfirmasi untuk order #${orderId}, pesanan terbuka untuk diproses`)
    return res.status(200).json({ status: 'ok', message: `Pembayaran QRIS order #${orderId} dikonfirmasi` })
  } catch (error) {
    console.error('[QRIS] Konfirmasi pembayaran gagal:', error)
    return res.status(500).json({ error: error.message })
  }
})


module.exports = router
