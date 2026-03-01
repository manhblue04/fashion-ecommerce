import api from './api'

const a = '/admin'

export const getDashboard = () => api.get(`${a}/dashboard`)

export const getProducts = (params) => api.get(`${a}/products`, { params })
export const createProduct = (data) => api.post(`${a}/products`, data)
export const updateProduct = (id, data) => api.put(`${a}/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`${a}/products/${id}`)

export const getCategories = () => api.get(`${a}/categories`)
export const createCategory = (data) => api.post(`${a}/categories`, data)
export const updateCategory = (id, data) => api.put(`${a}/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`${a}/categories/${id}`)

export const getOrders = (params) => api.get(`${a}/orders`, { params })
export const getOrderDetail = (id) => api.get(`${a}/orders/${id}`)
export const updateOrderStatus = (id, data) => api.put(`${a}/orders/${id}/status`, data)

export const getUsers = (params) => api.get(`${a}/users`, { params })
export const getUserDetail = (id) => api.get(`${a}/users/${id}`)
export const toggleBlockUser = (id) => api.put(`${a}/users/${id}/block`)
export const updateUserRole = (id, data) => api.put(`${a}/users/${id}/role`, data)

export const getReviews = (params) => api.get(`${a}/reviews`, { params })
export const deleteReview = (id) => api.delete(`${a}/reviews/${id}`)

export const getBanners = () => api.get(`${a}/banners`)
export const createBanner = (data) => api.post(`${a}/banners`, data)
export const updateBanner = (id, data) => api.put(`${a}/banners/${id}`, data)
export const deleteBanner = (id) => api.delete(`${a}/banners/${id}`)

export const getCoupons = () => api.get(`${a}/coupons`)
export const createCoupon = (data) => api.post(`${a}/coupons`, data)
export const updateCoupon = (id, data) => api.put(`${a}/coupons/${id}`, data)
export const deleteCoupon = (id) => api.delete(`${a}/coupons/${id}`)

export const getSettings = () => api.get(`${a}/settings`)
export const updateSettings = (data) => api.put(`${a}/settings`, data)
