import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function BannerMgmtPage() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const fetch = () => { setLoading(true); adminApi.getBanners().then((r) => setBanners(r.banners)).finally(() => setLoading(false)) }
  useEffect(fetch, [])

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); form.setFieldsValue({ ...r, type: r.type }); setModalOpen(true) }

  const handleDelete = async (id) => { await adminApi.deleteBanner(id); message.success('Đã xóa'); fetch() }
  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) { await adminApi.updateBanner(editing._id, values); message.success('Cập nhật thành công') }
    else { await adminApi.createBanner(values); message.success('Tạo thành công') }
    setModalOpen(false); fetch()
  }

  const columns = [
    { title: 'Ảnh', dataIndex: 'image', width: 80, render: (img) => img?.url ? <img src={img.url} alt="" style={{ width: 60, height: 35, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Loại', dataIndex: 'type' },
    { title: 'Thứ tự', dataIndex: 'order' },
    { title: 'Hiển thị', dataIndex: 'isActive', render: (v) => v ? 'Có' : 'Không' },
    { title: '', width: 100, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Xóa banner?" onConfirm={() => handleDelete(r._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý banner</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm banner</Button>
      </div>
      <Table columns={columns} dataSource={banners} rowKey="_id" loading={loading} pagination={false} />
      <Modal title={editing ? 'Sửa banner' : 'Thêm banner'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subtitle" label="Phụ đề"><Input /></Form.Item>
          <Form.Item name="link" label="Liên kết"><Input /></Form.Item>
          <Form.Item name="type" label="Loại" initialValue="home">
            <Select options={[{ label: 'Trang chủ', value: 'home' }, { label: 'Khuyến mãi', value: 'promotion' }, { label: 'Danh mục', value: 'category' }]} />
          </Form.Item>
          <Form.Item name="order" label="Thứ tự" initialValue={0}><InputNumber min={0} /></Form.Item>
          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
