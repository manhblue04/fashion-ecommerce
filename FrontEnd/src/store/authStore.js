import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'
import useCartStore from './cartStore'
import useWishlistStore from './wishlistStore'
import socketService from '../services/socketService'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  loading: false,

  register: async (data) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/register', data)
      toast.success(res.message)
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      set({ loading: false })
    }
  },

  login: async (data, returnError = false) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/login', data)
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user, token: res.token })

      // Restore cart saved for this user (if any)
      const savedCart = localStorage.getItem(`cart_${res.user._id}`)
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          localStorage.setItem('cart', savedCart)
          useCartStore.setState({ items: parsed })
          localStorage.removeItem(`cart_${res.user._id}`)
        } catch { /* ignore */ }
      }

      toast.success('Đăng nhập thành công')
      return returnError ? { user: res.user } : res.user
    } catch (err) {
      if (!returnError) toast.error(err.message)
      return returnError ? { error: err.message } : null
    } finally {
      set({ loading: false })
    }
  },

  googleLogin: async (credential) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/google-login', { credential })
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user, token: res.token })

      // Restore cart saved for this user (if any)
      const savedCart = localStorage.getItem(`cart_${res.user._id}`)
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart)
          localStorage.setItem('cart', savedCart)
          useCartStore.setState({ items: parsed })
          localStorage.removeItem(`cart_${res.user._id}`)
        } catch { /* ignore */ }
      }

      toast.success('Đăng nhập thành công')
      return res.user
    } catch (err) {
      toast.error(err.message)
      return null
    } finally {
      set({ loading: false })
    }
  },

  logout: () => {
    const currentUser = get().user
    const currentCart = localStorage.getItem('cart')

    // Backup cart keyed by userId so it's restored on next login
    if (currentUser?._id && currentCart && currentCart !== '[]') {
      localStorage.setItem(`cart_${currentUser._id}`, currentCart)
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    useCartStore.getState().clearCart()
    useWishlistStore.getState().clearWishlist()
    socketService.disconnect()
    set({ user: null, token: null })
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
    toast.success('Đăng xuất thành công')
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me')
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user })
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      set({ user: null, token: null })
    }
  },

  updateProfile: async (data) => {
    set({ loading: true })
    try {
      const res = await api.put('/auth/profile', data)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user })
      toast.success(res.message)
    } catch (err) {
      toast.error(err.message)
    } finally {
      set({ loading: false })
    }
  },

  updateAvatar: async (avatar) => {
    set({ loading: true })
    try {
      const res = await api.put('/auth/avatar', { avatar })
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user })
      toast.success(res.message)
    } catch (err) {
      toast.error(err.message)
    } finally {
      set({ loading: false })
    }
  },

  changePassword: async (data) => {
    set({ loading: true })
    try {
      const res = await api.put('/auth/change-password', data)
      toast.success(res.message)
      return true
    } catch (err) {
      toast.error(err.message)
      return false
    } finally {
      set({ loading: false })
    }
  },
}))

export default useAuthStore
