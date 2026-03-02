import { Link } from 'react-router-dom'
import ProductCard from '../common/ProductCard'
import SectionTitle from './SectionTitle'

export default function NewArrivalsSection({ products }) {
  if (!products || products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle sub="Mới & Xu hướng" title="Hàng mới về" desc="Khám phá những sản phẩm mới nhất" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      <div className="text-center mt-10">
        <Link to="/san-pham?sort=-createdAt" className="inline-block px-8 py-3 border border-gray-900 text-gray-900 text-sm font-medium rounded hover:bg-gray-900 hover:text-white transition">
          Xem tất cả
        </Link>
      </div>
    </section>
  )
}
