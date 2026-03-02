const mongoose = require('mongoose')

const outfitItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    label: { type: String, default: '' },
    posX: { type: Number, required: true, min: 0, max: 100 },
    posY: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: true }
)

const outfitSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Tên outfit là bắt buộc'], trim: true },
    description: { type: String, default: '' },
    image: {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
    items: [outfitItemSchema],
    discountPercent: { type: Number, default: 10, min: 0, max: 100 },
    badge: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Outfit', outfitSchema)
