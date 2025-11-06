const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'completed', 'cancelled'],
    default: 'planning'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  itinerary: [{
    id: String,
    day: String,
    timeSlot: String, // Keep for backward compatibility
    startTime: Number, // Hour in 24-hour format (e.g., 9.5 for 9:30 AM)
    endTime: Number, // Hour in 24-hour format
    experienceId: String,
    experienceName: String,
    price: Number,
    duration: String,
    category: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  membersInvolved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  itineraryParticipants: [{
    itineraryId: String, // The id of the itinerary item
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  media: [{
    url: String,
    type: String, // 'image', 'video'
    caption: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
tripSchema.index({ createdBy: 1, status: 1 });
tripSchema.index({ destination: 1 });
tripSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
