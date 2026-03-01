import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineHeart } from 'react-icons/hi'
import ProductCard from '../../components/common/ProductCard'
import EmptyState from '../../components/common/EmptyState'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useWishlistStore from '../../store/wishlistStore'
import useAuthStore from '../../store/authStore'

export default function WishlistPage() {
  const { user } = useAuthStore()
  const { items, loading, fetchWishlist } = useWishlistStore()

  useEffect(() => {
    if (user) fetchWishlist()
  }, [user])

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

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Yêu thích ({items.length})</h1>

      {items.length === 0 ? (
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
      )}
    </div>
  )
}
