import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HiOutlineExclamationCircle, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

const ERROR_HINTS = {
  'Email hoặc mật khẩu không đúng': { field: 'both', hint: null },
  'Vui lòng xác thực email trước khi đăng nhập': {
    field: 'email',
    hint: 'Kiểm tra hộp thư và nhấn vào link xác thực chúng tôi đã gửi.',
  },
  'Tài khoản đã bị khóa': {
    field: 'both',
    hint: 'Liên hệ hỗ trợ để được mở khóa tài khoản.',
  },
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, googleLogin, loading } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const errInfo = ERROR_HINTS[error] || { field: 'both', hint: null }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const result = await login(form, true)
    if (result?.user) {
      navigate(result.user.role === 'admin' ? '/admin' : from, { replace: true })
    } else if (result?.error) {
      setError(result.error)
    }
  }

  const handleGoogleResponse = useCallback(async (response) => {
    const user = await googleLogin(response.credential)
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    }
  }, [googleLogin, navigate, from])

  const handleGoogleClick = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId || !window.google) return
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleResponse,
    })
    window.google.accounts.id.prompt()
  }, [handleGoogleResponse])

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const inputClass = (field) => {
    const hasErr = error && (errInfo.field === 'both' || errInfo.field === field)
    return `w-full px-4 py-3 border rounded-lg text-sm focus:outline-none transition ${
      hasErr
        ? 'border-red-400 bg-red-50 focus:border-red-500'
        : 'border-gray-200 focus:border-amber-500'
    }`
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>
          <p className="text-gray-500 mt-2">Chào mừng bạn trở lại</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex gap-2.5 items-start bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
            <HiOutlineExclamationCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-700">{error}</p>
              {errInfo.hint && <p className="text-xs text-red-500 mt-0.5">{errInfo.hint}</p>}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              required
              placeholder="your@email.com"
              className={inputClass('email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange('password')}
                required
                placeholder="••••••••"
                className={`${inputClass('password')} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/quen-mat-khau" className="text-sm text-amber-600 hover:text-amber-700">Quên mật khẩu?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-gray-400">hoặc</span></div>
        </div>

        {googleClientId ? (
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Đăng nhập với Google
          </button>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-gray-400">Đăng nhập bằng Google chưa được cấu hình</p>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="text-amber-600 font-medium hover:text-amber-700">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  )
}
