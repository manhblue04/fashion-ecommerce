import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiOutlineFilter, HiX } from 'react-icons/hi'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  const keyword = searchParams.get('keyword') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const page = parseInt(searchParams.get('page')) || 1
  const minPrice = searchParams.get('price[gte]') || ''
  const maxPrice = searchParams.get('price[lte]') || ''
  const gender = searchParams.get('gender') || ''
  const size = searchParams.get('size') || ''
  const color = searchParams.get('color') || ''

  useEffect(() => {
    getCategories().then((res) => setCategories(res.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = { page, sort, limit: 12 }
        if (keyword) params.keyword = keyword
        if (category) params.category = category
        if (minPrice) params['price[gte]'] = minPrice
        if (maxPrice) params['price[lte]'] = maxPrice
        if (gender) params.gender = gender
        if (size) params.size = size
        if (color) params.color = color

        const res = await getProducts(params)
        setProducts(res.products)
        setTotal(res.total)
        setPages(res.pages)
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [keyword, category, sort, page, minPrice, maxPrice, gender, size, color])

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
  }

  const sortOptions = [
    { value: '-createdAt', label: 'Mới nhất' },
    { value: 'price', label: 'Giá tăng dần' },
    { value: '-price', label: 'Giá giảm dần' },
    { value: '-sold', label: 'Bán chạy nhất' },
    { value: '-rating', label: 'Đánh giá cao' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {keyword ? `Kết quả tìm kiếm: "${keyword}"` : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} sản phẩm</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500"
          >
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={() => setShowFilter(!showFilter)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <HiOutlineFilter className="w-4 h-4" /> Bộ lọc
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filter */}
        <aside className={`${showFilter ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} lg:block lg:static lg:w-56 shrink-0`}>
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="text-lg font-bold">Bộ lọc</h2>
            <button onClick={() => setShowFilter(false)}><HiX className="w-6 h-6" /></button>
          </div>

          {/* Category filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Danh mục</h3>
            <div className="space-y-2">
              <button
                onClick={() => updateParam('category', '')}
                className={`block text-sm ${!category ? 'text-amber-600 font-medium' : 'text-gray-600 hover:text-amber-600'}`}
              >
                Tất cả
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateParam('category', cat._id)}
                  className={`block text-sm ${category === cat._id ? 'text-amber-600 font-medium' : 'text-gray-600 hover:text-amber-600'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Gender filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Giới tính</h3>
            <div className="space-y-2">
              {[
                { value: '', label: 'Tất cả' },
                { value: 'men', label: 'Nam' },
                { value: 'women', label: 'Nữ' },
                { value: 'unisex', label: 'Unisex' },
              ].map((g) => (
                <button
                  key={g.value}
                  onClick={() => updateParam('gender', g.value)}
                  className={`block text-sm ${gender === g.value ? 'text-amber-600 font-medium' : 'text-gray-600 hover:text-amber-600'}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Kích thước</h3>
            <div className="flex flex-wrap gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateParam('size', size === s ? '' : s)}
                  className={`px-3 py-1.5 border rounded text-xs font-medium transition ${
                    size === s ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Màu sắc</h3>
            <div className="flex flex-wrap gap-2">
              {['Đen', 'Trắng', 'Beige', 'Xám', 'Nâu', 'Xanh navy'].map((c) => (
                <button
                  key={c}
                  onClick={() => updateParam('color', color === c ? '' : c)}
                  className={`px-3 py-1.5 border rounded text-xs font-medium transition ${
                    color === c ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Khoảng giá</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => updateParam('price[gte]', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => updateParam('price[lte]', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {(category || minPrice || maxPrice || gender || size || color) && (
            <button
              onClick={() => setSearchParams(keyword ? { keyword } : {})}
              className="text-sm text-red-500 hover:text-red-600"
            >
              Xóa bộ lọc
            </button>
          )}
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <EmptyState title="Không tìm thấy sản phẩm" description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set('page', p)
                        setSearchParams(params)
                      }}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        p === page ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
