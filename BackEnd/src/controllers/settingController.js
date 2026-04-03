const Setting = require('../models/Setting')

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne()
    if (!settings) {
      settings = await Setting.create({})
    }
    const obj = settings.toObject()
    // Mask AI API key for non-admin or public requests
    if (obj.ai?.apiKey) {
      const key = obj.ai.apiKey
      obj.ai.apiKey = key.length > 8 ? key.slice(0, 4) + '****' + key.slice(-4) : '****'
    }
    res.json({ success: true, settings: obj })
  } catch (error) {
    next(error)
  }
}
