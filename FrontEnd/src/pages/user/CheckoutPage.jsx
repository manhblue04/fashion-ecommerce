import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useCartStore from '../../store/cartStore'
import useAuthStore from '../../store/authStore'
import { createOrder, validateCoupon } from '../../services/orderService'
import { formatPrice } from '../../utils/formatPrice'

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [address, setAddress] = useState({
    fullName: '', phone: '', addressLine: '', city: '', district: '', ward: '',
  })

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
  useEffect(() => {
    if (defaultAddr) {
      setAddress({
        fullName: defaultAddr.fullName,
        phone: defaultAddr.phone,
        addressLine: defaultAddr.addressLine,
        city: defaultAddr.city,
        district: defaultAddr.district,
        ward: defaultAddr.ward,
      })
    }
  }, [user])

  const itemsPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const shippingPrice = itemsPrice >= 500000 ? 0 : 30000
  const totalPrice = itemsPrice + shippingPrice - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const res = await validateCoupon({ code: couponCode, orderTotal: itemsPrice })
      setDiscount(res.coupon.discount)
      toast.success(`Áp dụng mã giảm giá thành công: -${formatPrice(res.coupon.discount)}`)
    } catch (err) {
      toast.error(err.message)
      setDiscount(0)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) return toast.error('Giỏ hàng trống')

    for (const key of ['fullName', 'phone', 'addressLine', 'city', 'district', 'ward']) {
      if (!address[key].trim()) return toast.error('Vui lòng điền đầy đủ địa chỉ giao hàng')
    }

    setLoading(true)
    try {
      const res = await createOrder({
        orderItems: items.map((i) => ({ product: i.product, name: i.name, image: i.image, price: i.price, quantity: i.quantity, size: i.size || '', color: i.color || '' })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponCode || undefined,
      })
      clearCart()
      toast.success(res.message)
      navigate(`/don-hang/${res.order._id}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/gio-hang')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Địa chỉ giao hàng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} placeholder="Họ tên người nhận" required className="px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              <input value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} placeholder="Số điện thoại" required className="px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="Tỉnh / Thành phố" required className="px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              <input value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })} placeholder="Quận / Huyện" required className="px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              <input value={address.ward} onChange={(e) => setAddress({ ...address, ward: e.target.value })} placeholder="Phường / Xã" required className="px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
              <input value={address.addressLine} onChange={(e) => setAddress({ ...address, addressLine: e.target.value })} placeholder="Địa chỉ chi tiết" required className="px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Phương thức thanh toán</h2>
            <div className="space-y-3">
              {[
                { value: 'COD', label: 'Thanh toán khi nhận hàng (COD)' },
                { value: 'MOMO', label: 'Ví MoMo' },
                { value: 'VNPAY', label: 'VNPay' },
              ].map((m) => (
                <label key={m.value} className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${paymentMethod === m.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-amber-500" />
                  <span className="text-sm font-medium text-gray-800">{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn hàng ({items.length} sản phẩm)</h2>

          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.cartKey} className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover bg-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 line-clamp-1">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-400">{item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Màu: ${item.color}`}</p>
                  )}
                  <p className="text-xs text-gray-500">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="flex gap-2 mb-4">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Mã giảm giá" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            <button type="button" onClick={handleApplyCoupon} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Áp dụng</button>
          </div>

          <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{formatPrice(itemsPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{shippingPrice === 0 ? 'Miễn phí' : formatPrice(shippingPrice)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(discount)}</span></div>}
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base font-bold"><span>Tổng cộng</span><span className="text-amber-600">{formatPrice(totalPrice)}</span></div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </form>
    </div>
  )
}
