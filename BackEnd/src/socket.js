const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('./models/User')
const Conversation = require('./models/Conversation')
const Message = require('./models/Message')

// userId -> Set<socketId>
const onlineUsers = new Map()
let io = null

function getIO() {
  return io
}

function getOnlineUserIds() {
  return [...onlineUsers.keys()]
}

function isUserOnline(userId) {
  return onlineUsers.has(String(userId))
}

function emitToAdmins(event, data) {
  if (io) io.to('admins').emit(event, data)
}

function initSocket(httpServer, allowedOrigins) {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  // JWT authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('name email role avatar')
      if (!user) return next(new Error('User not found'))

      socket.user = user
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const userId = String(socket.user._id)
    const isAdmin = socket.user.role === 'admin'

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
      // Notify admins that user came online
      if (!isAdmin) {
        emitToAdmins('user_online', { userId })
      }
    }
    onlineUsers.get(userId).add(socket.id)

    // Admin joins special room
    if (isAdmin) {
      socket.join('admins')
    }

    // --- Join a conversation room ---
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conv = await Conversation.findById(conversationId)
        if (!conv) return

        if (!isAdmin && String(conv.user) !== userId) return

        socket.join(`conv_${conversationId}`)

        if (isAdmin) {
          await Message.updateMany(
            { conversation: conversationId, senderType: 'user', status: 'sent' },
            { status: 'delivered' }
          )
        }
      } catch (err) {
        console.error('[Socket] join_conversation error:', err.message)
      }
    })

    // --- Leave conversation room ---
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`)
    })

    // --- Send message ---
    socket.on('send_message', async ({ conversationId, text }) => {
      try {
        if (!text?.trim()) return

        const conv = await Conversation.findById(conversationId)
        if (!conv) return
        if (!isAdmin && String(conv.user) !== userId) return

        const senderType = isAdmin ? 'admin' : 'user'

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.user._id,
          senderType,
          text: text.trim(),
          status: 'sent',
        })

        // Update conversation
        conv.lastMessage = {
          text: text.trim().substring(0, 100),
          sender: socket.user._id,
          senderType,
          createdAt: message.createdAt,
        }
        if (senderType === 'user') {
          conv.unreadByAdmin += 1
          if (conv.status === 'done') conv.status = 'pending'
        } else {
          conv.unreadByUser += 1
          if (conv.status === 'pending') conv.status = 'processing'
        }
        await conv.save()

        const populated = {
          ...message.toObject(),
          sender: { _id: socket.user._id, name: socket.user.name, avatar: socket.user.avatar },
        }

        // Emit to everyone in the conversation room
        io.to(`conv_${conversationId}`).emit('new_message', populated)

        // Notify admins with updated conversation (for sidebar list)
        const updatedConv = await Conversation.findById(conversationId).populate('user', 'name email avatar')
        emitToAdmins('conversation_updated', updatedConv)

        // AI auto-reply if enabled
        if (senderType === 'user' && conv.isAIEnabled) {
          try {
            const aiService = require('./services/aiService')
            const recentMsgs = await Message.find({ conversation: conversationId })
              .sort({ createdAt: -1 })
              .limit(10)
              .lean()
            const history = recentMsgs.reverse().map((m) => ({
              role: m.senderType === 'user' ? 'user' : 'assistant',
              content: m.text,
            }))
            const aiReply = await aiService.generateReply(history, text.trim())
            if (aiReply?.text) {
              const aiMsg = await Message.create({
                conversation: conversationId,
                sender: null,
                senderType: 'ai',
                text: aiReply.text,
                status: 'sent',
              })
              conv.lastMessage = {
                text: aiReply.text.substring(0, 100),
                sender: null,
                senderType: 'ai',
                createdAt: aiMsg.createdAt,
              }
              conv.unreadByUser += 1
              await conv.save()

              io.to(`conv_${conversationId}`).emit('new_message', {
                ...aiMsg.toObject(),
                sender: null,
                isAI: true,
              })
            }
          } catch (aiErr) {
            console.error('[Socket] AI auto-reply error:', aiErr.response?.data || aiErr.message)
          }
        }
      } catch (err) {
        console.error('[Socket] send_message error:', err.message)
      }
    })

    // --- Typing indicators ---
    socket.on('typing', (conversationId) => {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        userId,
        name: socket.user.name,
        isAdmin,
      })
    })

    socket.on('stop_typing', (conversationId) => {
      socket.to(`conv_${conversationId}`).emit('user_stop_typing', {
        conversationId,
        userId,
      })
    })

    // --- Mark messages as read ---
    socket.on('mark_read', async (conversationId) => {
      try {
        const conv = await Conversation.findById(conversationId)
        if (!conv) return

        const now = new Date()
        if (isAdmin) {
          await Message.updateMany(
            { conversation: conversationId, senderType: 'user', status: { $ne: 'read' } },
            { status: 'read', readAt: now }
          )
          conv.unreadByAdmin = 0
        } else {
          await Message.updateMany(
            { conversation: conversationId, senderType: { $in: ['admin', 'ai'] }, status: { $ne: 'read' } },
            { status: 'read', readAt: now }
          )
          conv.unreadByUser = 0
        }
        await conv.save()

        io.to(`conv_${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: userId,
          readByRole: isAdmin ? 'admin' : 'user',
        })

        const updatedConv = await Conversation.findById(conversationId).populate('user', 'name email avatar')
        if (updatedConv) emitToAdmins('conversation_updated', updatedConv)
      } catch (err) {
        console.error('[Socket] mark_read error:', err.message)
      }
    })

    // --- Disconnect ---
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          if (!isAdmin) {
            emitToAdmins('user_offline', { userId })
          }
        }
      }
    })
  })

  return io
}

module.exports = { initSocket, getIO, getOnlineUserIds, isUserOnline }
