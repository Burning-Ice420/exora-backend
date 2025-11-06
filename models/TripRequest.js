const mongoose = require('mongoose');

const tripRequestSchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: 500
  },
  selectedItineraries: [{
    itineraryId: String, // The id of the itinerary item from trip.itinerary array
    experienceName: String, // For display purposes
    day: String,
    startTime: Number,
    endTime: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
tripRequestSchema.index({ tripId: 1, requesterId: 1 });
tripRequestSchema.index({ tripOwnerId: 1, status: 1 });

// Prevent duplicate requests
tripRequestSchema.index({ tripId: 1, requesterId: 1 }, { unique: true });

module.exports = mongoose.model('TripRequest', tripRequestSchema);
