const Wishlist = require('../models/Wishlist')

exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      'products',
      'name slug price discountPrice images rating numReviews stock'
    )

    if (!wishlist) {
      wishlist = { products: [] }
    }

    res.json({ success: true, wishlist: wishlist.products })
  } catch (error) {
    next(error)
  }
}

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body
    let wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [productId] })
      return res.json({ success: true, message: 'Đã thêm vào danh sách yêu thích', added: true })
    }

    const index = wishlist.products.indexOf(productId)
    if (index > -1) {
      wishlist.products.splice(index, 1)
      await wishlist.save()
      return res.json({ success: true, message: 'Đã xóa khỏi danh sách yêu thích', added: false })
    }

    wishlist.products.push(productId)
    await wishlist.save()
    res.json({ success: true, message: 'Đã thêm vào danh sách yêu thích', added: true })
  } catch (error) {
    next(error)
  }
}
