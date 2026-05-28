const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token required' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

function adminOnly(req, res, next) {
  if (!['SUPERADMIN', 'MERCHANT_ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin only' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }
