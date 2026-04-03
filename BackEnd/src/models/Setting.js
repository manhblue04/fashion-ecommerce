const mongoose = require('mongoose')

const settingSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Fashion Store' },
    tagline: { type: String, default: 'Thời trang cao cấp' },
    logo: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    currency: {
      code: { type: String, default: 'VND' },
      symbol: { type: String, default: '₫' },
    },
    tax: {
      enabled: { type: Boolean, default: false },
      percent: { type: Number, default: 0 },
    },
    shipping: {
      fee: { type: Number, default: 30000 },
      freeShippingThreshold: { type: Number, default: 500000 },
    },
    paymentMethods: {
      cod: { type: Boolean, default: true },
      momo: { type: Boolean, default: false },
      vnpay: { type: Boolean, default: false },
    },
    ai: {
      provider: { type: String, enum: ['openai', 'gemini'], default: 'openai' },
      apiKey: { type: String, default: '' },
      model: { type: String, default: 'gpt-4o-mini' },
      autoReply: { type: Boolean, default: false },
      systemPrompt: { type: String, default: '' },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Setting', settingSchema)
