import { create } from 'zustand'
import socketService from '../services/socketService'
import api from '../services/api'
import useAuthStore from './authStore'

let _lastToken = null

function bindSocketListeners(socket, set, get) {
  socket.removeAllListeners()

  socket.on('connect', () => set({ socketConnected: true }))
  socket.on('disconnect', () => set({ socketConnected: false }))

  socket.on('new_message', (message) => {
    const { activeConversation } = get()
    if (activeConversation && String(message.conversation) === String(activeConversation._id)) {
      set((s) => {
        if (s.messages.some((m) => m._id === message._id)) return s
        const tempIdx = s.messages.findIndex((m) => m._temp && m.text === message.text && m.senderType === message.senderType)
        if (tempIdx !== -1) {
          const updated = [...s.messages]
          updated[tempIdx] = message
          return { messages: updated }
        }
        return { messages: [...s.messages, message] }
      })
    }
  })

  socket.on('conversation_updated', (conv) => {
    set((s) => {
      const idx = s.conversations.findIndex((c) => c._id === conv._id)
      if (idx === -1) return {}
      const updated = [...s.conversations]
      updated[idx] = { ...updated[idx], ...conv }
      updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      return { conversations: updated }
    })
  })

  socket.on('user_online', ({ userId }) => {
    set((s) => { const next = new Set(s.onlineUsers); next.add(userId); return { onlineUsers: next } })
  })
  socket.on('user_offline', ({ userId }) => {
    set((s) => { const next = new Set(s.onlineUsers); next.delete(userId); return { onlineUsers: next } })
  })

  socket.on('user_typing', ({ conversationId, userId, name, isAdmin }) => {
    set((s) => ({ typingUsers: { ...s.typingUsers, [conversationId]: { userId, name, isAdmin } } }))
  })
  socket.on('user_stop_typing', ({ conversationId }) => {
    set((s) => { const next = { ...s.typingUsers }; delete next[conversationId]; return { typingUsers: next } })
  })

  socket.on('messages_read', ({ conversationId, readByRole }) => {
    const { activeConversation } = get()
    if (activeConversation && String(activeConversation._id) === conversationId) {
      set((s) => {
        let changed = false
        const updated = s.messages.map((m) => {
          if (readByRole === 'admin' && m.senderType === 'user' && m.status !== 'read') { changed = true; return { ...m, status: 'read' } }
          if (readByRole === 'user' && (m.senderType === 'admin' || m.senderType === 'ai') && m.status !== 'read') { changed = true; return { ...m, status: 'read' } }
          return m
        })
        return changed ? { messages: updated } : {}
      })
    }
  })

  if (socket.connected) set({ socketConnected: true })
}

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  hasMore: false,
  loading: false,
  messagesLoading: false,
  onlineUsers: new Set(),
  typingUsers: {},
  unreadCount: 0,
  socketConnected: false,

  initSocket: (token) => {
    if (_lastToken === token && socketService.isConnected()) return
    _lastToken = token

    const socket = socketService.connect(token)
    if (!socket) return

    bindSocketListeners(socket, set, get)
  },

  disconnectSocket: () => {
    _lastToken = null
    socketService.disconnect()
    set({ socketConnected: false, onlineUsers: new Set(), typingUsers: {} })
  },

  // --- Conversations (Admin) ---
  fetchConversations: async (params) => {
    set({ loading: true })
    try {
      const res = await api.get('/chat/conversations', { params })
      set({ conversations: res.conversations, unreadCount: res.totalUnread })
    } catch { /* ignore */ } finally {
      set({ loading: false })
    }
  },

  // --- My Conversation (User) ---
  fetchMyConversation: async () => {
    try {
      const res = await api.get('/chat/conversation')
      set({ activeConversation: res.conversation })
      return res.conversation
    } catch { return null }
  },

  // --- Messages ---
  fetchMessages: async (conversationId, before) => {
    set({ messagesLoading: true })
    try {
      const params = { limit: 30 }
      if (before) params.before = before
      const res = await api.get(`/chat/conversations/${conversationId}/messages`, { params })
      if (before) {
        set((s) => ({ messages: [...res.messages, ...s.messages], hasMore: res.hasMore }))
      } else {
        set({ messages: res.messages, hasMore: res.hasMore })
      }
    } catch { /* ignore */ } finally {
      set({ messagesLoading: false })
    }
  },

  sendMessage: (text) => {
    const { activeConversation } = get()
    if (!activeConversation) return

    const user = useAuthStore.getState().user
    const senderType = user?.role === 'admin' ? 'admin' : 'user'
    const tempMsg = {
      _id: `temp_${Date.now()}_${Math.random()}`,
      conversation: activeConversation._id,
      sender: { _id: user?._id, name: user?.name, avatar: user?.avatar },
      senderType,
      text,
      status: 'sent',
      createdAt: new Date().toISOString(),
      _temp: true,
    }
    set((s) => ({ messages: [...s.messages, tempMsg] }))

    socketService.emit('send_message', { conversationId: activeConversation._id, text })
  },

  // --- Join / leave conversation room ---
  joinConversation: (conversation) => {
    set({ activeConversation: conversation, messages: [], hasMore: false })
    socketService.emit('join_conversation', conversation._id)
  },

  leaveConversation: () => {
    const { activeConversation } = get()
    if (activeConversation) {
      socketService.emit('leave_conversation', activeConversation._id)
    }
    set({ activeConversation: null, messages: [] })
  },

  // --- Typing ---
  emitTyping: (conversationId) => {
    socketService.emit('typing', conversationId)
  },

  emitStopTyping: (conversationId) => {
    socketService.emit('stop_typing', conversationId)
  },

  // --- Mark read ---
  markRead: (conversationId) => {
    socketService.emit('mark_read', conversationId)
  },

  openConversation: async (conversation) => {
    const { leaveConversation, joinConversation, fetchMessages, markRead } = get()
    leaveConversation()
    joinConversation(conversation)
    await fetchMessages(conversation._id)
    markRead(conversation._id)

    set((s) => ({
      conversations: s.conversations.map((c) =>
        c._id === conversation._id ? { ...c, unreadByAdmin: 0 } : c
      ),
      unreadCount: s.conversations.reduce((sum, c) =>
        sum + (c._id === conversation._id ? 0 : (c.unreadByAdmin || 0)), 0
      ),
    }))
  },

  // --- Unread count ---
  fetchUnreadCount: async () => {
    try {
      const res = await api.get('/chat/unread-count')
      set({ unreadCount: res.unreadCount })
    } catch { /* ignore */ }
  },

  // --- AI ---
  toggleAI: async (conversationId) => {
    try {
      const res = await api.put(`/chat/conversations/${conversationId}/ai`)
      set((s) => ({
        activeConversation: s.activeConversation?._id === conversationId
          ? { ...s.activeConversation, isAIEnabled: res.isAIEnabled }
          : s.activeConversation,
        conversations: s.conversations.map((c) =>
          c._id === conversationId ? { ...c, isAIEnabled: res.isAIEnabled } : c
        ),
      }))
      return res.isAIEnabled
    } catch { return null }
  },

  updateConversationStatus: async (conversationId, status) => {
    try {
      const res = await api.put(`/chat/conversations/${conversationId}/status`, { status })
      set((s) => ({
        activeConversation: s.activeConversation?._id === conversationId
          ? { ...s.activeConversation, status }
          : s.activeConversation,
        conversations: s.conversations.map((c) =>
          c._id === conversationId ? { ...c, status } : c
        ),
      }))
      return res.conversation
    } catch { return null }
  },

  getAISuggestion: async (conversationId, userMessage) => {
    try {
      const res = await api.post('/chat/ai-suggest', { conversationId, userMessage })
      return res.suggestion
    } catch { return null }
  },

  // --- Customer profile ---
  fetchCustomerProfile: async (conversationId) => {
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/customer`)
      return { customer: res.customer, recentOrders: res.recentOrders }
    } catch { return null }
  },

  // --- Online users ---
  fetchOnlineUsers: async () => {
    try {
      const res = await api.get('/chat/online-users')
      set({ onlineUsers: new Set(res.onlineUserIds) })
    } catch { /* ignore */ }
  },
}))

export default useChatStore
