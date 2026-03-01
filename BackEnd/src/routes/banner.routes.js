const router = require('express').Router()
const { getActiveBanners } = require('../controllers/bannerController')

router.get('/', getActiveBanners)

module.exports = router
