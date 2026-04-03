import { useState, useEffect, useRef, useCallback } from 'react'
import { HiCheck, HiPaperAirplane, HiSearch, HiSparkles, HiRefresh } from 'react-icons/hi'
import { UserOutlined } from '@ant-design/icons'
import { Avatar, Switch, Tooltip, Spin, Select } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import { formatPrice } from '../../utils/formatPrice'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const ORDER_STATUS_MAP = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
}

function ReadStatus({ status }) {
  if (status === 'read') return <span className="text-blue-500 flex gap-0.5"><HiCheck className="w-3 h-3" /><HiCheck className="w-3 h-3 -ml-1.5" /></span>
  if (status === 'delivered') return <span className="text-gray-400 flex gap-0.5"><HiCheck className="w-3 h-3" /><HiCheck className="w-3 h-3 -ml-1.5" /></span>
  return <span className="text-gray-300"><HiCheck className="w-3 h-3" /></span>
}

// ──────────────────── Conversation List (Left Panel) ────────────────────
function ConversationList({ conversations, activeId, onSelect, onlineUsers, typingUsers, search, setSearch, filter, setFilter, loading }) {
  const filters = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chưa xử lý' },
    { key: 'processing', label: 'Đang xử lý' },
    { key: 'done', label: 'Hoàn thành' },
  ]

  const filtered = conversations.filter((c) => {
    if (filter === 'all') return true
    return c.status === filter
  })

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col bg-white shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Tin nhắn</h2>
        <div className="relative mb-3">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            id="chat-search"
            name="chat-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm..."
            autoComplete="off"
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 text-xs rounded-full font-medium transition ${
                filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading && <div className="flex justify-center py-8"><Spin /></div>}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">Không có cuộc hội thoại nào</p>
        )}
        {filtered.map((conv) => {
          const isOnline = onlineUsers.has(String(conv.user?._id))
          const isActive = activeId === conv._id
          const isTyping = typingUsers[conv._id]
          return (
            <div
              key={conv._id}
              onClick={() => onSelect(conv)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition border-l-2 ${
                isActive ? 'bg-blue-50 border-blue-500' : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar size={42} src={conv.user?.avatar?.url || undefined} icon={<UserOutlined />} />
                {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 truncate">{conv.user?.name || 'Khách hàng'}</p>
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {conv.lastMessage?.createdAt ? dayjs(conv.lastMessage.createdAt).fromNow() : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-500 truncate max-w-[180px]">
                    {isTyping
                      ? <span className="text-green-500 italic">Đang gõ...</span>
                      : conv.lastMessage?.text || 'Chưa có tin nhắn'
                    }
                  </p>
                  {conv.unreadByAdmin > 0 && (
                    <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center shrink-0">
                      {conv.unreadByAdmin}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ──────────────────── Chat Window (Center Panel) ────────────────────
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chưa xử lý', color: 'text-orange-600 bg-orange-50' },
  { value: 'processing', label: 'Đang xử lý', color: 'text-blue-600 bg-blue-50' },
  { value: 'done', label: 'Hoàn thành', color: 'text-green-600 bg-green-50' },
]

function ChatWindow({ conversation, messages, messagesLoading, typingUsers, onSend, onTyping, onStopTyping, onToggleAI, onUpdateStatus, aiSuggestion, onGetSuggestion, loadingSuggestion }) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    setInput('')
  }, [conversation?._id])

  const handleType = useCallback((e) => {
    setInput(e.target.value)
    if (!conversation) return
    onTyping(conversation._id)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => onStopTyping(conversation._id), 2000)
  }, [conversation, onTyping, onStopTyping])

  const handleSend = (text) => {
    const t = (text || input).trim()
    if (!t) return
    onSend(t)
    setInput('')
    clearTimeout(typingTimeout.current)
    if (conversation) onStopTyping(conversation._id)
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <HiPaperAirplane className="w-7 h-7 text-gray-400 rotate-90" />
          </div>
          <p className="text-gray-500 text-sm">Chọn một cuộc hội thoại để bắt đầu</p>
        </div>
      </div>
    )
  }

  const typing = typingUsers[conversation._id]

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar size={36} src={conversation.user?.avatar?.url || undefined} icon={<UserOutlined />} />
          <div>
            <p className="text-sm font-semibold text-gray-900">{conversation.user?.name || 'Khách hàng'}</p>
            <p className="text-xs text-gray-400">{conversation.user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            size="small"
            value={conversation.status || 'pending'}
            onChange={(val) => onUpdateStatus(conversation._id, val)}
            options={STATUS_OPTIONS}
            style={{ width: 130 }}
          />
          <Tooltip title={conversation.isAIEnabled ? 'Tắt AI tự động trả lời' : 'Bật AI tự động trả lời'}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">AI</span>
              <Switch
                size="small"
                checked={conversation.isAIEnabled}
                onChange={() => onToggleAI(conversation._id)}
              />
            </div>
          </Tooltip>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messagesLoading && <div className="flex justify-center py-4"><Spin size="small" /></div>}
        {messages.map((msg) => {
          const isAdmin = msg.senderType === 'admin'
          const isAI = msg.senderType === 'ai'
          return (
            <div key={msg._id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
              {isAI && (
                <div className="flex items-center gap-1 mb-0.5 px-1">
                  <HiSparkles className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px] text-indigo-500 font-medium">AI Trợ lý</span>
                </div>
              )}
              <div className={`max-w-[70%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isAdmin
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : isAI
                    ? 'bg-indigo-100 text-gray-800 rounded-bl-md border border-indigo-200'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
              }`}>
                {msg.text}
              </div>
              <div className="flex items-center gap-1 mt-0.5 px-1">
                <span className="text-[10px] text-gray-400">{dayjs(msg.createdAt).format('HH:mm')}</span>
                {isAdmin && <ReadStatus status={msg.status} />}
              </div>
            </div>
          )
        })}

        {typing && !typing.isAdmin && (
          <div className="flex items-start">
            <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
              <div className="flex gap-1 items-center">
                <span className="text-xs text-gray-400 mr-1">Đang gõ</span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center gap-2">
          <HiSparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="text-xs text-indigo-700 flex-1 line-clamp-2">{aiSuggestion}</p>
          <button
            onClick={() => handleSend(aiSuggestion)}
            className="text-xs bg-indigo-500 text-white px-2.5 py-1 rounded-md hover:bg-indigo-600 transition shrink-0"
          >
            Gửi
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="p-3 border-t border-gray-200 shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2 items-center">
          <Tooltip title="Gợi ý AI">
            <button
              type="button"
              onClick={() => {
                const lastUserMsg = [...messages].reverse().find((m) => m.senderType === 'user')
                if (lastUserMsg) onGetSuggestion(conversation._id, lastUserMsg.text)
              }}
              disabled={loadingSuggestion}
              className="w-9 h-9 flex items-center justify-center text-indigo-500 hover:bg-indigo-50 rounded-lg transition shrink-0 disabled:opacity-50"
            >
              {loadingSuggestion ? <HiRefresh className="w-4 h-4 animate-spin" /> : <HiSparkles className="w-4 h-4" />}
            </button>
          </Tooltip>
          <input
            id="admin-chat-input"
            name="admin-chat-input"
            value={input}
            onChange={handleType}
            placeholder="Nhập tin nhắn..."
            autoComplete="off"
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition shrink-0 disabled:opacity-50"
          >
            <HiPaperAirplane className="w-4 h-4 rotate-90" />
          </button>
        </form>
      </div>
    </div>
  )
}

// ──────────────────── Customer Profile (Right Panel) ────────────────────
function CustomerProfile({ conversation }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const fetchCustomerProfile = useChatStore((s) => s.fetchCustomerProfile)
  const onlineUsers = useChatStore((s) => s.onlineUsers)

  useEffect(() => {
    if (!conversation) { setProfile(null); return }
    setLoading(true)
    fetchCustomerProfile(conversation._id).then((data) => {
      setProfile(data)
      setLoading(false)
    })
  }, [conversation?._id, fetchCustomerProfile])

  if (!conversation) {
    return <div className="w-72 border-l border-gray-200 bg-gray-50 shrink-0" />
  }

  if (loading) {
    return (
      <div className="w-72 border-l border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
        <Spin />
      </div>
    )
  }

  const customer = profile?.customer
  const orders = profile?.recentOrders || []
  const isOnline = customer && onlineUsers.has(String(customer._id))

  return (
    <div className="w-72 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
      <div className="p-5 text-center border-b border-gray-100">
        <div className="relative inline-block">
          <Avatar size={64} src={customer?.avatar?.url || undefined} icon={<UserOutlined />} />
          {isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />}
        </div>
        <h3 className="text-base font-bold text-gray-900 mt-2">{customer?.name || 'Khách hàng'}</h3>
        <p className="text-xs text-gray-500">{customer?.email}</p>
        {customer?.phone && <p className="text-xs text-gray-500 mt-0.5">{customer.phone}</p>}
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Recent orders */}
      <div className="p-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Đơn hàng gần đây</h4>
        {orders.length === 0 ? (
          <p className="text-xs text-gray-400">Chưa có đơn hàng</p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o._id} className="flex items-center justify-between py-2 px-2 bg-gray-50 rounded-lg text-xs">
                <div>
                  <p className="font-medium text-gray-800">{ORDER_STATUS_MAP[o.orderStatus] || o.orderStatus}</p>
                  <p className="text-gray-400">{dayjs(o.createdAt).format('DD/MM/YY')}</p>
                </div>
                <span className="font-bold text-gray-900">{formatPrice(o.totalPrice)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member since */}
      <div className="px-4 pb-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Thông tin</h4>
        <div className="text-xs text-gray-600 space-y-1.5">
          <p>Thành viên từ: <span className="font-medium">{customer?.createdAt ? dayjs(customer.createdAt).format('DD/MM/YYYY') : '—'}</span></p>
          {customer?.addresses?.[0] && (
            <p>Địa chỉ: <span className="font-medium">{customer.addresses[0].district}, {customer.addresses[0].city}</span></p>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────── Main Page ────────────────────
export default function MessageMgmtPage() {
  const token = useAuthStore((s) => s.token)
  const {
    conversations,
    activeConversation,
    messages,
    messagesLoading,
    loading,
    onlineUsers,
    typingUsers,
    initSocket,
    fetchConversations,
    openConversation,
    sendMessage,
    emitTyping,
    emitStopTyping,
    toggleAI,
    updateConversationStatus,
    getAISuggestion,
    fetchOnlineUsers,
  } = useChatStore()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loadingSuggestion, setLoadingSuggestion] = useState(false)

  useEffect(() => {
    if (token) {
      initSocket(token)
      fetchConversations()
      fetchOnlineUsers()
    }
  }, [token, initSocket, fetchConversations, fetchOnlineUsers])

  // Refresh conversations when they update via socket
  useEffect(() => {
    const interval = setInterval(() => fetchConversations({ search }), 15000)
    return () => clearInterval(interval)
  }, [fetchConversations, search])

  const handleSelect = (conv) => {
    setAiSuggestion('')
    openConversation(conv)
  }

  const handleGetSuggestion = async (convId, userMsg) => {
    setLoadingSuggestion(true)
    const suggestion = await getAISuggestion(convId, userMsg)
    setAiSuggestion(suggestion || '')
    setLoadingSuggestion(false)
  }

  const handleSend = (text) => {
    sendMessage(text)
    setAiSuggestion('')
  }

  return (
    <div className="flex h-[calc(100vh-112px)] -m-6 rounded-xl overflow-hidden border border-gray-200">
      <ConversationList
        conversations={conversations}
        activeId={activeConversation?._id}
        onSelect={handleSelect}
        onlineUsers={onlineUsers}
        typingUsers={typingUsers}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        loading={loading}
      />
      <ChatWindow
        conversation={activeConversation}
        messages={messages}
        messagesLoading={messagesLoading}
        typingUsers={typingUsers}
        onSend={handleSend}
        onTyping={emitTyping}
        onStopTyping={emitStopTyping}
        onToggleAI={toggleAI}
        onUpdateStatus={updateConversationStatus}
        aiSuggestion={aiSuggestion}
        onGetSuggestion={handleGetSuggestion}
        loadingSuggestion={loadingSuggestion}
      />
      <CustomerProfile conversation={activeConversation} />
    </div>
  )
}
