const mongoose = require('mongoose');

const pendingActivityRegistrationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
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
  attendeeCollege: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Indexes
pendingActivityRegistrationSchema.index({ activityId: 1, attendeeEmail: 1 });
pendingActivityRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Auto-delete after 24 hours

module.exports = mongoose.model('PendingActivityRegistration', pendingActivityRegistrationSchema);

