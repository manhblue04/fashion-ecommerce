import { Link } from 'react-router-dom'
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold tracking-widest uppercase mb-4">Fashion</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              Khám phá sự thanh lịch vượt thời gian và sự tinh tế với bộ sưu tập thời trang cao cấp của chúng tôi.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-amber-400 transition">Trang chủ</Link></li>
              <li><Link to="/san-pham" className="hover:text-amber-400 transition">Sản phẩm</Link></li>
              <li><Link to="/san-pham?sort=-sold" className="hover:text-amber-400 transition">Bán chạy</Link></li>
              <li><Link to="/san-pham?sort=-createdAt" className="hover:text-amber-400 transition">Hàng mới</Link></li>
            </ul>
          </div>

          {/* Customer */}
          <div>
            <h4 className="text-white font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tai-khoan" className="hover:text-amber-400 transition">Tài khoản</Link></li>
              <li><Link to="/don-hang" className="hover:text-amber-400 transition">Đơn hàng</Link></li>
              <li><Link to="/yeu-thich" className="hover:text-amber-400 transition">Yêu thích</Link></li>
              <li><Link to="/gio-hang" className="hover:text-amber-400 transition">Giỏ hàng</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <HiOutlineLocationMarker className="w-5 h-5 text-amber-400 shrink-0" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <HiOutlinePhone className="w-5 h-5 text-amber-400 shrink-0" />
                <span>0123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <HiOutlineMail className="w-5 h-5 text-amber-400 shrink-0" />
                <span>contact@fashion.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Fashion Store. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  )
}
