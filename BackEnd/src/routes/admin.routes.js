const router = require('express').Router()
const { protect, admin } = require('../middlewares/auth')
const ac = require('../controllers/adminController')

router.use(protect, admin)

// Dashboard
router.get('/dashboard', ac.getDashboard)

// Products
router.get('/products', ac.getAllProducts)
router.post('/products', ac.createProduct)
router.put('/products/:id', ac.updateProduct)
router.delete('/products/:id', ac.deleteProduct)

// Categories
router.get('/categories', ac.getAllCategories)
router.post('/categories', ac.createCategory)
router.put('/categories/:id', ac.updateCategory)
router.delete('/categories/:id', ac.deleteCategory)

// Orders
router.get('/orders', ac.getAllOrders)
router.get('/orders/:id', ac.getOrderDetail)
router.put('/orders/:id/status', ac.updateOrderStatus)

// Users
router.get('/users', ac.getAllUsers)
router.get('/users/:id', ac.getUserDetail)
router.put('/users/:id/block', ac.toggleBlockUser)
router.put('/users/:id/role', ac.updateUserRole)

// Reviews
router.get('/reviews', ac.getAllReviews)
router.delete('/reviews/:id', ac.deleteReview)

// Banners
router.get('/banners', ac.getAllBanners)
router.post('/banners', ac.createBanner)
router.put('/banners/:id', ac.updateBanner)
router.delete('/banners/:id', ac.deleteBanner)

// Coupons
router.get('/coupons', ac.getAllCoupons)
router.post('/coupons', ac.createCoupon)
router.put('/coupons/:id', ac.updateCoupon)
router.delete('/coupons/:id', ac.deleteCoupon)

// Outfits
router.get('/outfits', ac.getAllOutfits)
router.post('/outfits', ac.createOutfit)
router.put('/outfits/:id', ac.updateOutfit)
router.delete('/outfits/:id', ac.deleteOutfit)

// Settings
router.get('/settings', ac.getSettings)
router.put('/settings', ac.updateSettings)

module.exports = router
