const router = require('express').Router()
const {
  register,
  verifyEmail,
  login,
  googleLogin,
  getMe,
  updateProfile,
  updateAvatar,
  forgotPassword,
  resetPassword,
  addAddress,
  updateAddress,
  deleteAddress,
  changePassword,
} = require('../controllers/authController')
const { protect } = require('../middlewares/auth')
const validate = require('../middlewares/validate')
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidator')

router.post('/register', registerValidator, validate, register)
router.get('/verify-email/:token', verifyEmail)
router.post('/login', loginValidator, validate, login)
router.post('/google-login', googleLogin)
router.post('/forgot-password', forgotPasswordValidator, validate, forgotPassword)
router.put('/reset-password/:token', resetPasswordValidator, validate, resetPassword)

router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/avatar', protect, updateAvatar)
router.post('/address', protect, addAddress)
router.put('/address/:addressId', protect, updateAddress)
router.delete('/address/:addressId', protect, deleteAddress)
router.put('/change-password', protect, changePassword)

module.exports = router
