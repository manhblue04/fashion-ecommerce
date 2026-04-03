import { useState, useRef, useEffect, useCallback } from 'react'
import { HiChat, HiX, HiPaperAirplane, HiCheck } from 'react-icons/hi'
import useChatStore from '../../store/chatStore'
import useAuthStore from '../../store/authStore'
import dayjs from 'dayjs'

function ReadStatus({ status }) {
  if (status === 'read') return <span className="text-amber-500 flex gap-0.5"><HiCheck className="w-3 h-3" /><HiCheck className="w-3 h-3 -ml-1.5" /></span>
  if (status === 'delivered') return <span className="text-gray-400 flex gap-0.5"><HiCheck className="w-3 h-3" /><HiCheck className="w-3 h-3 -ml-1.5" /></span>
  return <span className="text-gray-300"><HiCheck className="w-3 h-3" /></span>
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loaded, setLoaded] = useState(false)
  const endRef = useRef(null)
  const typingRef = useRef(null)

  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)

  const activeConversation = useChatStore((s) => s.activeConversation)
  const messages = useChatStore((s) => s.messages)
  const typingUsers = useChatStore((s) => s.typingUsers)
  const unreadCount = useChatStore((s) => s.unreadCount)
  const socketConnected = useChatStore((s) => s.socketConnected)

  // Connect socket when user is logged in
  useEffect(() => {
    if (user && token) {
      useChatStore.getState().initSocket(token)
      useChatStore.getState().fetchUnreadCount()
    }
  }, [user, token])

  // Load conversation when widget opens AND socket is ready
  useEffect(() => {
    if (!open || !user || !socketConnected) {
      setLoaded(false)
      return
    }
    if (loaded) return

    let cancelled = false
    useChatStore.getState().fetchMyConversation().then((conv) => {
      if (cancelled || !conv) return
      setLoaded(true)
      const store = useChatStore.getState()
      store.joinConversation(conv)
      store.fetchMessages(conv._id)
      store.markRead(conv._id)
    })

    return () => { cancelled = true }
  }, [open, user, socketConnected, loaded])

  // Leave conversation when widget closes
  useEffect(() => {
    if (!open && loaded) {
      useChatStore.getState().leaveConversation()
      setLoaded(false)
    }
  }, [open, loaded])

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Mark read when new unread messages arrive
  useEffect(() => {
    if (open && activeConversation && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.senderType !== 'user' && lastMsg.status !== 'read') {
        useChatStore.getState().markRead(activeConversation._id)
      }
    }
  }, [messages, open, activeConversation])

  const handleTyping = useCallback(() => {
    if (!activeConversation) return
    useChatStore.getState().emitTyping(activeConversation._id)
    clearTimeout(typingRef.current)
    typingRef.current = setTimeout(() => {
      useChatStore.getState().emitStopTyping(activeConversation._id)
    }, 2000)
  }, [activeConversation])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !activeConversation) return
    useChatStore.getState().sendMessage(trimmed)
    setInput('')
    clearTimeout(typingRef.current)
    useChatStore.getState().emitStopTyping(activeConversation._id)
  }

  const typing = activeConversation ? typingUsers[activeConversation._id] : null

  if (!user) return null

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition flex items-center justify-center"
        >
          <HiChat className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: 520 }}>
          {/* Header */}
          <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold">FS</div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900" />
              </div>
              <div>
                <p className="font-semibold text-sm">Fashion Store</p>
                <p className="text-xs text-gray-300">
                  {typing?.isAdmin ? `${typing.name} đang gõ...` : 'Hỗ trợ trực tuyến'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-lg p-1 transition">
              <HiX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!socketConnected && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-400">Đang kết nối...</p>
              </div>
            )}
            {messages.length === 0 && socketConnected && loaded && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">Xin chào! Bạn cần hỗ trợ gì?</p>
              </div>
            )}
            {messages.map((msg) => {
              const isUser = msg.senderType === 'user'
              const isAI = msg.senderType === 'ai'
              return (
                <div key={msg._id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-white rounded-br-sm'
                      : isAI
                        ? 'bg-indigo-50 text-gray-800 rounded-bl-sm border border-indigo-100'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {isAI && <p className="text-[10px] text-indigo-500 font-medium mb-0.5">AI Trợ lý</p>}
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 px-1">
                    <span className="text-[10px] text-gray-300">{dayjs(msg.createdAt).format('HH:mm')}</span>
                    {isUser && <ReadStatus status={msg.status} />}
                  </div>
                </div>
              )
            })}

            {typing?.isAdmin && (
              <div className="flex items-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <input
                id="chat-widget-input"
                name="chat-widget-input"
                value={input}
                onChange={(e) => { setInput(e.target.value); handleTyping() }}
                placeholder="Nhập tin nhắn..."
                autoComplete="off"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center hover:bg-amber-600 transition shrink-0 disabled:opacity-50"
              >
                <HiPaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
