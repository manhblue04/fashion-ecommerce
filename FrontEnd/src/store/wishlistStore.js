import { create } from 'zustand'
import api from '../services/api'
import toast from 'react-hot-toast'

const useWishlistStore = create((set, get) => ({
  items: [],
  savedOutfitCount: 0,
  loading: false,

  fetchWishlist: async () => {
    try {
      const res = await api.get('/wishlist')
      set({ items: res.wishlist })
    } catch {
      set({ items: [] })
    }
  },

  fetchSavedOutfitCount: async () => {
    try {
      const res = await api.get('/outfits/saved/ids')
      set({ savedOutfitCount: res.ids?.length || 0 })
    } catch { /* empty */ }
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

  clearWishlist: () => {
    set({ items: [], savedOutfitCount: 0 })
  },

  get totalCount() {
    return get().items.length + get().savedOutfitCount
  },
}))

export default useWishlistStore
