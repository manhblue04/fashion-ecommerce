const Category = require('../models/Category')

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name')
    res.json({ success: true, categories })
  } catch (error) {
    next(error)
  }
}

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' })
    }
    res.json({ success: true, category })
  } catch (error) {
    next(error)
  }
}
