const router = require('express').Router()
const { protect } = require('../middlewares/auth')
const { createOrder, getMyOrders, getOrderDetail, cancelOrder } = require('../controllers/orderController')

router.use(protect)
router.post('/', createOrder)
router.get('/my-orders', getMyOrders)
router.get('/:id', getOrderDetail)
router.put('/:id/cancel', cancelOrder)

module.exports = router
