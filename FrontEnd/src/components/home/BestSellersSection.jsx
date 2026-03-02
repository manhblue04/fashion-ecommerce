import ProductCard from '../common/ProductCard'
import SectionTitle from './SectionTitle'

export default function BestSellersSection({ products }) {
  if (!products || products.length === 0) return null

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle sub="Được yêu thích" title="Bán chạy nhất" desc="Những sản phẩm được khách hàng yêu thích nhất" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
