import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineHeart, HiHeart, HiOutlineShoppingBag, HiX, HiCheck } from 'react-icons/hi'
import api from '../../services/api'
import { formatPrice } from '../../utils/formatPrice'
import useCartStore from '../../store/cartStore'
import useWishlistStore from '../../store/wishlistStore'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'

export default function ShopTheLook() {
  const [outfits, setOutfits] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selections, setSelections] = useState({})
  const [selectedItemId, setSelectedItemId] = useState('__init__')
  const [previewImgIdx, setPreviewImgIdx] = useState(0)

  const addOutfitItems = useCartStore((s) => s.addOutfitItems)
  const fetchSavedOutfitCount = useWishlistStore((s) => s.fetchSavedOutfitCount)
  const { user } = useAuthStore()

  useEffect(() => {
    api.get('/outfits')
      .then((res) => setOutfits(res.outfits || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (user) {
      api.get('/outfits/saved/ids').then((res) => setSavedIds(res.ids || [])).catch(() => {})
    }
  }, [user])

  useEffect(() => {
    const firstItem = outfits[activeIdx]?.items?.find((i) => i.product)
    setSelectedItemId(firstItem?._id || null)
    setPreviewImgIdx(0)
  }, [activeIdx, outfits])

  if (loading || outfits.length === 0) return null

  const outfit = outfits[activeIdx]
  const discount = outfit.discountPercent || 0

  const getItemPrice = (p) => p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price
  const totalOriginal = outfit.items.reduce((s, i) => i.product ? s + getItemPrice(i.product) : s, 0)
  const totalSet = Math.round(totalOriginal * (1 - discount / 100))
  const totalSaved = totalOriginal - totalSet
  const isSaved = savedIds.includes(outfit._id)

  const selectedItem = selectedItemId
    ? outfit.items.find((i) => i._id === selectedItemId)
    : null
  const previewProduct = selectedItem?.product || null
  const previewImages = previewProduct?.images || []

  const goTo = (dir) => {
    const next = (activeIdx + dir + outfits.length) % outfits.length
    setActiveIdx(next)
  }

  const handleSelectItem = (itemId) => {
    if (selectedItemId === itemId) return
    setSelectedItemId(itemId)
    setPreviewImgIdx(0)
  }

  const openBuyModal = () => {
    const init = {}
    outfit.items.forEach((item) => {
      const p = item.product
      if (!p) return
      init[p._id] = {
        size: p.sizes?.[0] || '',
        color: p.colors?.[0] || '',
      }
    })
    setSelections(init)
    setModalOpen(true)
  }

  const handleConfirmBuy = () => {
    const hasError = outfit.items.some((item) => {
      const p = item.product
      if (!p) return false
      if (p.sizes?.length > 0 && !selections[p._id]?.size) return true
      if (p.colors?.length > 0 && !selections[p._id]?.color) return true
      return false
    })
    if (hasError) return toast.error('Vui lòng chọn đầy đủ size/màu cho tất cả sản phẩm')

    const itemsWithSelection = outfit.items.map((item) => ({
      product: item.product,
      size: selections[item.product?._id]?.size || '',
      color: selections[item.product?._id]?.color || '',
    }))
    addOutfitItems(itemsWithSelection, discount)
    setModalOpen(false)
  }

  const handleToggleSave = async () => {
    if (!user) return toast.error('Vui lòng đăng nhập')
    try {
      const res = await api.post(`/outfits/save/${outfit._id}`)
      toast.success(res.message)
      if (res.saved) setSavedIds([...savedIds, outfit._id])
      else setSavedIds(savedIds.filter((id) => id !== outfit._id))
      fetchSavedOutfitCount()
    } catch {
      toast.error('Có lỗi xảy ra')
    }
  }

  return (
    <>
      <section className="py-16 lg:py-20 bg-[#faf9f7]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Phong cách</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">SHOP THE LOOK</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">{outfit.description || 'Complete outfits ready to wear'}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
            {/* === COL 1: Full outfit image === */}
            <div className="relative bg-[#f0eeeb] rounded-2xl overflow-hidden">
              <div className="relative aspect-[3/4]">
                <img src={outfit.image?.url} alt={outfit.name} className="w-full h-full object-cover" />

                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {outfit.badge || `Tiết kiệm ${discount}% khi mua full set`}
                  </div>
                )}

                <button onClick={handleToggleSave} className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition">
                  {isSaved ? <HiHeart className="w-5 h-5 text-red-500" /> : <HiOutlineHeart className="w-5 h-5 text-gray-600" />}
                </button>

                {outfit.items.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectItem(item._id)}
                    className="absolute group"
                    style={{ left: `${item.posX}%`, top: `${item.posY}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <span className={`block w-7 h-7 rounded-full border-2 transition-all duration-300 ${selectedItemId === item._id ? 'bg-amber-500/80 border-amber-400 scale-125' : 'bg-white/70 border-white/90 hover:bg-white hover:scale-110'}`}>
                      <span className={`absolute inset-[5px] rounded-full transition-colors ${selectedItemId === item._id ? 'bg-white' : 'bg-gray-700'}`} />
                    </span>
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {item.label || item.product?.name}
                    </span>
                  </button>
                ))}
              </div>

              {outfits.length > 1 && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <button onClick={() => goTo(-1)} className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                    <HiOutlineChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="flex gap-1.5">
                    {outfits.map((_, i) => (
                      <button key={i} onClick={() => setActiveIdx(i)} className={`h-1.5 rounded-full transition-all ${i === activeIdx ? 'w-6 bg-gray-900' : 'w-1.5 bg-gray-400'}`} />
                    ))}
                  </div>
                  <button onClick={() => goTo(1)} className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition">
                    <HiOutlineChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* === COL 2: Preview selected product (fixed height = same as col 1) === */}
            <div className="hidden lg:block rounded-2xl overflow-hidden bg-[#f5f4f2] border border-gray-100">
              <div className="aspect-[3/4] flex flex-col">
                {previewProduct ? (
                  <>
                    <div className="flex-1 min-h-0 flex items-center justify-center p-6 pb-2">
                      <div className="relative w-[75%] aspect-[3/4] rounded-xl overflow-hidden shadow-lg">
                        <img
                          src={previewImages[previewImgIdx]?.url || previewImages[0]?.url}
                          alt={previewProduct.name}
                          className="w-full h-full object-cover"
                        />
                        {previewImages.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1">
                            {previewImages.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setPreviewImgIdx(idx)}
                                className={`w-1.5 h-1.5 rounded-full transition ${idx === previewImgIdx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 px-5 pb-5 pt-2 text-center">
                      {previewProduct.brand && (
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{previewProduct.brand}</p>
                      )}
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{previewProduct.name}</h4>
                      <div className="flex items-baseline justify-center gap-2 mt-1">
                        <span className="text-base font-bold text-gray-900">
                          {formatPrice(Math.round(getItemPrice(previewProduct) * (1 - discount / 100)))}
                        </span>
                        {discount > 0 && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(getItemPrice(previewProduct))}</span>
                        )}
                      </div>
                      <Link
                        to={`/san-pham/${previewProduct.slug}`}
                        className="inline-flex items-center gap-1 mt-2 px-4 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 rounded-full hover:bg-amber-100 transition"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-6">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-3 mx-auto shadow-sm">
                        <HiOutlineShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">Chọn sản phẩm để xem</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* === COL 3: Items list + Buy set (fixed aspect to match col 1 & 2) === */}
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="lg:aspect-[3/4] flex flex-col p-4 lg:p-5">
                <div className="flex items-center justify-between mb-3 shrink-0">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{outfit.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{outfit.items.length} sản phẩm trong set</p>
                  </div>
                  <button onClick={handleToggleSave} className="lg:hidden w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                    {isSaved ? <HiHeart className="w-4 h-4 text-red-500" /> : <HiOutlineHeart className="w-4 h-4 text-gray-500" />}
                  </button>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto pr-1 min-h-0">
                  {outfit.items.map((item) => {
                    const p = item.product
                    if (!p) return null
                    const price = getItemPrice(p)
                    const setPrice = Math.round(price * (1 - discount / 100))
                    const isActive = selectedItemId === item._id
                    return (
                      <button
                        key={item._id}
                        onClick={() => handleSelectItem(item._id)}
                        className={`w-full flex gap-3 p-2.5 rounded-xl border text-left transition group ${isActive ? 'border-amber-400 bg-amber-50/60' : 'border-gray-100 hover:border-amber-200 hover:bg-gray-50/50'}`}
                      >
                        <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 ring-2 transition ${isActive ? 'ring-amber-400' : 'ring-transparent'}`}>
                          <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          {p.brand && <p className="text-[10px] text-gray-400 uppercase tracking-wider leading-none mb-0.5">{p.brand}</p>}
                          <p className={`text-xs font-medium line-clamp-1 transition ${isActive ? 'text-amber-700' : 'text-gray-800 group-hover:text-amber-600'}`}>{p.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-bold text-gray-900">{formatPrice(setPrice)}</span>
                            {discount > 0 && <span className="text-[10px] text-gray-400 line-through">{formatPrice(price)}</span>}
                          </div>
                        </div>
                        {isActive && (
                          <div className="shrink-0 self-center w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                            <HiCheck className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="shrink-0 pt-3 mt-auto border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Tổng giá cả set</p>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(totalSet)}</span>
                        {totalSaved > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(totalOriginal)}</span>}
                      </div>
                    </div>
                    {totalSaved > 0 && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">-{formatPrice(totalSaved)}</span>
                    )}
                  </div>

                  <button onClick={openBuyModal} className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition">
                    <HiOutlineShoppingBag className="w-4 h-4" />
                    MUA CẢ SET
                  </button>

                  <button onClick={handleToggleSave} className="hidden lg:flex w-full items-center justify-center gap-1.5 mt-1.5 py-2 border border-gray-200 text-gray-600 text-xs rounded-xl hover:bg-gray-50 transition">
                    {isSaved ? <HiHeart className="w-3.5 h-3.5 text-red-500" /> : <HiOutlineHeart className="w-3.5 h-3.5" />}
                    {isSaved ? 'Đã lưu look' : 'Lưu look này'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Size/Color picker modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chọn size & màu</h3>
                <p className="text-sm text-gray-500">{outfit.name} — {outfit.items.length} sản phẩm</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <HiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {outfit.items.map((item) => {
                const p = item.product
                if (!p) return null
                const sel = selections[p._id] || {}
                return (
                  <div key={item._id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      <img src={p.images?.[0]?.url} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</p>

                      {p.sizes?.length > 0 && (
                        <div className="mt-1.5">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Size</p>
                          <div className="flex flex-wrap gap-1">
                            {p.sizes.map((s) => (
                              <button
                                key={s}
                                onClick={() => setSelections({ ...selections, [p._id]: { ...sel, size: s } })}
                                className={`px-2.5 py-1 text-xs border rounded transition ${sel.size === s ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {p.colors?.length > 0 && (
                        <div className="mt-1.5">
                          <p className="text-[10px] text-gray-500 uppercase mb-1">Màu</p>
                          <div className="flex flex-wrap gap-1">
                            {p.colors.map((c) => (
                              <button
                                key={c}
                                onClick={() => setSelections({ ...selections, [p._id]: { ...sel, color: c } })}
                                className={`px-2.5 py-1 text-xs border rounded transition ${sel.color === c ? 'border-amber-500 bg-amber-50 text-amber-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Tổng cộng</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(totalSet)}</span>
                  {totalSaved > 0 && <span className="text-xs text-green-600 font-medium">-{formatPrice(totalSaved)}</span>}
                </div>
              </div>
              <button onClick={handleConfirmBuy} className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition">
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
