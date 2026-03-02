const Outfit = require('../models/Outfit')
const User = require('../models/User')

const PRODUCT_FIELDS = 'name slug price discountPrice images brand stock sizes colors'

exports.getOutfits = async (req, res, next) => {
  try {
    const outfits = await Outfit.find({ isActive: true })
      .sort('order')
      .populate({
        path: 'items.product',
        select: PRODUCT_FIELDS,
        match: { isActive: true, isDeleted: false },
      })

    const filtered = outfits.map((o) => ({
      ...o.toObject(),
      items: o.items.filter((i) => i.product != null),
    }))

    res.json({ success: true, outfits: filtered })
  } catch (error) {
    next(error)
  }
}

exports.toggleSaveOutfit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    const outfitId = req.params.id

    const outfit = await Outfit.findById(outfitId)
    if (!outfit) return res.status(404).json({ success: false, message: 'Không tìm thấy outfit' })

    const idx = user.savedOutfits.indexOf(outfitId)
    if (idx > -1) {
      user.savedOutfits.splice(idx, 1)
      await user.save()
      res.json({ success: true, saved: false, message: 'Đã bỏ lưu outfit' })
    } else {
      user.savedOutfits.push(outfitId)
      await user.save()
      res.json({ success: true, saved: true, message: 'Đã lưu outfit' })
    }
  } catch (error) {
    next(error)
  }
}

exports.getSavedOutfits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedOutfits',
        match: { isActive: true },
        populate: {
          path: 'items.product',
          select: PRODUCT_FIELDS,
          match: { isActive: true, isDeleted: false },
        },
      })

    const outfits = (user.savedOutfits || []).map((o) => ({
      ...o.toObject(),
      items: o.items.filter((i) => i.product != null),
    }))

    res.json({ success: true, outfits })
  } catch (error) {
    next(error)
  }
}

exports.getSavedOutfitIds = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('savedOutfits')
    res.json({ success: true, ids: user.savedOutfits || [] })
  } catch (error) {
    next(error)
  }
}
