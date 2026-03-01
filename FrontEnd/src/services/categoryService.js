import api from './api'

export const getCategories = () => api.get('/categories')
export const getCategory = (slug) => api.get(`/categories/${slug}`)
