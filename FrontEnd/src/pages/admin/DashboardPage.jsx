import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Spin } from 'antd'
import { ShoppingOutlined, DollarOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboard } from '../../services/adminService'
import { ORDER_STATUS } from '../../utils/constants'

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard().then((res) => setData(res)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spin size="large" className="flex justify-center py-20" />

  const chartData = MONTHS.map((m, idx) => {
    const found = data?.revenueByMonth?.find((r) => r._id === idx + 1)
    return { name: m, doanhThu: found?.revenue || 0, donHang: found?.count || 0 }
  })

  const orderColumns = [
    { title: 'Mã đơn', dataIndex: '_id', render: (id) => `#${id.slice(-6).toUpperCase()}` },
    { title: 'Khách hàng', dataIndex: 'user', render: (u) => u?.name || u?.email || '-' },
    { title: 'Tổng tiền', dataIndex: 'totalPrice', render: (v) => `${v?.toLocaleString('vi-VN')}₫` },
    { title: 'Trạng thái', dataIndex: 'orderStatus', render: (s) => <Tag color={ORDER_STATUS[s]?.color}>{ORDER_STATUS[s]?.label}</Tag> },
    { title: 'Ngày', dataIndex: 'createdAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
  ]

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Tổng quan</h1>

      <Row gutter={[16, 16]}>
        <Col xs={12} lg={6}>
          <Card><Statistic title="Tổng đơn hàng" value={data?.stats?.totalOrders || 0} prefix={<ShoppingCartOutlined />} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card><Statistic title="Doanh thu" value={data?.stats?.totalRevenue || 0} prefix={<DollarOutlined />} suffix="₫" formatter={(v) => v.toLocaleString('vi-VN')} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card><Statistic title="Sản phẩm" value={data?.stats?.totalProducts || 0} prefix={<ShoppingOutlined />} /></Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card><Statistic title="Người dùng" value={data?.stats?.totalUsers || 0} prefix={<UserOutlined />} /></Card>
        </Col>
      </Row>

      <Card title="Doanh thu theo tháng" style={{ marginTop: 24 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
            <Tooltip formatter={(v) => `${v.toLocaleString('vi-VN')}₫`} />
            <Bar dataKey="doanhThu" fill="#d4a574" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Đơn hàng gần đây" style={{ marginTop: 24 }}>
        <Table columns={orderColumns} dataSource={data?.recentOrders || []} rowKey="_id" pagination={false} size="small" />
      </Card>
    </div>
  )
}
