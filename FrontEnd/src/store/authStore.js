import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'

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

  login: async (data) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/login', data)
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))
      set({ user: res.user, token: res.token })
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
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
}))

export default useAuthStore
