import { Link } from 'react-router-dom'

export default function CTABanner() {
  return (
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
  )
}
