import { io } from 'socket.io-client'

let socket = null

const socketService = {
  connect(token) {
    if (socket?.connected) return socket
    if (socket) {
      socket.disconnect()
      socket = null
    }

    socket = io({
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
    })

    return socket
  },

  disconnect() {
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }
  },

  getSocket() {
    return socket
  },

  isConnected() {
    return socket?.connected || false
  },

  emit(event, data) {
    if (socket?.connected) socket.emit(event, data)
  },

  on(event, handler) {
    if (socket) socket.on(event, handler)
  },

  off(event, handler) {
    if (socket) socket.off(event, handler)
  },
}

export default socketService
