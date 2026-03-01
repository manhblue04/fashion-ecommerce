import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Switch, Button, Card, message, Spin } from 'antd'
import * as adminApi from '../../services/adminService'

export default function SettingPage() {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    adminApi.getSettings().then((r) => { form.setFieldsValue(r.settings) }).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = await form.validateFields()
      await adminApi.updateSettings(values)
      message.success('Lưu cài đặt thành công')
    } catch { /* empty */ } finally { setSaving(false) }
  }

  if (loading) return <Spin size="large" className="flex justify-center py-20" />

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Cài đặt cửa hàng</h1>
      <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
        <Card title="Thông tin chung" style={{ marginBottom: 16 }}>
          <Form.Item name="storeName" label="Tên cửa hàng"><Input /></Form.Item>
          <Form.Item name="tagline" label="Slogan"><Input /></Form.Item>
          <Form.Item name="contactEmail" label="Email liên hệ"><Input /></Form.Item>
          <Form.Item name="contactPhone" label="SĐT liên hệ"><Input /></Form.Item>
          <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
        </Card>

        <Card title="Vận chuyển & Thuế" style={{ marginBottom: 16 }}>
          <Form.Item name={['shipping', 'fee']} label="Phí vận chuyển (₫)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name={['shipping', 'freeShippingThreshold']} label="Miễn phí ship từ (₫)"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name={['tax', 'enabled']} label="Bật thuế" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['tax', 'percent']} label="Thuế (%)"><InputNumber style={{ width: '100%' }} min={0} max={100} /></Form.Item>
        </Card>

        <Card title="Phương thức thanh toán" style={{ marginBottom: 16 }}>
          <Form.Item name={['paymentMethods', 'cod']} label="COD" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['paymentMethods', 'momo']} label="MoMo" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item name={['paymentMethods', 'vnpay']} label="VNPay" valuePropName="checked"><Switch /></Form.Item>
        </Card>

        <Button type="primary" size="large" onClick={handleSave} loading={saving}>Lưu cài đặt</Button>
      </Form>
    </div>
  )
}
