const Order = require('../models/Order')
const { createMoMoPayment } = require('../config/momo')
const { createVNPayUrl } = require('../config/vnpay')

exports.createMoMoPaymentUrl = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    const result = await createMoMoPayment({
      orderId: order._id.toString(),
      amount: order.totalPrice,
      orderInfo: `Thanh toán đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
    })

    if (result.resultCode === 0) {
      return res.json({ success: true, payUrl: result.payUrl })
    }

    res.status(400).json({ success: false, message: result.message || 'Lỗi tạo thanh toán MoMo' })
  } catch (error) {
    next(error)
  }
}

exports.createVNPayPaymentUrl = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    const payUrl = createVNPayUrl({
      orderId: order._id.toString(),
      amount: order.totalPrice,
      orderInfo: `Thanh toan don hang #${order._id.toString().slice(-6).toUpperCase()}`,
      ipAddr: req.ip,
    })

    res.json({ success: true, payUrl })
  } catch (error) {
    next(error)
  }
}

exports.momoCallback = async (req, res, next) => {
  try {
    const { orderId, resultCode } = req.body

    const realOrderId = orderId.split('_')[0]
    const order = await Order.findById(realOrderId)

    if (order && resultCode === 0) {
      order.paymentStatus = 'paid'
      order.paidAt = Date.now()
      await order.save()
    }

    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

exports.vnpayReturn = async (req, res, next) => {
  try {
    const { vnp_TxnRef, vnp_ResponseCode } = req.query

    if (vnp_ResponseCode === '00') {
      const order = await Order.findById(vnp_TxnRef)
      if (order) {
        order.paymentStatus = 'paid'
        order.paidAt = Date.now()
        await order.save()
      }
    }

    res.redirect(`${process.env.CLIENT_URL}/don-hang/${vnp_TxnRef}`)
  } catch (error) {
    next(error)
  }
}
