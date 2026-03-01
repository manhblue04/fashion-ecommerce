import { useState, useEffect } from 'react'
import { Table, Tag, Select, Button, Modal, Descriptions, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from '../../utils/constants'

const NEXT_STATUS = { pending: 'processing', processing: 'shipping', shipping: 'delivered' }

export default function OrderMgmtPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('')
  const [detail, setDetail] = useState(null)

  const fetch = async (p = 1) => {
    setLoading(true)
    const params = { page: p, limit: 15 }
    if (filter) params.status = filter
    adminApi.getOrders(params).then((r) => { setOrders(r.orders); setTotal(r.total) }).finally(() => setLoading(false))
  }

  useEffect(() => { fetch(page) }, [page, filter])

  const handleStatusChange = async (id, status) => {
    try { await adminApi.updateOrderStatus(id, { status }); message.success('Cập nhật thành công'); fetch(page) } catch (e) { message.error(e.message) }
  }

  const columns = [
    { title: 'Mã', dataIndex: '_id', width: 100, render: (id) => `#${id.slice(-6).toUpperCase()}` },
    { title: 'Khách hàng', dataIndex: 'user', render: (u) => u?.name || u?.email || '-' },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', render: (v) => `${v?.toLocaleString('vi-VN')}₫` },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', render: (v) => PAYMENT_METHOD[v] },
    { title: 'TT thanh toán', dataIndex: 'paymentStatus', render: (s) => <Tag color={PAYMENT_STATUS[s]?.color}>{PAYMENT_STATUS[s]?.label}</Tag> },
    { title: 'Trạng thái', dataIndex: 'orderStatus', render: (s) => <Tag color={ORDER_STATUS[s]?.color}>{ORDER_STATUS[s]?.label}</Tag> },
    { title: 'Ngày', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    {
      title: '', width: 150,
      render: (_, r) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button icon={<EyeOutlined />} size="small" onClick={async () => {
            const res = await adminApi.getOrderDetail(r._id)
            setDetail(res)
          }} />
          {NEXT_STATUS[r.orderStatus] && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(r._id, NEXT_STATUS[r.orderStatus])}>
              → {ORDER_STATUS[NEXT_STATUS[r.orderStatus]]?.label}
            </Button>
          )}
          {['pending', 'processing'].includes(r.orderStatus) && (
            <Button size="small" danger onClick={() => handleStatusChange(r._id, 'cancelled')}>Hủy</Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý đơn hàng</h1>
        <Select placeholder="Lọc trạng thái" allowClear style={{ width: 180 }} onChange={(v) => { setFilter(v || ''); setPage(1) }}
          options={Object.entries(ORDER_STATUS).map(([k, v]) => ({ label: v.label, value: k }))} />
      </div>
      <Table columns={columns} dataSource={orders} rowKey="_id" loading={loading} pagination={{ current: page, total, pageSize: 15, onChange: setPage }} size="small" scroll={{ x: 1000 }} />

      <Modal title="Chi tiết đơn hàng" open={!!detail} onCancel={() => setDetail(null)} footer={null} width={600}>
        {detail && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Khách hàng">{detail.order?.user?.name} ({detail.order?.user?.email})</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{detail.order?.shippingAddress?.fullName}, {detail.order?.shippingAddress?.addressLine}, {detail.order?.shippingAddress?.ward}, {detail.order?.shippingAddress?.district}, {detail.order?.shippingAddress?.city}</Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">{detail.order?.orderItems?.map((i, idx) => <div key={idx}>{i.name}{i.size ? ` (${i.size})` : ''}{i.color ? ` - ${i.color}` : ''} x{i.quantity} - {i.price?.toLocaleString('vi-VN')}₫</div>)}</Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">{detail.order?.totalPrice?.toLocaleString('vi-VN')}₫</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
