const mongoose = require('mongoose')

const orderLogSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  },
  status: {
    type: String,
    required: true,
  },
  note: { type: String, default: '' },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('OrderLog', orderLogSchema)
