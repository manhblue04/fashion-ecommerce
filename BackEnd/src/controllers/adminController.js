const User = require('../models/User')
const Product = require('../models/Product')
const Category = require('../models/Category')
const Order = require('../models/Order')
const OrderLog = require('../models/OrderLog')
const Review = require('../models/Review')
const Banner = require('../models/Banner')
const Setting = require('../models/Setting')
const Coupon = require('../models/Coupon')
const cloudinary = require('../config/cloudinary')

// ── Dashboard ──
exports.getDashboard = async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Product.countDocuments({ isDeleted: false }),
      User.countDocuments({ role: 'user' }),
    ])

    const revenueByMonth = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    const recentOrders = await Order.find().sort('-createdAt').limit(5).populate('user', 'name email')

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalUsers,
      },
      revenueByMonth,
      recentOrders,
    })
  } catch (error) {
    next(error)
  }
}

// ── Products ──
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit
    const filter = { isDeleted: false }

    if (req.query.keyword) filter.name = { $regex: req.query.keyword, $options: 'i' }
    if (req.query.category) filter.category = req.query.category
    if (req.query.gender) filter.gender = req.query.gender
    if (req.query.brand) filter.brand = { $regex: req.query.brand, $options: 'i' }

    const total = await Product.countDocuments(filter)
    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({ success: true, products, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
}

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, discountPrice, category, stock, isFeatured, images, sizes, colors, brand, material, gender } = req.body

    const uploadedImages = []
    if (images && images.length > 0) {
      for (const img of images) {
        const result = await cloudinary.uploader.upload(img, { folder: 'products' })
        uploadedImages.push({ public_id: result.public_id, url: result.secure_url })
      }
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || 0,
      category,
      stock,
      isFeatured: isFeatured || false,
      images: uploadedImages,
      sizes: sizes || [],
      colors: colors || [],
      brand: brand || '',
      material: material || '',
      gender: gender || 'unisex',
    })

    res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', product })
  } catch (error) {
    next(error)
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
    }

    const { newImages, removeImages, ...updateData } = req.body

    if (removeImages && removeImages.length > 0) {
      for (const publicId of removeImages) {
        await cloudinary.uploader.destroy(publicId)
      }
      product.images = product.images.filter((img) => !removeImages.includes(img.public_id))
    }

    if (newImages && newImages.length > 0) {
      for (const img of newImages) {
        const result = await cloudinary.uploader.upload(img, { folder: 'products' })
        product.images.push({ public_id: result.public_id, url: result.secure_url })
      }
    }

    Object.assign(product, updateData)
    await product.save()

    res.json({ success: true, message: 'Cập nhật sản phẩm thành công', product })
  } catch (error) {
    next(error)
  }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true })
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
    }
    res.json({ success: true, message: 'Xóa sản phẩm thành công' })
  } catch (error) {
    next(error)
  }
}

// ── Categories ──
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name')
    res.json({ success: true, categories })
  } catch (error) {
    next(error)
  }
}

exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body
    let imageData = { public_id: '', url: '' }

    if (image) {
      const result = await cloudinary.uploader.upload(image, { folder: 'categories' })
      imageData = { public_id: result.public_id, url: result.secure_url }
    }

    const category = await Category.create({ name, description, image: imageData })
    res.status(201).json({ success: true, message: 'Tạo danh mục thành công', category })
  } catch (error) {
    next(error)
  }
}

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' })
    }

    if (req.body.image && req.body.image !== category.image?.url) {
      if (category.image?.public_id) await cloudinary.uploader.destroy(category.image.public_id)
      const result = await cloudinary.uploader.upload(req.body.image, { folder: 'categories' })
      req.body.image = { public_id: result.public_id, url: result.secure_url }
    }

    Object.assign(category, req.body)
    await category.save()
    res.json({ success: true, message: 'Cập nhật danh mục thành công', category })
  } catch (error) {
    next(error)
  }
}

exports.deleteCategory = async (req, res, next) => {
  try {
    const productCount = await Product.countDocuments({ category: req.params.id, isDeleted: false })
    if (productCount > 0) {
      return res.status(400).json({ success: false, message: `Không thể xóa: danh mục đang có ${productCount} sản phẩm` })
    }

    await Category.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Xóa danh mục thành công' })
  } catch (error) {
    next(error)
  }
}

// ── Orders ──
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit
    const filter = {}

    if (req.query.status) filter.orderStatus = req.query.status

    const total = await Order.countDocuments(filter)
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort(req.query.sort || '-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
}

exports.getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone').populate('coupon', 'code')
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }
    const logs = await OrderLog.find({ order: order._id }).populate('changedBy', 'name').sort('changedAt')
    res.json({ success: true, order, logs })
  } catch (error) {
    next(error)
  }
}

