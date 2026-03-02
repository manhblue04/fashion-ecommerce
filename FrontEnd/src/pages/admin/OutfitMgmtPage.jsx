import { useState, useEffect, useRef } from 'react'
import { Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Select, Popconfirm, Tag, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, AimOutlined } from '@ant-design/icons'
import * as adminApi from '../../services/adminService'

export default function OutfitMgmtPage() {
  const [outfits, setOutfits] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form] = Form.useForm()
  const [items, setItems] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [pickingIdx, setPickingIdx] = useState(null)
  const imgRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const [oRes, pRes] = await Promise.all([adminApi.getOutfits(), adminApi.getProducts({ limit: 200 })])
      setOutfits(oRes.outfits)
      setProducts(pRes.products)
    } catch { /* empty */ } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    setItems([])
    setPreviewUrl('')
    setModalOpen(true)
  }

  const openEdit = (record) => {
    setEditing(record)
    form.setFieldsValue({ name: record.name, description: record.description, order: record.order, isActive: record.isActive, discountPercent: record.discountPercent, badge: record.badge })
    setItems(record.items.map((i) => ({
      product: i.product?._id || i.product,
      label: i.label,
      posX: i.posX,
      posY: i.posY,
    })))
    setPreviewUrl(record.image?.url || '')
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    await adminApi.deleteOutfit(id)
    message.success('Đã xóa outfit')
    fetchData()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)

      const payload = { ...values, items }
      if (previewUrl && !editing) {
        payload.image = previewUrl
      }

      if (editing) {
        await adminApi.updateOutfit(editing._id, payload)
        message.success('Cập nhật thành công')
      } else {
        await adminApi.createOutfit(payload)
        message.success('Tạo outfit thành công')
      }
      setModalOpen(false)
      fetchData()
    } catch { /* validation */ } finally { setSubmitting(false) }
  }

  const addItem = () => {
    setItems([...items, { product: '', label: '', posX: 50, posY: 50 }])
  }

  const updateItem = (idx, field, value) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: value }
    setItems(next)
  }

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx))
    if (pickingIdx === idx) setPickingIdx(null)
  }

  const handleImageClick = (e) => {
    if (pickingIdx === null) return
    const rect = imgRef.current.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    updateItem(pickingIdx, 'posX', Math.max(0, Math.min(100, x)))
    updateItem(pickingIdx, 'posY', Math.max(0, Math.min(100, y)))
    setPickingIdx(null)
  }

  const productOptions = products.map((p) => ({
    label: `${p.name} (${p.brand || 'N/A'})`,
    value: p._id,
  }))

  const getProductName = (pid) => {
    const p = products.find((pr) => pr._id === pid)
    return p?.name || pid
  }

  const columns = [
    {
      title: 'Ảnh', dataIndex: 'image', width: 80,
      render: (img) => img?.url ? <img src={img.url} alt="" style={{ width: 50, height: 65, objectFit: 'cover', borderRadius: 6 }} /> : '-',
    },
    { title: 'Tên', dataIndex: 'name', ellipsis: true },
    { title: 'Mô tả', dataIndex: 'description', ellipsis: true },
    {
      title: 'Items', dataIndex: 'items', width: 70,
      render: (items) => <Tag>{items?.length || 0}</Tag>,
    },
    { title: 'Giảm giá', dataIndex: 'discountPercent', width: 80, render: (v) => v > 0 ? <Tag color="gold">-{v}%</Tag> : '-' },
    { title: 'Thứ tự', dataIndex: 'order', width: 70 },
    {
      title: 'Hiển thị', dataIndex: 'isActive', width: 80,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? 'Có' : 'Không'}</Tag>,
    },
    {
      title: '', width: 100,
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
          <Popconfirm title="Xóa outfit này?" onConfirm={() => handleDelete(r._id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Quản lý Outfit</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Thêm outfit</Button>
      </div>

      <Table columns={columns} dataSource={outfits} rowKey="_id" loading={loading} pagination={false} />

      <Modal
        title={editing ? 'Sửa outfit' : 'Thêm outfit'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setPickingIdx(null) }}
        confirmLoading={submitting}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="name" label="Tên outfit" rules={[{ required: true, message: 'Nhập tên' }]}>
              <Input placeholder="VD: Street Smart" />
            </Form.Item>
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item name="order" label="Thứ tự" initialValue={0} style={{ flex: 1 }}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="isActive" label="Hiển thị" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </div>
          </div>
          <Form.Item name="description" label="Mô tả">
            <Input placeholder="VD: Urban Minimal – dành cho những ngày thành phố năng động" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <Form.Item name="discountPercent" label="Giảm giá cả set (%)" initialValue={10}>
              <InputNumber min={0} max={100} style={{ width: '100%' }} addonAfter="%" />
            </Form.Item>
            <Form.Item name="badge" label="Badge hiển thị">
              <Input placeholder="VD: Tiết kiệm 10% khi mua full set (để trống = tự sinh)" />
            </Form.Item>
          </div>

          {/* Image preview + position picker */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 500, display: 'block', marginBottom: 8 }}>
              Ảnh outfit {pickingIdx !== null && <Tag color="blue">Đang chọn vị trí cho item #{pickingIdx + 1} — click vào ảnh</Tag>}
            </label>

            {(previewUrl || editing?.image?.url) && (
              <div
                ref={imgRef}
                onClick={handleImageClick}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: 360,
                  aspectRatio: '3/4',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: pickingIdx !== null ? '3px solid #1677ff' : '1px solid #d9d9d9',
                  cursor: pickingIdx !== null ? 'crosshair' : 'default',
                  marginBottom: 8,
                }}
              >
                <img
                  src={previewUrl || editing?.image?.url}
                  alt="outfit"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      left: `${item.posX}%`,
                      top: `${item.posY}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: pickingIdx === idx ? '#1677ff' : '#fff',
                      border: `2px solid ${pickingIdx === idx ? '#1677ff' : '#333'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: pickingIdx === idx ? '#fff' : '#333',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      pointerEvents: 'none',
                    }}
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
            )}

            {!editing && (
              <Input
                placeholder="Nhập URL ảnh outfit (Unsplash hoặc link bất kỳ)"
                value={previewUrl}
                onChange={(e) => setPreviewUrl(e.target.value)}
              />
            )}
          </div>

          {/* Items */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontWeight: 500 }}>Sản phẩm trong outfit ({items.length})</label>
              <Button size="small" icon={<PlusOutlined />} onClick={addItem}>Thêm item</Button>
            </div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center', padding: 8, background: '#fafafa', borderRadius: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 12, width: 20, textAlign: 'center', color: '#666' }}>{idx + 1}</span>
                <Select
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn sản phẩm"
                  value={item.product || undefined}
                  onChange={(v) => {
                    updateItem(idx, 'product', v)
                    const p = products.find((pr) => pr._id === v)
                    if (p && !item.label) updateItem(idx, 'label', p.name)
                  }}
                  options={productOptions}
                  style={{ flex: 2 }}
                  size="small"
                />
                <Input
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => updateItem(idx, 'label', e.target.value)}
                  style={{ flex: 1 }}
                  size="small"
                />
                <InputNumber
                  min={0} max={100}
                  value={item.posX}
                  onChange={(v) => updateItem(idx, 'posX', v)}
                  style={{ width: 60 }}
                  size="small"
                  addonAfter="X"
                />
                <InputNumber
                  min={0} max={100}
                  value={item.posY}
                  onChange={(v) => updateItem(idx, 'posY', v)}
                  style={{ width: 60 }}
                  size="small"
                  addonAfter="Y"
                />
                <Button
                  size="small"
                  type={pickingIdx === idx ? 'primary' : 'default'}
                  icon={<AimOutlined />}
                  onClick={() => setPickingIdx(pickingIdx === idx ? null : idx)}
                  title="Click vào ảnh để chọn vị trí"
                />
                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeItem(idx)} />
              </div>
            ))}

            {items.length === 0 && (
              <div style={{ textAlign: 'center', padding: 16, color: '#999', background: '#fafafa', borderRadius: 6 }}>
                Chưa có sản phẩm nào. Nhấn "Thêm item" để bắt đầu.
              </div>
            )}
          </div>
        </Form>
      </Modal>
    </div>
  )
}
