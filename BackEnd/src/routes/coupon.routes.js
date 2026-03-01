const router = require('express').Router()
const { protect } = require('../middlewares/auth')
const { validateCoupon } = require('../controllers/couponController')

router.post('/validate', protect, validateCoupon)

module.exports = router
