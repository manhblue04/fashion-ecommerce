const router = require('express').Router()
const { protect } = require('../middlewares/auth')
const { createReview, getProductReviews } = require('../controllers/reviewController')

router.get('/product/:productId', getProductReviews)
router.post('/', protect, createReview)

module.exports = router
