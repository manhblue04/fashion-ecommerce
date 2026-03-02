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

  addOutfitItems: (selectedItems, discountPercent = 0) => {
    const items = [...get().items]
    const multiplier = 1 - discountPercent / 100

    for (const si of selectedItems) {
      const product = si.product
      if (!product) continue

      const size = si.size || ''
      const color = si.color || ''
      const basePrice = product.discountPrice > 0 && product.discountPrice < product.price
        ? product.discountPrice
        : product.price
      const setPrice = Math.round(basePrice * multiplier)

      const cartKey = `${product._id}_set_${size}_${color}`
      const idx = items.findIndex((i) => i.cartKey === cartKey)

      if (idx > -1) {
        items[idx].quantity += 1
      } else {
        items.push({
          cartKey,
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0]?.url || '',
          price: setPrice,
          originalPrice: product.price,
          stock: product.stock || 99,
          quantity: 1,
          size,
          color,
          isOutfitItem: true,
        })
      }
    }

    localStorage.setItem('cart', JSON.stringify(items))
    set({ items })
    toast.success('Đã thêm cả set vào giỏ hàng')
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
