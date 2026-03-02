import { Link } from 'react-router-dom'
import SectionTitle from './SectionTitle'

export default function CategoriesSection({ categories }) {
  if (!categories || categories.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle sub="Khám phá" title="Danh mục nổi bật" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {categories.slice(0, 4).map((cat) => (
          <Link key={cat._id} to={`/san-pham?category=${cat._id}`} className="group relative aspect-[3/4] rounded-2xl overflow-hidden">
            {cat.image?.url ? (
              <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-amber-300 text-xs tracking-wider uppercase mb-1">Khám phá</p>
              <h3 className="text-white text-xl font-bold">{cat.name}</h3>
              <p className="text-white/80 text-sm mt-2 flex items-center gap-1">
                Xem ngay <span className="group-hover:translate-x-1 transition-transform">→</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
