const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const activityPassSchema = new mongoose.Schema({
  passId: {
    type: String,
    unique: true,
    default: () => uuidv4(),
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    required: true,
  },
  activityName: {
    type: String,
    required: true,
  },
  attendeeName: {
    type: String,
    required: true,
  },
  attendeeEmail: {
    type: String,
    required: true,
  },
  attendeePhone: {
    type: String,
    default: '',
  },
  paymentId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled'],
    default: 'active',
  },
  usedAt: {
    type: Date,
    default: null,
  },
  verifiedBy: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
activityPassSchema.index({ passId: 1 });
activityPassSchema.index({ activityId: 1 });
activityPassSchema.index({ attendeeEmail: 1 });
activityPassSchema.index({ paymentId: 1 });

module.exports = mongoose.model('ActivityPass', activityPassSchema);


