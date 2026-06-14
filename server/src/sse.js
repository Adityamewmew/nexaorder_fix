const { EventEmitter } = require('events');
const jwt = require('jsonwebtoken');

const sseEvents = new EventEmitter();
let clients = [];

function sseHandler(req, res) {
  const token = req.query.token;
  const orderId = req.query.orderId;

  // Jika ada orderId, bypass token check (untuk customer yang melacak status order miliknya)
  if (!orderId) {
    if (!token) {
      res.status(401).json({ error: 'Token required' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = decoded;
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
  }

  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Prevent nginx/Railway proxy from buffering SSE
  res.flushHeaders();

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ event: 'connected', message: 'SSE connection established' })}\n\n`);

  if (orderId) {
    res.orderId = parseInt(orderId);
  }
  clients.push(res);

  // Keep connection alive with a heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    clients = clients.filter(client => client !== res);
  });
}

function broadcast(event, data) {
  clients.forEach(client => {
    // Jika client ini spesifik memantau orderId tertentu
    if (client.orderId) {
      if (event === 'order-updated' && data && data.id === client.orderId) {
        const payload = JSON.stringify({ event, data });
        client.write(`data: ${payload}\n\n`);
      }
      return;
    }

    // Untuk client merchant, kirim semua event
    const payload = JSON.stringify({ event, data });
    client.write(`data: ${payload}\n\n`);
  });
}

// Set up local event listeners to broadcast to all SSE connections
sseEvents.on('new-order', (order) => {
  broadcast('new-order', order);
});

sseEvents.on('order-updated', (order) => {
  broadcast('order-updated', order);
});

module.exports = {
  sseHandler,
  sseEvents
};
