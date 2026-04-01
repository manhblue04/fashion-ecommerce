import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineTrash, HiMinus, HiPlus, HiOutlineShoppingBag } from 'react-icons/hi'
import EmptyState from '../../components/common/EmptyState'
import useCartStore from '../../store/cartStore'
import { formatPrice } from '../../utils/formatPrice'

export default function CartPage() {
  const { items, updateQuantity, removeItem } = useCartStore()
  const [selected, setSelected] = useState(() => new Set(items.map((i) => i.cartKey)))
  const [qtyInputs, setQtyInputs] = useState({})

  const allChecked = items.length > 0 && items.every((i) => selected.has(i.cartKey))
  const someChecked = items.some((i) => selected.has(i.cartKey))

  const toggleAll = () => {
    if (allChecked) setSelected(new Set())
    else setSelected(new Set(items.map((i) => i.cartKey)))
  }

  const toggleItem = (key) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleQtyInput = (key, value) => {
    setQtyInputs((prev) => ({ ...prev, [key]: value }))
  }

  const commitQty = (key, stock) => {
    const raw = qtyInputs[key]
    if (raw === undefined || raw === '') {
      setQtyInputs((prev) => { const n = { ...prev }; delete n[key]; return n })
      return
    }
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed)) {
      const clamped = Math.min(Math.max(1, parsed), stock)
      updateQuantity(key, clamped)
    }
    setQtyInputs((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  const selectedItems = items.filter((i) => selected.has(i.cartKey))
  const totalPrice = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)
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
        <div className="lg:col-span-2 space-y-3">
          {/* Select all row */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl">
            <input
              type="checkbox"
              checked={allChecked}
              ref={(el) => { if (el) el.indeterminate = !allChecked && someChecked }}
              onChange={toggleAll}
              className="w-4 h-4 rounded accent-gray-900 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">
              Chọn tất cả ({items.length} sản phẩm)
            </span>
            {someChecked && !allChecked && (
              <span className="ml-auto text-xs text-gray-400">Đã chọn {selected.size} sản phẩm</span>
            )}
          </div>

          {items.map((item) => {
            const isSelected = selected.has(item.cartKey)
            const inputVal = qtyInputs[item.cartKey] !== undefined ? qtyInputs[item.cartKey] : item.quantity

            return (
              <div
                key={item.cartKey}
                onClick={() => toggleItem(item.cartKey)}
                className={`flex gap-3 p-4 bg-white border rounded-xl transition cursor-pointer select-none ${isSelected ? 'border-gray-900' : 'border-gray-100 hover:border-gray-300'}`}
              >
                {/* Checkbox */}
                <div className="flex items-center pt-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItem(item.cartKey)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded accent-gray-900 cursor-pointer"
                  />
                </div>

                {/* Image */}
                <Link to={`/san-pham/${item.slug}`} onClick={(e) => e.stopPropagation()} className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link to={`/san-pham/${item.slug}`} onClick={(e) => e.stopPropagation()} className="text-sm font-medium text-gray-800 hover:text-amber-600 line-clamp-1">{item.name}</Link>
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

                  <div className="flex items-center justify-between mt-3" onClick={(e) => e.stopPropagation()}>
                    {/* Quantity control */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.cartKey, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <HiMinus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.stock}
                        value={inputVal}
                        onChange={(e) => handleQtyInput(item.cartKey, e.target.value)}
                        onBlur={() => commitQty(item.cartKey, item.stock)}
                        onKeyDown={(e) => e.key === 'Enter' && commitQty(item.cartKey, item.stock)}
                        className="w-12 h-8 text-center text-sm border-x border-gray-200 focus:outline-none focus:bg-amber-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.cartKey, Math.min(item.stock, item.quantity + 1))}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition"
                      >
                        <HiPlus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.cartKey)} className="text-gray-400 hover:text-red-500 transition">
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

          {selectedItems.length > 0 ? (
            <p className="text-xs text-gray-500 mb-3">{selectedItems.length} sản phẩm được chọn</p>
          ) : (
            <p className="text-xs text-amber-600 mb-3">Chưa chọn sản phẩm nào</p>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span className="font-medium">{formatPrice(totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span className="text-gray-500">Tính ở bước thanh toán</span></div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base"><span className="font-bold">Tổng cộng</span><span className="font-bold text-amber-600">{formatPrice(totalPrice)}</span></div>
          </div>

          <Link
            to={selectedItems.length > 0 ? '/thanh-toan' : '#'}
            onClick={(e) => selectedItems.length === 0 && e.preventDefault()}
            className={`block w-full text-center mt-6 py-3.5 rounded-lg font-medium transition ${
              selectedItems.length > 0
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
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
