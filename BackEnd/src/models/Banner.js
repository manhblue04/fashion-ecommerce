const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Tiêu đề banner là bắt buộc'] },
    subtitle: { type: String, default: '' },
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    link: { type: String, default: '' },
    type: {
      type: String,
      enum: ['home', 'promotion', 'category'],
      default: 'home',
      index: true,
    },
    order: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Banner', bannerSchema)
