require('dotenv').config()
const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

const http = require('http')
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/errorHandler')
const { initSocket } = require('./socket')

const app = express()
const server = http.createServer(app)

connectDB()

// Security
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}))
app.set('trust proxy', 1)

// CORS — hỗ trợ nhiều origin qua CLIENT_URL (phân tách bằng dấu phẩy)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Rate limiting
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
}))

// Routes
app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/products', require('./routes/product.routes'))
app.use('/api/categories', require('./routes/category.routes'))
app.use('/api/orders', require('./routes/order.routes'))
app.use('/api/reviews', require('./routes/review.routes'))
app.use('/api/wishlist', require('./routes/wishlist.routes'))
app.use('/api/coupons', require('./routes/coupon.routes'))
app.use('/api/banners', require('./routes/banner.routes'))
app.use('/api/settings', require('./routes/setting.routes'))
app.use('/api/admin', require('./routes/admin.routes'))
app.use('/api/payment', require('./routes/payment.routes'))
app.use('/api/outfits', require('./routes/outfit.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/chat', require('./routes/chat.routes'))

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server đang hoạt động' })
})

// Error handler
app.use(errorHandler)

// Socket.IO
initSocket(server, allowedOrigins)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server chạy tại port ${PORT} [${process.env.NODE_ENV}]`)
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`)
})
