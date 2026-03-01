import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, DatePicker, Popconfirm, Tag, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import * as adminApi from '../../services/adminService'

export default function CouponMgmtPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const fetch = () => { setLoading(true); adminApi.getCoupons().then((r) => setCoupons(r.coupons)).finally(() => setLoading(false)) }
  useEffect(fetch, [])

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); form.setFieldsValue({ ...r, expiresAt: dayjs(r.expiresAt) }); setModalOpen(true) }

  const handleDelete = async (id) => { await adminApi.deleteCoupon(id); message.success('Đã xóa'); fetch() }
  const handleSubmit = async () => {
    const values = await form.validateFields()
    values.expiresAt = values.expiresAt.toISOString()
    if (editing) { await adminApi.updateCoupon(editing._id, values); message.success('Cập nhật thành công') }
    else { await adminApi.createCoupon(values); message.success('Tạo thành công') }
    setModalOpen(false); fetch()
  }

  const columns = [
    { title: 'Mã', dataIndex: 'code', render: (v) => <Tag color="blue">{v}</Tag> },
    { title: 'Loại', dataIndex: 'discountType', render: (v) => v === 'percent' ? 'Phần trăm' : 'Cố định' },
    { title: 'Giá trị', dataIndex: 'value', render: (v, r) => r.discountType === 'percent' ? `${v}%` : `${v?.toLocaleString('vi-VN')}₫` },
    { title: 'Đã dùng', render: (_, r) => `${r.usedCount}/${r.usageLimit || '∞'}` },
    { title: 'Hết hạn', dataIndex: 'expiresAt', render: (d) => new Date(d).toLocaleDateString('vi-VN') },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Hoạt động' : 'Tắt'}</Tag> },
    { title: '', width: 100, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Xóa mã?" onConfirm={() => handleDelete(r._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý mã giảm giá</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm mã</Button>
      </div>
      <Table columns={columns} dataSource={coupons} rowKey="_id" loading={loading} pagination={false} />
      <Modal title={editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã" rules={[{ required: true }]}><Input /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="discountType" label="Loại giảm" rules={[{ required: true }]}>
              <Select options={[{ label: 'Phần trăm', value: 'percent' }, { label: 'Cố định', value: 'fixed' }]} />
            </Form.Item>
            <Form.Item name="value" label="Giá trị" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="minOrderValue" label="Đơn tối thiểu"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
            <Form.Item name="maxDiscount" label="Giảm tối đa"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="expiresAt" label="Ngày hết hạn" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="usageLimit" label="Giới hạn sử dụng"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          </div>
          <Form.Item name="isActive" label="Hoạt động" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
