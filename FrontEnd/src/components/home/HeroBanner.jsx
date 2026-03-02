import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

export default function HeroBanner({ banners }) {
  if (banners.length > 0) {
    return (
      <section className="relative">
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
      </section>
    )
  }

  return (
    <section className="relative w-full aspect-[16/7] lg:aspect-[16/6] bg-gradient-to-r from-gray-900 to-gray-700 flex items-center">
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
    </section>
  )
}
