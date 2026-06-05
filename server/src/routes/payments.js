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
      // Generate Midtrans Snap Transaction
      const serverKey = process.env.MIDTRANS_SERVER_KEY
      if (!serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY tidak ditemukan di environment variables')
      }
      const authHeader = 'Basic ' + Buffer.from(serverKey + ':').toString('base64')

      // Sandbox URL for Snap API
      const midtransUrl = 'https://app.sandbox.midtrans.com/snap/v1/transactions'
      
      // We append a timestamp to the order_id so that retrying payments won't fail with a duplicate ID error in Midtrans Sandbox
      const midtransOrderId = `NEXA-${orderId}-${Date.now()}`

      const midtransRes = await fetch(midtransUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          transaction_details: {
            order_id: midtransOrderId,
            gross_amount: order.total
          },
          credit_card: {
            secure: true
          },
          customer_details: {
            first_name: order.customerName || 'Customer',
            phone: order.phone || ''
          }
        })
      })

      const midtransData = await midtransRes.json()

      if (!midtransRes.ok || !midtransData.token) {
        console.error('Midtrans API Error:', midtransData)
        return res.status(500).json({ error: midtransData.error_messages ? midtransData.error_messages.join(', ') : 'Gagal membuat transaksi di Midtrans' })
      }

      // We do not save a Payment record yet for QRIS because it is unpaid. 
      // It will be created when the webhook notifies us of a successful payment.
      return res.status(201).json({
        token: midtransData.token,
        redirectUrl: midtransData.redirect_url
      })
    } else {
      // CASH payment method
      const payment = await prisma.payment.create({
        data: {
          orderId: parseInt(orderId),
          method,
          amount: order.total
        }
      })

      // Emit sse event to notify cashier of a new CASH order that is ready to be handled
      sseEvents.emit('new-order', order)

      return res.status(201).json(payment)
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

module.exports = router
