import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineSearch, HiOutlineHeart, HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiX } from 'react-icons/hi'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'
import useWishlistStore from '../../store/wishlistStore'
import useDebounce from '../../hooks/useDebounce'
import { searchSuggestions } from '../../services/productService'
import { formatPrice } from '../../utils/formatPrice'

export default function Header() {
  const { user, logout } = useAuthStore()
  const items = useCartStore((s) => s.items)
  const wishlistItems = useWishlistStore((s) => s.items)
  const navigate = useNavigate()

  const [mobileMenu, setMobileMenu] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const debouncedKeyword = useDebounce(keyword, 400)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

  const cartCount = items.reduce((s, i) => s + i.quantity, 0)
  const wishlistCount = wishlistItems.length

  useEffect(() => {
    if (debouncedKeyword.length >= 2) {
      searchSuggestions(debouncedKeyword).then((res) => setSuggestions(res.suggestions))
    } else {
      setSuggestions([])
    }
  }, [debouncedKeyword])

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSuggestions([])
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      navigate(`/san-pham?keyword=${encodeURIComponent(keyword.trim())}`)
      setKeyword('')
      setSearchOpen(false)
      setSuggestions([])
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="text-xl lg:text-2xl font-bold tracking-widest text-gray-900 uppercase">
            Fashion
          </Link>

          {/* Search - Desktop */}
          <div ref={searchRef} className="hidden md:block relative flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); setSearchOpen(true) }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
              </div>
            </form>
            {searchOpen && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
                {suggestions.map((p) => (
                  <Link
                    key={p._id}
                    to={`/san-pham/${p.slug}`}
                    onClick={() => { setSearchOpen(false); setKeyword('') }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                  >
                    <img src={p.images?.[0]?.url} alt={p.name} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-sm text-amber-600">{formatPrice(p.discountPrice || p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav - Desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-amber-600 transition">Trang chủ</Link>
            <Link to="/san-pham" className="text-sm font-medium text-gray-700 hover:text-amber-600 transition">Sản phẩm</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 lg:gap-4 ml-4">
            <Link to="/yeu-thich" className="relative p-2 text-gray-700 hover:text-amber-600 transition">
              <HiOutlineHeart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-xs rounded-full">{wishlistCount}</span>
              )}
            </Link>
            <Link to="/gio-hang" className="relative p-2 text-gray-700 hover:text-amber-600 transition">
              <HiOutlineShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center bg-amber-500 text-white text-xs rounded-full">{cartCount}</span>
              )}
            </Link>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 p-2 text-gray-700 hover:text-amber-600 transition">
                <HiOutlineUser className="w-6 h-6" />
                {user && <span className="hidden lg:inline text-sm font-medium">{user.name || 'Tài khoản'}</span>}
              </button>
              {userMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name || user.email}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link to="/tai-khoan" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Tài khoản của tôi</Link>
                      <Link to="/don-hang" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Đơn hàng</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-amber-600 hover:bg-gray-50">Trang quản trị</Link>
                      )}
                      <button onClick={() => { logout(); setUserMenu(false); navigate('/') }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50">Đăng xuất</button>
                    </>
                  ) : (
                    <>
                      <Link to="/dang-nhap" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Đăng nhập</Link>
                      <Link to="/dang-ky" onClick={() => setUserMenu(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Đăng ký</Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-gray-700">
              {mobileMenu ? <HiX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-2">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </form>
            <Link to="/" onClick={() => setMobileMenu(false)} className="block py-2 text-gray-700 font-medium">Trang chủ</Link>
            <Link to="/san-pham" onClick={() => setMobileMenu(false)} className="block py-2 text-gray-700 font-medium">Sản phẩm</Link>
          </div>
        )}
      </div>
    </header>
  )
}
