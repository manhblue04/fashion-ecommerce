const router = require('express').Router()
const { protect, admin } = require('../middlewares/auth')
const {
  getConversations,
  getMyConversation,
  getMessages,
  toggleAI,
  updateStatus,
  aiSuggest,
  getOnlineUsers,
  getCustomerProfile,
  getUnreadCount,
} = require('../controllers/chatController')

router.get('/conversations', protect, admin, getConversations)
router.get('/conversation', protect, getMyConversation)
router.get('/conversations/:id/messages', protect, getMessages)
router.get('/conversations/:id/customer', protect, admin, getCustomerProfile)
router.put('/conversations/:id/ai', protect, admin, toggleAI)
router.put('/conversations/:id/status', protect, admin, updateStatus)
router.post('/ai-suggest', protect, admin, aiSuggest)
router.get('/online-users', protect, admin, getOnlineUsers)
router.get('/unread-count', protect, getUnreadCount)

module.exports = router
