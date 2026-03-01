const router = require('express').Router()
const { protect } = require('../middlewares/auth')
const { getWishlist, toggleWishlist } = require('../controllers/wishlistController')

router.use(protect)
router.get('/', getWishlist)
router.post('/toggle', toggleWishlist)

module.exports = router
