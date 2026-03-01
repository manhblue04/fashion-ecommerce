import { Link } from 'react-router-dom'
import { HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiStar } from 'react-icons/hi'
import { formatPrice } from '../../utils/formatPrice'
import useCartStore from '../../store/cartStore'
import useWishlistStore from '../../store/wishlistStore'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const { user } = useAuthStore()
  const inWishlist = isInWishlist(product._id)
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Vui lòng đăng nhập')
    await toggleWishlist(product._id)
  }

  const handleAddCart = (e) => {
    e.preventDefault()
    addItem(product)
  }

  return (
    <Link to={`/san-pham/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={product.images?.[0]?.url || '/placeholder.jpg'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">Hết hàng</span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={handleWishlist} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition">
            {inWishlist ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5 text-gray-600" />}
          </button>
          {product.stock > 0 && (
            <button onClick={handleAddCart} className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-amber-50 transition">
              <HiOutlineShoppingBag className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-amber-600 transition">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{formatPrice(hasDiscount ? product.discountPrice : product.price)}</span>
          {hasDiscount && <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>}
        </div>
        {product.colors?.length > 0 && (
          <p className="text-xs text-gray-400">{product.colors.length} màu sắc</p>
        )}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <HiStar className="w-4 h-4 text-amber-400" />
            <span>{product.rating}</span>
            <span>({product.numReviews})</span>
          </div>
        )}
      </div>
    </Link>
  )
}
