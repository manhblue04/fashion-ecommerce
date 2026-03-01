const Review = require('../models/Review')
const Product = require('../models/Product')
const Order = require('../models/Order')

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numReviews: { $sum: 1 } } },
  ])

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    })
  } else {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 })
  }
}

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body

    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'orderItems.product': productId,
      orderStatus: 'delivered',
    })

    if (!hasPurchased) {
      return res.status(400).json({ success: false, message: 'Bạn cần mua sản phẩm trước khi đánh giá' })
    }

    const existingReview = await Review.findOne({ user: req.user._id, product: productId })
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'Bạn đã đánh giá sản phẩm này rồi' })
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    })

    await updateProductRating(productId)

    const populated = await review.populate('user', 'name avatar')
    res.status(201).json({ success: true, message: 'Đánh giá thành công', review: populated })
  } catch (error) {
    next(error)
  }
}

exports.getProductReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const skip = (page - 1) * limit

    const total = await Review.countDocuments({ product: req.params.productId })
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)

    res.json({ success: true, reviews, total, page, pages: Math.ceil(total / limit) })
  } catch (error) {
    next(error)
  }
}
