const Product = require('../models/Product')
const ApiFeatures = require('../utils/apiFeatures')

exports.getProducts = async (req, res, next) => {
  try {
    const perPage = parseInt(req.query.limit, 10) || 12
    const baseFilter = { isActive: true, isDeleted: false }

    if (req.query.gender) baseFilter.gender = req.query.gender
    if (req.query.size) baseFilter.sizes = req.query.size
    if (req.query.color) baseFilter.colors = { $regex: req.query.color, $options: 'i' }
    if (req.query.brand) baseFilter.brand = { $regex: req.query.brand, $options: 'i' }

    const apiFeatures = new ApiFeatures(
      Product.find(baseFilter).populate('category', 'name slug'),
      req.query
    )
      .search()
      .filter()
      .sort()

    const total = await Product.countDocuments(apiFeatures.query.getFilter())
    apiFeatures.paginate(perPage)
    const products = await apiFeatures.query

    res.json({
      success: true,
      products,
      total,
      page: parseInt(req.query.page, 10) || 1,
      pages: Math.ceil(total / perPage),
    })
  } catch (error) {
    next(error)
  }
}

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
      isDeleted: false,
    }).populate('category', 'name slug')

    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' })
    }

    res.json({ success: true, product })
  } catch (error) {
    next(error)
  }
}

exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true, isDeleted: false })
      .populate('category', 'name slug')
      .limit(8)
      .sort('-createdAt')

    res.json({ success: true, products })
  } catch (error) {
    next(error)
  }
}

exports.getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isDeleted: false })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8)

    res.json({ success: true, products })
  } catch (error) {
    next(error)
  }
}

exports.getBestSellers = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true, isDeleted: false })
      .populate('category', 'name slug')
      .sort('-sold')
      .limit(8)

    res.json({ success: true, products })
  } catch (error) {
    next(error)
  }
}

exports.getSaleProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      isActive: true,
      isDeleted: false,
      discountPrice: { $gt: 0 },
    })
      .populate('category', 'name slug')
      .sort('-createdAt')
      .limit(8)

    res.json({ success: true, products })
  } catch (error) {
    next(error)
  }
}

exports.searchSuggestions = async (req, res, next) => {
  try {
    const { keyword } = req.query
    if (!keyword || keyword.length < 2) {
      return res.json({ success: true, suggestions: [] })
    }

    const products = await Product.find({
      name: { $regex: keyword, $options: 'i' },
      isActive: true,
      isDeleted: false,
    })
      .select('name slug images price discountPrice')
      .limit(5)

    res.json({ success: true, suggestions: products })
  } catch (error) {
    next(error)
  }
}
