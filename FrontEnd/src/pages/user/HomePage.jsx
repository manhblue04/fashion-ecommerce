import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import ProductCard from '../../components/common/ProductCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getFeaturedProducts, getNewArrivals, getBestSellers, getSaleProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'
import api from '../../services/api'

function SectionTitle({ sub, title, desc }) {
  return (
    <div className="text-center mb-10">
      {sub && <p className="text-amber-600 text-xs font-semibold tracking-[0.2em] uppercase mb-2">{sub}</p>}
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{title}</h2>
      {desc && <p className="text-gray-500 mt-3 max-w-lg mx-auto">{desc}</p>}
    </div>
  )
}

export default function HomePage() {
  const [banners, setBanners] = useState([])
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [sale, setSale] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, catRes, featuredRes, newRes, bestRes, saleRes] = await Promise.all([
          api.get('/banners?type=home'),
          getCategories(),
          getFeaturedProducts(),
          getNewArrivals(),
          getBestSellers(),
          getSaleProducts(),
        ])
        setBanners(bannersRes.banners)
        setCategories(catRes.categories)
        setFeatured(featuredRes.products)
        setNewArrivals(newRes.products)
        setBestSellers(bestRes.products)
        setSale(saleRes.products)
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative">
        {banners.length > 0 ? (
          <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 5000 }} pagination={{ clickable: true }} loop className="w-full aspect-[16/7] lg:aspect-[16/6]">
            {banners.map((b) => (
              <SwiperSlide key={b._id}>
                <div className="relative w-full h-full">
                  <img src={b.image?.url} alt={b.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-7xl mx-auto px-4 w-full">
                      <p className="text-amber-300 text-xs tracking-[0.3em] uppercase mb-3">{b.subtitle}</p>
                      <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight max-w-xl">{b.title}</h1>
                      {b.link && (
                        <Link to={b.link} className="inline-block mt-6 px-8 py-3 bg-white text-gray-900 text-sm font-medium rounded hover:bg-amber-500 hover:text-white transition">
                          Khám phá ngay
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative w-full aspect-[16/7] lg:aspect-[16/6] bg-gradient-to-r from-gray-900 to-gray-700 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <p className="text-amber-400 text-xs tracking-[0.3em] uppercase mb-3">Bộ sưu tập mới 2026</p>
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Thời Trang<br /><span className="text-amber-400">Cao Cấp</span>
              </h1>
              <p className="text-gray-300 mt-4 max-w-md">
                Khám phá sự thanh lịch vượt thời gian và sự tinh tế với bộ sưu tập được chọn lọc của chúng tôi
              </p>
              <div className="flex gap-4 mt-8">
                <Link to="/san-pham" className="px-8 py-3 bg-white text-gray-900 text-sm font-medium rounded hover:bg-amber-500 hover:text-white transition">
                  Mua sắm ngay
                </Link>
                <Link to="/san-pham?sort=-createdAt" className="px-8 py-3 border border-white text-white text-sm font-medium rounded hover:bg-white hover:text-gray-900 transition">
                  Hàng mới về
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
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
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle sub="Chọn lọc cho bạn" title="Sản phẩm nổi bật" desc="Tuyển tập những sản phẩm tinh tế nhất, định nghĩa sự sang trọng" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Phong cách <span className="text-amber-400">Đẳng cấp</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-md mx-auto">
            Nâng tầm phong cách với những sản phẩm thời trang cao cấp, tạo nên dấu ấn riêng
          </p>
          <Link to="/san-pham" className="inline-block mt-8 px-10 py-3.5 border border-white text-white text-sm font-medium rounded hover:bg-white hover:text-gray-900 transition">
            Khám phá bộ sưu tập
          </Link>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionTitle sub="Mới & Xu hướng" title="Hàng mới về" desc="Khám phá những sản phẩm mới nhất" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link to="/san-pham?sort=-createdAt" className="inline-block px-8 py-3 border border-gray-900 text-gray-900 text-sm font-medium rounded hover:bg-gray-900 hover:text-white transition">
              Xem tất cả
            </Link>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <SectionTitle sub="Được yêu thích" title="Bán chạy nhất" desc="Những sản phẩm được khách hàng yêu thích nhất" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {bestSellers.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Sale */}
      {sale.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionTitle sub="Ưu đãi đặc biệt" title="Giảm giá hấp dẫn" desc="Nhanh tay sở hữu những sản phẩm với giá ưu đãi" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {sale.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
