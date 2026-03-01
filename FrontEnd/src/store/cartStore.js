import { create } from 'zustand'
import toast from 'react-hot-toast'

const getCartFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || []
  } catch {
    return []
  }
}

const useCartStore = create((set, get) => ({
  items: getCartFromStorage(),

  addItem: (product, quantity = 1, selectedSize = '', selectedColor = '') => {
    const items = [...get().items]
    const cartKey = `${product._id}_${selectedSize}_${selectedColor}`
    const idx = items.findIndex((i) => i.cartKey === cartKey)

    if (idx > -1) {
      const newQty = items[idx].quantity + quantity
      if (newQty > product.stock) {
        toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`)
        return
      }
      items[idx].quantity = newQty
    } else {
      if (quantity > product.stock) {
        toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho`)
        return
      }
      items.push({
        cartKey,
        product: product._id,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url || '',
        price: product.discountPrice > 0 ? product.discountPrice : product.price,
        originalPrice: product.price,
        stock: product.stock,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    }

    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
    toast.success('Đã thêm vào giỏ hàng')
  },

  updateQuantity: (cartKey, quantity) => {
    const items = get().items.map((item) =>
      item.cartKey === cartKey ? { ...item, quantity } : item
    )
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
  },

  removeItem: (cartKey) => {
    const items = get().items.filter((i) => i.cartKey !== cartKey)
    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
    toast.success('Đã xóa khỏi giỏ hàng')
  },

  clearCart: () => {
    localStorage.removeItem('cart')
    set({ items: [] })
  },

  get totalItems() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0)
  },

  get totalPrice() {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  },
}))

export default useCartStore
