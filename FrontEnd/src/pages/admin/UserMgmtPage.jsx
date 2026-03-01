import { useState, useEffect } from 'react'
import { Table, Button, Tag, Select, Popconfirm, message } from 'antd'
import { LockOutlined, UnlockOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function UserMgmtPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetch = (p = 1) => { setLoading(true); adminApi.getUsers({ page: p, limit: 20 }).then((r) => { setUsers(r.users); setTotal(r.total) }).finally(() => setLoading(false)) }
  useEffect(() => { fetch(page) }, [page])

  const handleToggleBlock = async (id) => {
    const res = await adminApi.toggleBlockUser(id)
    message.success(res.message)
    fetch(page)
  }

  const handleRoleChange = async (id, role) => {
    await adminApi.updateUserRole(id, { role })
    message.success('Cập nhật quyền thành công')
    fetch(page)
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name', render: (v) => v || '-' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'SĐT', dataIndex: 'phone', render: (v) => v || '-' },
    { title: 'Quyền', dataIndex: 'role', render: (role, r) => (
      <Select value={role} size="small" style={{ width: 100 }} onChange={(v) => handleRoleChange(r._id, v)}
        options={[{ label: 'User', value: 'user' }, { label: 'Admin', value: 'admin' }]} />
    )},
    { title: 'Xác thực', dataIndex: 'isVerified', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Đã xác thực' : 'Chưa'}</Tag> },
    { title: 'Trạng thái', dataIndex: 'isBlocked', render: (v) => <Tag color={v ? 'red' : 'green'}>{v ? 'Bị khóa' : 'Hoạt động'}</Tag> },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    { title: '', width: 80, render: (_, r) => (
      <Popconfirm title={r.isBlocked ? 'Mở khóa tài khoản?' : 'Khóa tài khoản?'} onConfirm={() => handleToggleBlock(r._id)}>
        <Button icon={r.isBlocked ? <UnlockOutlined /> : <LockOutlined />} size="small" danger={!r.isBlocked} />
      </Popconfirm>
    )},
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Quản lý người dùng</h1>
      <Table columns={columns} dataSource={users} rowKey="_id" loading={loading} pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="small" scroll={{ x: 800 }} />
    </div>
  )
}
