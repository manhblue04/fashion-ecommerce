require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const connectDB = require('./config/db')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

connectDB()

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau' },
})
app.use('/api', limiter)

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

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server đang hoạt động' })
})

app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server đang chạy tại port ${PORT}`)
})
