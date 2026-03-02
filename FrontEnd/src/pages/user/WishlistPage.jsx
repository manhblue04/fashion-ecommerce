import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineHeart, HiOutlineShoppingBag, HiHeart } from 'react-icons/hi'
import ProductCard from '../../components/common/ProductCard'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useWishlistStore from '../../store/wishlistStore'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'

const getItemPrice = (p) => p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price
import api from '../../services/api'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'

export default function WishlistPage() {
  const { user } = useAuthStore()
  const { items, loading, fetchWishlist } = useWishlistStore()
  const addOutfitItems = useCartStore((s) => s.addOutfitItems)
  const fetchSavedOutfitCount = useWishlistStore((s) => s.fetchSavedOutfitCount)
  const [tab, setTab] = useState('products')
  const [savedOutfits, setSavedOutfits] = useState([])
  const [outfitCount, setOutfitCount] = useState(0)
  const [outfitLoading, setOutfitLoading] = useState(false)
  const [outfitsFetched, setOutfitsFetched] = useState(false)

  useEffect(() => {
    if (user) {
      fetchWishlist()
      api.get('/outfits/saved/ids').then((res) => setOutfitCount(res.ids?.length || 0)).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    if (user && tab === 'outfits' && !outfitsFetched) {
      setOutfitLoading(true)
      api.get('/outfits/saved')
        .then((res) => {
          setSavedOutfits(res.outfits || [])
          setOutfitCount(res.outfits?.length || 0)
          setOutfitsFetched(true)
        })
        .catch(() => {})
        .finally(() => setOutfitLoading(false))
    }
  }, [user, tab, outfitsFetched])

  const handleUnsave = async (outfitId) => {
    try {
      await api.post(`/outfits/save/${outfitId}`)
      const updated = savedOutfits.filter((o) => o._id !== outfitId)
      setSavedOutfits(updated)
      setOutfitCount(updated.length)
      fetchSavedOutfitCount()
      toast.success('Đã bỏ lưu outfit')
    } catch {
      toast.error('Có lỗi xảy ra')
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={HiOutlineHeart}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để xem danh sách yêu thích"
          action={<Link to="/dang-nhap" className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Đăng nhập</Link>}
        />
      </div>
    )
  }

  if (loading && tab === 'products') return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Yêu thích</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-8">
        <button
          onClick={() => setTab('products')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${tab === 'products' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Sản phẩm ({items.length})
        </button>
        <button
          onClick={() => setTab('outfits')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition ${tab === 'outfits' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Outfit đã lưu ({outfitCount})
        </button>
      </div>

      {/* Products tab */}
      {tab === 'products' && (
        items.length === 0 ? (
          <EmptyState
            icon={HiOutlineHeart}
            title="Chưa có sản phẩm yêu thích"
            description="Khám phá và thêm sản phẩm vào danh sách yêu thích"
            action={<Link to="/san-pham" className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Khám phá ngay</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {items.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )
      )}

      {/* Outfits tab */}
      {tab === 'outfits' && (
        outfitLoading ? <LoadingSpinner /> : savedOutfits.length === 0 ? (
          <EmptyState
            icon={HiOutlineHeart}
            title="Chưa lưu outfit nào"
            description="Lưu outfit yêu thích từ mục Shop The Look trên trang chủ"
            action={<Link to="/" className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Về trang chủ</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map((outfit) => {
              const totalOriginal = outfit.items.reduce((s, i) => i.product ? s + getItemPrice(i.product) : s, 0)
              const discount = outfit.discountPercent || 0
              const totalSet = Math.round(totalOriginal * (1 - discount / 100))

              return (
                <div key={outfit._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
                  {/* Outfit image */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={outfit.image?.url} alt={outfit.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={() => handleUnsave(outfit._id)}
                      className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition"
                    >
                      <HiHeart className="w-5 h-5 text-red-500" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{outfit.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{outfit.description}</p>

                    {/* Product thumbnails */}
                    <div className="flex gap-1.5 mt-3">
                      {outfit.items.slice(0, 5).map((item) => (
                        <Link
                          key={item._id}
                          to={`/san-pham/${item.product?.slug}`}
                          className="w-10 h-10 rounded overflow-hidden border border-gray-100 hover:border-amber-400 transition"
                        >
                          <img src={item.product?.images?.[0]?.url} alt="" className="w-full h-full object-cover" />
                        </Link>
                      ))}
                      {outfit.items.length > 5 && <span className="text-xs text-gray-400 self-center">+{outfit.items.length - 5}</span>}
                    </div>

                    {/* Price + Buy */}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">{formatPrice(totalSet)}</span>
                        {discount > 0 && <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(totalOriginal)}</span>}
                      </div>
                      <button
                        onClick={() => addOutfitItems(outfit.items, discount)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition"
                      >
                        <HiOutlineShoppingBag className="w-4 h-4" /> Mua set
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}
    </div>
  )
}
