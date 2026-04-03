const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    senderType: { type: String, enum: ['user', 'admin', 'ai'], required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    readAt: { type: Date },
  },
  { timestamps: true }
)

messageSchema.index({ conversation: 1, createdAt: 1 })

module.exports = mongoose.model('Message', messageSchema)
