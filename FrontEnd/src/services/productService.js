import api from './api'

export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (slug) => api.get(`/products/${slug}`)
export const getFeaturedProducts = () => api.get('/products/featured')
export const getNewArrivals = () => api.get('/products/new-arrivals')
export const getBestSellers = () => api.get('/products/best-sellers')
export const getSaleProducts = () => api.get('/products/sale')
export const searchSuggestions = (keyword) => api.get('/products/search-suggestions', { params: { keyword } })
