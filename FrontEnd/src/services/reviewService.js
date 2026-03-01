import api from './api'

export const getProductReviews = (productId, params) => api.get(`/reviews/product/${productId}`, { params })
export const createReview = (data) => api.post('/reviews', data)
