const router = require('express').Router()
const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getSaleProducts,
  searchSuggestions,
} = require('../controllers/productController')

router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)
router.get('/new-arrivals', getNewArrivals)
router.get('/best-sellers', getBestSellers)
router.get('/sale', getSaleProducts)
router.get('/search-suggestions', searchSuggestions)
router.get('/:slug', getProduct)

module.exports = router
