export const ORDER_STATUS = {
  pending: { label: 'Chờ xác nhận', color: 'orange' },
  processing: { label: 'Đang xử lý', color: 'blue' },
  shipping: { label: 'Đang giao hàng', color: 'cyan' },
  delivered: { label: 'Đã giao hàng', color: 'green' },
  cancelled: { label: 'Đã hủy', color: 'red' },
}

export const PAYMENT_STATUS = {
  pending: { label: 'Chưa thanh toán', color: 'orange' },
  paid: { label: 'Đã thanh toán', color: 'green' },
  failed: { label: 'Thanh toán thất bại', color: 'red' },
}

export const PAYMENT_METHOD = {
  COD: 'Thanh toán khi nhận hàng',
  MOMO: 'Ví MoMo',
  VNPAY: 'VNPay',
}
