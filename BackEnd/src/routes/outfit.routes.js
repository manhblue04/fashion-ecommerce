const router = require('express').Router()
const { getOutfits, toggleSaveOutfit, getSavedOutfits, getSavedOutfitIds } = require('../controllers/outfitController')
const { protect } = require('../middlewares/auth')

router.get('/', getOutfits)
router.post('/save/:id', protect, toggleSaveOutfit)
router.get('/saved', protect, getSavedOutfits)
router.get('/saved/ids', protect, getSavedOutfitIds)

module.exports = router
