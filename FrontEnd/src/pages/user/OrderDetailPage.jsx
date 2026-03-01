import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getOrderDetail, cancelOrder } from '../../services/orderService'
import { formatPrice } from '../../utils/formatPrice'
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from '../../utils/constants'

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderDetail(id)
        setOrder(res.order)
        setLogs(res.logs || [])
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    try {
      await cancelOrder(id)
      toast.success('Đã hủy đơn hàng')
      setOrder({ ...order, orderStatus: 'cancelled' })
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <div className="text-center py-20 text-gray-500">Không tìm thấy đơn hàng</div>

  const statusInfo = ORDER_STATUS[order.orderStatus]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/don-hang" className="text-sm text-amber-600 hover:text-amber-700 mb-2 inline-block">← Quay lại</Link>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order._id.slice(-8).toUpperCase()}</h1>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold bg-${statusInfo?.color}-50 text-${statusInfo?.color}-600`}>
          {statusInfo?.label}
        </span>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">Sản phẩm</h2>
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-400">{item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Màu: ${item.color}`}</p>
                  )}
                  <p className="text-xs text-gray-500">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Địa chỉ giao hàng</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Thanh toán</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Phương thức: <span className="font-medium text-gray-800">{PAYMENT_METHOD[order.paymentMethod]}</span></p>
              <p>Trạng thái: <span className="font-medium">{PAYMENT_STATUS[order.paymentStatus]?.label}</span></p>
              <p>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{formatPrice(order.itemsPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{order.shippingPrice === 0 ? 'Miễn phí' : formatPrice(order.shippingPrice)}</span></div>
            {order.discountPrice > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(order.discountPrice)}</span></div>}
            {order.taxPrice > 0 && <div className="flex justify-between"><span className="text-gray-600">Thuế</span><span>{formatPrice(order.taxPrice)}</span></div>}
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base font-bold"><span>Tổng cộng</span><span className="text-amber-600">{formatPrice(order.totalPrice)}</span></div>
          </div>
        </div>

        {/* Cancel */}
        {['pending', 'processing'].includes(order.orderStatus) && (
          <button onClick={handleCancel} className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition">
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  )
}
