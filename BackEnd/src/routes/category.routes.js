const router = require('express').Router()
const { getCategories, getCategory } = require('../controllers/categoryController')

router.get('/', getCategories)
router.get('/:slug', getCategory)

module.exports = router
