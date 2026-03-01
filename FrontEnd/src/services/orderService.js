import api from './api'

export const createOrder = (data) => api.post('/orders', data)
export const getMyOrders = (params) => api.get('/orders/my-orders', { params })
export const getOrderDetail = (id) => api.get(`/orders/${id}`)
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`)
export const validateCoupon = (data) => api.post('/coupons/validate', data)
