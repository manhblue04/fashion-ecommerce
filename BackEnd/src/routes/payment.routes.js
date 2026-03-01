const router = require('express').Router()
const { protect } = require('../middlewares/auth')
const {
  createMoMoPaymentUrl,
  createVNPayPaymentUrl,
  momoCallback,
  vnpayReturn,
} = require('../controllers/paymentController')

router.post('/momo/create', protect, createMoMoPaymentUrl)
router.post('/vnpay/create', protect, createVNPayPaymentUrl)
router.post('/momo/callback', momoCallback)
router.get('/vnpay/return', vnpayReturn)

module.exports = router
