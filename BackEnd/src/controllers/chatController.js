const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const Order = require('../models/Order')
const { getOnlineUserIds } = require('../socket')

// GET /api/chat/conversations — Admin: list all conversations
exports.getConversations = async (req, res, next) => {
  try {
    const { status, search } = req.query
    const filter = {}
    if (status) filter.status = status

    let conversations = await Conversation.find(filter)
      .populate('user', 'name email avatar phone')
      .sort({ updatedAt: -1 })
      .lean()

    if (search) {
      const lower = search.toLowerCase()
      conversations = conversations.filter(
        (c) =>
          c.user?.name?.toLowerCase().includes(lower) ||
          c.user?.email?.toLowerCase().includes(lower)
      )
    }

    const onlineIds = getOnlineUserIds()
    conversations = conversations.map((c) => ({
      ...c,
      isOnline: onlineIds.includes(String(c.user?._id)),
    }))

    const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadByAdmin || 0), 0)

    res.json({ success: true, conversations, totalUnread })
  } catch (error) {
    next(error)
  }
}

// GET /api/chat/conversation — User: get or create own conversation
exports.getMyConversation = async (req, res, next) => {
  try {
    let conversation = await Conversation.findOne({ user: req.user._id })
    if (!conversation) {
      conversation = await Conversation.create({ user: req.user._id })
    }
    res.json({ success: true, conversation })
  } catch (error) {
    next(error)
  }
}

// GET /api/chat/conversations/:id/messages — paginated messages
exports.getMessages = async (req, res, next) => {
  try {
    const { id } = req.params
    const { before, limit = 30 } = req.query

    const conv = await Conversation.findById(id)
    if (!conv) return res.status(404).json({ success: false, message: 'Cuộc hội thoại không tồn tại' })

    const isAdmin = req.user.role === 'admin'
    if (!isAdmin && String(conv.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Không có quyền truy cập' })
    }

    const query = { conversation: id }
    if (before) query.createdAt = { $lt: new Date(before) }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('sender', 'name avatar')
      .lean()

    res.json({ success: true, messages: messages.reverse(), hasMore: messages.length === Number(limit) })
  } catch (error) {
    next(error)
  }
}

// PUT /api/chat/conversations/:id/ai — Admin: toggle AI
exports.toggleAI = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id)
    if (!conv) return res.status(404).json({ success: false, message: 'Cuộc hội thoại không tồn tại' })

    conv.isAIEnabled = !conv.isAIEnabled
    await conv.save()

    res.json({ success: true, isAIEnabled: conv.isAIEnabled })
  } catch (error) {
    next(error)
  }
}

// PUT /api/chat/conversations/:id/status — Admin: update conversation status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['pending', 'processing', 'done'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' })
    }
    const conv = await Conversation.findByIdAndUpdate(req.params.id, { status }, { new: true })
      .populate('user', 'name email avatar')
    if (!conv) return res.status(404).json({ success: false, message: 'Cuộc hội thoại không tồn tại' })
    res.json({ success: true, conversation: conv })
  } catch (error) {
    next(error)
  }
}

// POST /api/chat/ai-suggest — Admin: get AI suggestion
exports.aiSuggest = async (req, res, next) => {
  try {
    const { conversationId, userMessage } = req.body
    const aiService = require('../services/aiService')

    const recentMsgs = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
    const history = recentMsgs.reverse().map((m) => ({
      role: m.senderType === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    const reply = await aiService.generateReply(history, userMessage)
    res.json({ success: true, suggestion: reply.text })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Không thể tạo gợi ý AI' })
  }
}

// GET /api/chat/online-users — Admin: online user IDs
exports.getOnlineUsers = async (req, res, next) => {
  try {
    res.json({ success: true, onlineUserIds: getOnlineUserIds() })
  } catch (error) {
    next(error)
  }
}

// GET /api/chat/conversations/:id/customer — Admin: customer profile for chat sidebar
exports.getCustomerProfile = async (req, res, next) => {
  try {
    const conv = await Conversation.findById(req.params.id).populate('user', 'name email avatar phone addresses createdAt')
    if (!conv) return res.status(404).json({ success: false, message: 'Không tìm thấy' })

    const recentOrders = await Order.find({ user: conv.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id orderStatus totalPrice createdAt')
      .lean()

    const onlineIds = getOnlineUserIds()

    res.json({
      success: true,
      customer: {
        ...conv.user.toObject ? conv.user.toObject() : conv.user,
        isOnline: onlineIds.includes(String(conv.user._id)),
      },
      recentOrders,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/chat/unread-count — Admin: total unread count for badge
exports.getUnreadCount = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin'
    if (isAdmin) {
      const result = await Conversation.aggregate([{ $group: { _id: null, total: { $sum: '$unreadByAdmin' } } }])
      return res.json({ success: true, unreadCount: result[0]?.total || 0 })
    }
    const conv = await Conversation.findOne({ user: req.user._id })
    res.json({ success: true, unreadCount: conv?.unreadByUser || 0 })
  } catch (error) {
    next(error)
  }
}
