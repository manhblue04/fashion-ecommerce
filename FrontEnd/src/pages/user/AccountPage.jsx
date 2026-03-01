import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function AccountPage() {
  const { user, updateProfile, updateAvatar, loading } = useAuthStore()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const [addressForm, setAddressForm] = useState({ fullName: '', phone: '', addressLine: '', city: '', district: '', ward: '', isDefault: false })
  const [showAddressForm, setShowAddressForm] = useState(false)

  const handleUpdateProfile = (e) => {
    e.preventDefault()
    updateProfile({ name, phone })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('Ảnh tối đa 2MB')
    const reader = new FileReader()
    reader.onload = () => updateAvatar(reader.result)
    reader.readAsDataURL(file)
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/address', addressForm)
      toast.success('Thêm địa chỉ thành công')
      setShowAddressForm(false)
      setAddressForm({ fullName: '', phone: '', addressLine: '', city: '', district: '', ward: '', isDefault: false })
      useAuthStore.getState().fetchMe()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Xóa địa chỉ này?')) return
    try {
      await api.delete(`/auth/address/${addrId}`)
      toast.success('Đã xóa')
      useAuthStore.getState().fetchMe()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tài khoản của tôi</h1>

      <div className="space-y-8">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-700 text-2xl font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center cursor-pointer">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.name || 'Chưa cập nhật'}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Profile */}
        <form onSubmit={handleUpdateProfile} className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">Thông tin cá nhân</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="mt-4 px-6 py-2.5 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition disabled:opacity-50">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>

        {/* Addresses */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Địa chỉ</h2>
            <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Thêm địa chỉ
            </button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <input value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} placeholder="Họ tên" required className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500" />
              <input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="SĐT" required className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500" />
              <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="Tỉnh/Thành" required className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500" />
              <input value={addressForm.district} onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })} placeholder="Quận/Huyện" required className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500" />
              <input value={addressForm.ward} onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })} placeholder="Phường/Xã" required className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500" />
              <input value={addressForm.addressLine} onChange={(e) => setAddressForm({ ...addressForm, addressLine: e.target.value })} placeholder="Địa chỉ chi tiết" required className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-amber-500" />
              <div className="sm:col-span-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="accent-amber-500" /> Đặt làm mặc định</label>
                <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800 transition">Thêm</button>
              </div>
            </form>
          )}

          {user?.addresses?.length > 0 ? (
            <div className="space-y-3">
              {user.addresses.map((addr) => (
                <div key={addr._id} className="flex items-start justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">{addr.fullName} - {addr.phone} {addr.isDefault && <span className="text-amber-600 text-xs">(Mặc định)</span>}</p>
                    <p className="text-gray-500">{addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}</p>
                  </div>
                  <button onClick={() => handleDeleteAddress(addr._id)} className="text-xs text-red-500 hover:text-red-600 shrink-0">Xóa</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có địa chỉ nào</p>
          )}
        </div>
      </div>
    </div>
  )
}
