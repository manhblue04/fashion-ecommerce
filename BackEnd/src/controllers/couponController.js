const Coupon = require('../models/Coupon')

exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderTotal } = req.body

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: Date.now() },
    })

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' })
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' })
    }

    if (coupon.minOrderValue > 0 && orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')}₫`,
      })
    }

    let discount =
      coupon.discountType === 'percent'
        ? Math.round((orderTotal * coupon.value) / 100)
        : coupon.value

    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        value: coupon.value,
        discount,
      },
    })
  } catch (error) {
    next(error)
  }
}
