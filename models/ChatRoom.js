const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  tripOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  firebaseRoomId: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatRoomSchema.index({ tripId: 1 });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ firebaseRoomId: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
