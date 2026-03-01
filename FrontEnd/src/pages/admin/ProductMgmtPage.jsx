import { useState, useEffect } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, Switch, Upload, Tag, Popconfirm, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function ProductMgmtPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const [imageList, setImageList] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = async (p = 1) => {
    setLoading(true)
    try {
      const [prodRes, catRes] = await Promise.all([adminApi.getProducts({ page: p, limit: 15 }), adminApi.getCategories()])
      setProducts(prodRes.products)
      setTotal(prodRes.total)
      setCategories(catRes.categories)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchProducts(page) }, [page])

  const openCreate = () => { setEditing(null); form.resetFields(); setImageList([]); setModalOpen(true) }
  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({ ...record, category: record.category?._id || record.category })
    setImageList(record.images?.map((img, i) => ({ uid: i, url: img.url, public_id: img.public_id, status: 'done' })) || [])
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    await adminApi.deleteProduct(id)
    message.success('Đã xóa sản phẩm')
    fetchProducts(page)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const newBase64 = []
      for (const file of imageList) {
        if (file.originFileObj) {
          const b64 = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(file.originFileObj)
          })
          newBase64.push(b64)
        }
      }

      if (editing) {
        const existingPublicIds = imageList.filter((f) => f.public_id).map((f) => f.public_id)
        const removeImages = editing.images?.filter((img) => !existingPublicIds.includes(img.public_id)).map((img) => img.public_id) || []
        await adminApi.updateProduct(editing._id, { ...values, newImages: newBase64, removeImages })
        message.success('Cập nhật thành công')
      } else {
        await adminApi.createProduct({ ...values, images: newBase64 })
        message.success('Tạo sản phẩm thành công')
      }

      setModalOpen(false)
      fetchProducts(page)
    } catch { /* validation */ } finally { setSubmitting(false) }
  }

  const columns = [
    { title: 'Ảnh', dataIndex: 'images', width: 60, render: (imgs) => imgs?.[0]?.url ? <img src={imgs[0].url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '-' },
    { title: 'Tên', dataIndex: 'name', ellipsis: true },
    { title: 'Giá', dataIndex: 'price', render: (v) => `${v?.toLocaleString('vi-VN')}₫`, sorter: true },
    { title: 'Giảm', dataIndex: 'discountPrice', render: (v) => v > 0 ? `${v?.toLocaleString('vi-VN')}₫` : '-' },
    { title: 'Kho', dataIndex: 'stock', width: 70 },
    { title: 'Bán', dataIndex: 'sold', width: 70 },
    { title: 'Danh mục', dataIndex: 'category', render: (c) => c?.name || '-' },
    { title: 'Giới tính', dataIndex: 'gender', width: 80, render: (v) => ({ men: 'Nam', women: 'Nữ', unisex: 'Unisex' }[v] || '-') },
    { title: 'Nổi bật', dataIndex: 'isFeatured', width: 80, render: (v) => v ? <Tag color="gold">Có</Tag> : '-' },
    { title: 'Trạng thái', dataIndex: 'isActive', width: 90, render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Hiển thị' : 'Ẩn'}</Tag> },
    {
      title: '', width: 100,
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(record)} />
          <Popconfirm title="Xóa sản phẩm này?" onConfirm={() => handleDelete(record._id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý sản phẩm</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm sản phẩm</Button>
      </div>

      <Table columns={columns} dataSource={products} rowKey="_id" loading={loading} pagination={{ current: page, total, pageSize: 15, onChange: setPage }} size="small" scroll={{ x: 900 }} />

      <Modal title={editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} confirmLoading={submitting} width={600} okText="Lưu" cancelText="Hủy">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Nhập tên sản phẩm' }]}>
            <Input />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Nhập giá' }]}>
              <InputNumber style={{ width: '100%' }} min={0} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="discountPrice" label="Giá giảm"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
            <Form.Item name="stock" label="Tồn kho" rules={[{ required: true, message: 'Nhập số lượng' }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </div>
          <Form.Item name="category" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
            <Select options={categories.map((c) => ({ label: c.name, value: c._id }))} placeholder="Chọn danh mục" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="brand" label="Thương hiệu"><Input placeholder="VD: Zara, H&M, Gucci" /></Form.Item>
            <Form.Item name="material" label="Chất liệu"><Input placeholder="VD: Cotton, Linen, Silk" /></Form.Item>
          </div>
          <Form.Item name="gender" label="Giới tính" initialValue="unisex">
            <Select options={[{ label: 'Nam', value: 'men' }, { label: 'Nữ', value: 'women' }, { label: 'Unisex', value: 'unisex' }]} />
          </Form.Item>
          <Form.Item name="sizes" label="Kích thước">
            <Select mode="tags" placeholder="Nhập size (VD: S, M, L, XL)" tokenSeparators={[',']}
              options={['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'].map((s) => ({ label: s, value: s }))} />
          </Form.Item>
          <Form.Item name="colors" label="Màu sắc">
            <Select mode="tags" placeholder="Nhập màu (VD: Đen, Trắng, Beige)" tokenSeparators={[',']}
              options={['Đen', 'Trắng', 'Beige', 'Xám', 'Nâu', 'Xanh navy', 'Đỏ', 'Hồng'].map((c) => ({ label: c, value: c }))} />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
          </div>
          <Form.Item label="Hình ảnh">
            <Upload listType="picture-card" fileList={imageList} onChange={({ fileList }) => setImageList(fileList)} beforeUpload={() => false} accept="image/*">
              {imageList.length < 5 && <div><UploadOutlined /><div style={{ marginTop: 8 }}>Tải ảnh</div></div>}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
