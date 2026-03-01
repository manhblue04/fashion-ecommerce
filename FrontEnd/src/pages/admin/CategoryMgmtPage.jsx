import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, Switch, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function CategoryMgmtPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()

  const fetch = () => { setLoading(true); adminApi.getCategories().then((r) => setCategories(r.categories)).finally(() => setLoading(false)) }
  useEffect(fetch, [])

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (r) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true) }

  const handleDelete = async (id) => {
    try { await adminApi.deleteCategory(id); message.success('Đã xóa'); fetch() } catch (e) { message.error(e.message) }
  }

  const handleSubmit = async () => {
    const values = await form.validateFields()
    if (editing) { await adminApi.updateCategory(editing._id, values); message.success('Cập nhật thành công') }
    else { await adminApi.createCategory(values); message.success('Tạo thành công') }
    setModalOpen(false); fetch()
  }

  const columns = [
    { title: 'Tên', dataIndex: 'name' },
    { title: 'Slug', dataIndex: 'slug' },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (v) => v ? 'Hiển thị' : 'Ẩn' },
    { title: '', width: 100, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Xóa danh mục?" onConfirm={() => handleDelete(r._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý danh mục</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm danh mục</Button>
      </div>
      <Table columns={columns} dataSource={categories} rowKey="_id" loading={loading} pagination={false} />
      <Modal title={editing ? 'Sửa danh mục' : 'Thêm danh mục'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Nhập tên' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
