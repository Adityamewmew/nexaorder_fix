const prisma = require('./db');
const { sseEvents } = require('./sse');

function startAutoCancelWorker() {
  console.log("Background worker started: checking for expired pending orders every minute.");

  // Check every 60 seconds
  setInterval(async () => {
    try {
      // 15 minutes ago
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      // Find all PENDING orders older than 15 minutes
      const ordersToCancel = await prisma.order.findMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: fifteenMinutesAgo
          }
        },
        include: {
          items: true
        }
      });

      if (ordersToCancel.length === 0) return;

      console.log(`Worker: Found ${ordersToCancel.length} expired pending orders. Canceling...`);

      for (const order of ordersToCancel) {
        await prisma.$transaction(async (tx) => {
          // 1. Update order status to CANCELLED
          const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' },
            include: {
              items: { include: { product: true } },
              table: true,
              payment: true
            }
          });

          // 2. Restore stocks for each product in the order items
          for (const item of order.items) {
            if (item.productId) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stock: { increment: item.quantity },
                  status: 'tersedia' // Reset status to available if stock is restored
                }
              });
            }
          }

          // 3. Emit SSE event so Cashier screens get updated
          sseEvents.emit('order-updated', updatedOrder);
          console.log(`Worker: Auto-cancelled order #${order.id} and restored inventory.`);
        });
      }
    } catch (error) {
      console.error("Worker Error: Auto-cancel background job failed:", error);
    }
  }, 60000);
}

module.exports = { startAutoCancelWorker };
