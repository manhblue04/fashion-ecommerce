import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineClipboardList } from 'react-icons/hi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { getMyOrders } from '../../services/orderService'
import { formatPrice } from '../../utils/formatPrice'
import { ORDER_STATUS } from '../../utils/constants'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await getMyOrders({ page, limit: 10 })
        setOrders(res.orders)
        setPages(res.pages)
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [page])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Đơn hàng của tôi</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={HiOutlineClipboardList}
          title="Chưa có đơn hàng nào"
          description="Hãy mua sắm để tạo đơn hàng đầu tiên"
          action={<Link to="/san-pham" className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Mua sắm ngay</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS[order.orderStatus]
            return (
              <Link key={order._id} to={`/don-hang/${order._id}`} className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-${statusInfo?.color}-50 text-${statusInfo?.color}-600`}>
                    {statusInfo?.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {order.orderItems.slice(0, 3).map((item, idx) => (
                    <img key={idx} src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-gray-100" />
                  ))}
                  {order.orderItems.length > 3 && <span className="text-sm text-gray-500">+{order.orderItems.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                  <span className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</span>
                </div>
              </Link>
            )
          })}

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-medium ${p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
