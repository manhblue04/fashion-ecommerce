const router = require('express').Router()
const { getSettings } = require('../controllers/settingController')

router.get('/', getSettings)

module.exports = router