const STATUS_FLOW = ['pending', 'processing', 'shipping', 'delivered']

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    const { status } = req.body

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã bị hủy' })
    }
    if (order.orderStatus === 'delivered') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã giao thành công' })
    }

    if (status === 'cancelled') {
      order.orderStatus = 'cancelled'
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } })
      }
    } else {
      const currentIdx = STATUS_FLOW.indexOf(order.orderStatus)
      const nextIdx = STATUS_FLOW.indexOf(status)
      if (nextIdx <= currentIdx) {
        return res.status(400).json({ success: false, message: 'Không thể quay ngược trạng thái đơn hàng' })
      }
      order.orderStatus = status
      if (status === 'delivered') {
        order.deliveredAt = Date.now()
        if (order.paymentMethod === 'COD') order.paymentStatus = 'paid'
      }
    }

    await order.save()
    await OrderLog.create({ order: order._id, status, changedBy: req.user._id })

    res.json({ success: true, message: 'Cập nhật trạng thái thành công', order })
  } catch (error) {
    next(error)
  }
}

// ── Users ──
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const total = await User.countDocuments()
    const users = await User.find().sort('-createdAt').skip(skip).limit(limit)

    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
}

exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' })

    const orderCount = await Order.countDocuments({ user: user._id })
    res.json({ success: true, user, orderCount })
  } catch (error) {
    next(error)
  }
}

exports.toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' })

    user.isBlocked = !user.isBlocked
    await user.save()

    res.json({
      success: true,
      message: user.isBlocked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
    })
  } catch (error) {
    next(error)
  }
}

exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true })
    if (!user) return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' })
    res.json({ success: true, message: 'Cập nhật quyền thành công', user })
  } catch (error) {
    next(error)
  }
}

// ── Reviews ──
exports.getAllReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 20
    const skip = (page - 1) * limit

    const total = await Review.countDocuments()
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('product', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({ success: true, reviews, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
}

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá' })

    const productId = review.product
    await review.deleteOne()

    const stats = await Review.aggregate([
      { $match: { product: productId } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
    ])
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, { rating: Math.round(stats[0].avgRating * 10) / 10, numReviews: stats[0].numReviews })
    } else {
      await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 })
    }

    res.json({ success: true, message: 'Xóa đánh giá thành công' })
  } catch (error) {
    next(error)
  }
}

// ── Banners ──
exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find().sort('order')
    res.json({ success: true, banners })
  } catch (error) {
    next(error)
  }
}

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, link, type, order } = req.body
    const result = await cloudinary.uploader.upload(image, { folder: 'banners' })

    const banner = await Banner.create({
      title,
      subtitle,
      image: { public_id: result.public_id, url: result.secure_url },
      link,
      type,
      order: order || 0,
    })

    res.status(201).json({ success: true, message: 'Tạo banner thành công', banner })
  } catch (error) {
    next(error)
  }
}

exports.updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' })

    if (req.body.image && req.body.image.startsWith('data:')) {
      if (banner.image?.public_id) await cloudinary.uploader.destroy(banner.image.public_id)
      const result = await cloudinary.uploader.upload(req.body.image, { folder: 'banners' })
      req.body.image = { public_id: result.public_id, url: result.secure_url }
    } else {
      delete req.body.image
    }

    Object.assign(banner, req.body)
    await banner.save()
    res.json({ success: true, message: 'Cập nhật banner thành công', banner })
  } catch (error) {
    next(error)
  }
}

exports.deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findById(req.params.id)
    if (!banner) return res.status(404).json({ success: false, message: 'Không tìm thấy banner' })

    if (banner.image?.public_id) await cloudinary.uploader.destroy(banner.image.public_id)
    await banner.deleteOne()
    res.json({ success: true, message: 'Xóa banner thành công' })
  } catch (error) {
    next(error)
  }
}

// ── Coupons ──
exports.getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt')
    res.json({ success: true, coupons })
  } catch (error) {
    next(error)
  }
}

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body)
    res.status(201).json({ success: true, message: 'Tạo mã giảm giá thành công', coupon })
  } catch (error) {
    next(error)
  }
}

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!coupon) return res.status(404).json({ success: false, message: 'Không tìm thấy mã giảm giá' })
    res.json({ success: true, message: 'Cập nhật mã giảm giá thành công', coupon })
  } catch (error) {
    next(error)
  }
}

exports.deleteCoupon = async (req, res, next) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Xóa mã giảm giá thành công' })
  } catch (error) {
    next(error)
  }
}

// ── Settings ──
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) settings = await Setting.create({})
    res.json({ success: true, settings })
  } catch (error) {
    next(error)
  }
}

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) settings = new Setting()

    if (req.body.logo && req.body.logo.startsWith('data:')) {
      if (settings.logo?.public_id) await cloudinary.uploader.destroy(settings.logo.public_id)
      const result = await cloudinary.uploader.upload(req.body.logo, { folder: 'settings' })
      req.body.logo = { public_id: result.public_id, url: result.secure_url }
    } else {
      delete req.body.logo
    }

    Object.assign(settings, req.body)
    await settings.save()
    res.json({ success: true, message: 'Cập nhật cài đặt thành công', settings })
  } catch (error) {
    next(error)
  }
}
