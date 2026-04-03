const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      senderType: { type: String, enum: ['user', 'admin', 'ai'] },
      createdAt: { type: Date },
    },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByUser: { type: Number, default: 0 },
    isAIEnabled: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'processing', 'done'], default: 'pending' },
  },
  { timestamps: true }
)

conversationSchema.index({ updatedAt: -1 })

module.exports = mongoose.model('Conversation', conversationSchema)
