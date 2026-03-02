import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import useWishlistStore from './store/wishlistStore'
import UserLayout from './components/layout/UserLayout'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import LoadingSpinner from './components/common/LoadingSpinner'

const HomePage = lazy(() => import('./pages/user/HomePage'))
const ProductsPage = lazy(() => import('./pages/user/ProductsPage'))
const ProductDetailPage = lazy(() => import('./pages/user/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/user/CartPage'))
const WishlistPage = lazy(() => import('./pages/user/WishlistPage'))
const CheckoutPage = lazy(() => import('./pages/user/CheckoutPage'))
const OrdersPage = lazy(() => import('./pages/user/OrdersPage'))
const OrderDetailPage = lazy(() => import('./pages/user/OrderDetailPage'))
const AccountPage = lazy(() => import('./pages/user/AccountPage'))
const LoginPage = lazy(() => import('./pages/user/LoginPage'))
const RegisterPage = lazy(() => import('./pages/user/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/user/ForgotPasswordPage'))
const NotFoundPage = lazy(() => import('./pages/user/NotFoundPage'))

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const ProductMgmtPage = lazy(() => import('./pages/admin/ProductMgmtPage'))
const CategoryMgmtPage = lazy(() => import('./pages/admin/CategoryMgmtPage'))
const OrderMgmtPage = lazy(() => import('./pages/admin/OrderMgmtPage'))
const UserMgmtPage = lazy(() => import('./pages/admin/UserMgmtPage'))
const ReviewMgmtPage = lazy(() => import('./pages/admin/ReviewMgmtPage'))
const BannerMgmtPage = lazy(() => import('./pages/admin/BannerMgmtPage'))
const CouponMgmtPage = lazy(() => import('./pages/admin/CouponMgmtPage'))
const OutfitMgmtPage = lazy(() => import('./pages/admin/OutfitMgmtPage'))
const SettingPage = lazy(() => import('./pages/admin/SettingPage'))

function App() {
  const { token, fetchMe } = useAuthStore()
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist)

  const fetchSavedOutfitCount = useWishlistStore((s) => s.fetchSavedOutfitCount)

  useEffect(() => {
    if (token) {
      fetchMe()
      fetchWishlist()
      fetchSavedOutfitCount()
    }
  }, [token])

  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Routes>
          {/* User routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/san-pham" element={<ProductsPage />} />
            <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
            <Route path="/gio-hang" element={<CartPage />} />
            <Route path="/yeu-thich" element={<WishlistPage />} />
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route path="/dang-ky" element={<RegisterPage />} />
            <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
            <Route path="/thanh-toan" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/don-hang" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/don-hang/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/tai-khoan" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="san-pham" element={<ProductMgmtPage />} />
            <Route path="danh-muc" element={<CategoryMgmtPage />} />
            <Route path="don-hang" element={<OrderMgmtPage />} />
            <Route path="nguoi-dung" element={<UserMgmtPage />} />
            <Route path="danh-gia" element={<ReviewMgmtPage />} />
            <Route path="banner" element={<BannerMgmtPage />} />
            <Route path="outfit" element={<OutfitMgmtPage />} />
            <Route path="ma-giam-gia" element={<CouponMgmtPage />} />
            <Route path="cai-dat" element={<SettingPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
