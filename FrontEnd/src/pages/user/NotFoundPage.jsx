import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold text-gray-200">404</h1>
      <h2 className="text-2xl font-bold text-gray-800 mt-4">Trang không tồn tại</h2>
      <p className="text-gray-500 mt-2">Trang bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
      <Link to="/" className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
        Về trang chủ
      </Link>
    </div>
  )
}
