const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  connectedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
connectionSchema.index({ userId: 1, connectedUserId: 1 });
connectionSchema.index({ connectedUserId: 1, status: 1 });

// Prevent duplicate connections
connectionSchema.index({ userId: 1, connectedUserId: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
