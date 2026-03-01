import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { HiOutlineHeart, HiHeart, HiStar, HiMinus, HiPlus, HiOutlineShoppingBag } from 'react-icons/hi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ProductCard from '../../components/common/ProductCard'
import { getProduct, getProducts } from '../../services/productService'
import { getProductReviews } from '../../services/reviewService'
import { formatPrice } from '../../utils/formatPrice'
import useCartStore from '../../store/cartStore'
import useWishlistStore from '../../store/wishlistStore'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const addItem = useCartStore((s) => s.addItem)
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await getProduct(slug)
        setProduct(res.product)
        setSelectedImage(0)
        setQuantity(1)
        setSelectedSize(res.product.sizes?.[0] || '')
        setSelectedColor(res.product.colors?.[0] || '')

        const [revRes, relRes] = await Promise.all([
          getProductReviews(res.product._id, { limit: 5 }),
          getProducts({ category: res.product.category?._id, limit: 4 }),
        ])
        setReviews(revRes.reviews)
        setRelated(relRes.products.filter((p) => p._id !== res.product._id))
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  if (loading) return <LoadingSpinner size="lg" />
  if (!product) return <div className="text-center py-20 text-gray-500">Không tìm thấy sản phẩm</div>

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price
  const currentPrice = hasDiscount ? product.discountPrice : product.price
  const inWishlist = isInWishlist(product._id)

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Vui lòng chọn kích thước')
    if (product.colors?.length > 0 && !selectedColor) return toast.error('Vui lòng chọn màu sắc')
    addItem(product, quantity, selectedSize, selectedColor)
  }
  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Vui lòng chọn kích thước')
    if (product.colors?.length > 0 && !selectedColor) return toast.error('Vui lòng chọn màu sắc')
    addItem(product, quantity, selectedSize, selectedColor)
    window.location.href = '/gio-hang'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-amber-600">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link to="/san-pham" className="hover:text-amber-600">Sản phẩm</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
            <img
              src={product.images?.[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    idx === selectedImage ? 'border-amber-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.category && (
            <Link to={`/san-pham?category=${product.category._id}`} className="text-xs text-amber-600 uppercase tracking-wider">
              {product.category.name}
            </Link>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <HiStar key={star} className={`w-5 h-5 ${star <= product.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.numReviews} đánh giá)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-3 mt-4">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* Fashion info */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-gray-600">
            {product.brand && <span>Thương hiệu: <strong className="text-gray-800">{product.brand}</strong></span>}
            {product.material && <span>Chất liệu: <strong className="text-gray-800">{product.material}</strong></span>}
            {product.gender && (
              <span>Giới tính: <strong className="text-gray-800">{{ men: 'Nam', women: 'Nữ', unisex: 'Unisex' }[product.gender]}</strong></span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-gray-600 leading-relaxed mt-4">{product.description}</p>
          )}

          {/* Size selector */}
          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <span className="text-sm font-medium text-gray-700">Kích thước:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[40px] px-3 py-2 border rounded-lg text-sm font-medium transition ${
                      selectedSize === size ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {product.colors?.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Màu sắc: {selectedColor && <strong className="text-gray-800">{selectedColor}</strong>}</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                      selectedColor === color ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <p className={`text-sm mt-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
          </p>

          {/* Quantity & Actions */}
          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-3 mt-6">
                <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50">
                    <HiMinus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50">
                    <HiPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-gray-900 text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <HiOutlineShoppingBag className="w-5 h-5" /> Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Mua ngay
                </button>
                <button
                  onClick={() => user ? toggleWishlist(product._id) : toast.error('Vui lòng đăng nhập')}
                  className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-red-50 transition"
                >
                  {inWishlist ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh giá ({product.numReviews})</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div key={rev._id} className="border-b border-gray-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-bold">
                    {rev.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{rev.user?.name || 'Ẩn danh'}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <HiStar key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'text-amber-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(rev.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                {rev.comment && <p className="text-sm text-gray-600 ml-11">{rev.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào</p>
        )}
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.slice(0, 4).map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
