const Banner = require('../models/Banner')

exports.getActiveBanners = async (req, res, next) => {
  try {
    const type = req.query.type || 'home'
    const banners = await Banner.find({ isActive: true, type }).sort('order')
    res.json({ success: true, banners })
  } catch (error) {
    next(error)
  }
}
