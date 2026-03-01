import { Link } from 'react-router-dom'
import { HiOutlineTrash, HiMinus, HiPlus, HiOutlineShoppingBag } from 'react-icons/hi'
import EmptyState from '../../components/common/EmptyState'
import useCartStore from '../../store/cartStore'
import { formatPrice } from '../../utils/formatPrice'

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore()
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          icon={HiOutlineShoppingBag}
          title="Giỏ hàng trống"
          description="Hãy thêm sản phẩm vào giỏ hàng"
          action={<Link to="/san-pham" className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition">Mua sắm ngay</Link>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Giỏ hàng ({totalItems} sản phẩm)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.cartKey} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-xl">
              <Link to={`/san-pham/${item.slug}`} className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/san-pham/${item.slug}`} className="text-sm font-medium text-gray-800 hover:text-amber-600 line-clamp-1">{item.name}</Link>
                {(item.size || item.color) && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.size && item.color && <span> · </span>}
                    {item.color && <span>Màu: {item.color}</span>}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.cartKey, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><HiMinus className="w-3 h-3" /></button>
                    <span className="w-10 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartKey, Math.min(item.stock, item.quantity + 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"><HiPlus className="w-3 h-3" /></button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.cartKey)} className="text-gray-400 hover:text-red-500 transition"><HiOutlineTrash className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span className="text-gray-500">Tính ở bước thanh toán</span></div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base"><span className="font-bold">Tổng cộng</span><span className="font-bold text-amber-600">{formatPrice(totalPrice)}</span></div>
          </div>
          <Link
            to="/thanh-toan"
            className="block w-full text-center mt-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
          >
            Tiến hành thanh toán
          </Link>
          <Link to="/san-pham" className="block text-center text-sm text-gray-500 mt-3 hover:text-amber-600">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  )
}
