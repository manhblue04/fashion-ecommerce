import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'

const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    try {
      const res = await api.get('/wishlist')
      set({ items: res.wishlist })
    } catch {
      set({ items: [] })
    }
  },

  toggleWishlist: async (productId) => {
    try {
      const res = await api.post('/wishlist/toggle', { productId })
      toast.success(res.message)
      await get().fetchWishlist()
      return res.added
    } catch (err) {
      toast.error(err.message)
    }
  },

  isInWishlist: (productId) => {
    return get().items.some((item) => item._id === productId)
  },
}))

export default useWishlistStore
