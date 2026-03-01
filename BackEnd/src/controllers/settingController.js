const Setting = require('../models/Setting')

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create({})
    }
    res.json({ success: true, settings })
  } catch (error) {
    next(error)
  }
}
