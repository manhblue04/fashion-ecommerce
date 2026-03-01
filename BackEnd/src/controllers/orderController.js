const Order = require('../models/Order')
const OrderLog = require('../models/OrderLog')
const Product = require('../models/Product')
const Coupon = require('../models/Coupon')
const Setting = require('../models/Setting')

exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống' })
    }

    let itemsPrice = 0
    const validatedItems = []

    for (const item of orderItems) {
      const product = await Product.findById(item.product)
      if (!product || !product.isActive || product.isDeleted) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${item.name}" không còn khả dụng` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm` })
      }

      const price = product.discountPrice > 0 ? product.discountPrice : product.price
      itemsPrice += price * item.quantity

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      })
    }

    const settings = await Setting.findOne()
    const shippingPrice =
      settings && itemsPrice >= settings.shipping.freeShippingThreshold
        ? 0
        : settings?.shipping.fee || 30000
    const taxPrice = settings?.tax.enabled ? Math.round(itemsPrice * settings.tax.percent / 100) : 0

    let discountPrice = 0
    let couponId = null
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiresAt: { $gt: Date.now() },
      })

      if (!coupon) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' })
      }
      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' })
      }
      if (coupon.minOrderValue > 0 && itemsPrice < coupon.minOrderValue) {
        return res.status(400).json({ success: false, message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫ để sử dụng mã này` })
      }

      discountPrice = coupon.discountType === 'percent'
        ? Math.round(itemsPrice * coupon.value / 100)
        : coupon.value

      if (coupon.maxDiscount > 0 && discountPrice > coupon.maxDiscount) {
        discountPrice = coupon.maxDiscount
      }

      coupon.usedCount += 1
      await coupon.save()
      couponId = coupon._id
    }

    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountPrice

    const order = await Order.create({
      user: req.user._id,
      orderItems: validatedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      discountPrice,
      totalPrice,
      coupon: couponId,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'pending',
    })

    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      })
    }

    await OrderLog.create({
      order: order._id,
      status: 'pending',
      changedBy: req.user._id,
      note: 'Đơn hàng mới được tạo',
    })

    res.status(201).json({ success: true, message: 'Đặt hàng thành công', order })
  } catch (error) {
    next(error)
  }
}

exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const skip = (page - 1) * limit

    const filter = { user: req.user._id }
    if (req.query.status) filter.orderStatus = req.query.status

    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
}

exports.getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('coupon', 'code discountType value')

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    const logs = await OrderLog.find({ order: order._id }).sort('changedAt')

    res.json({ success: true, order, logs })
  } catch (error) {
    next(error)
  }
}

exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Không thể hủy đơn hàng ở trạng thái này' })
    }

    order.orderStatus = 'cancelled'
    await order.save()

    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity },
      })
    }

    await OrderLog.create({
      order: order._id,
      status: 'cancelled',
      changedBy: req.user._id,
      note: 'Người dùng hủy đơn hàng',
    })

    res.json({ success: true, message: 'Hủy đơn hàng thành công' })
  } catch (error) {
    next(error)
  }
}
