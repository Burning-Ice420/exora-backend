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
  startCoordinates: {
    type: [Number], // [latitude, longitude]
    validate: {
      validator: function(v) {
        return !v || (Array.isArray(v) && v.length === 2 && 
          typeof v[0] === 'number' && typeof v[1] === 'number' &&
          v[0] >= -90 && v[0] <= 90 && // latitude range
          v[1] >= -180 && v[1] <= 180); // longitude range
      },
      message: 'startCoordinates must be an array of [latitude, longitude] with valid ranges'
    }
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
  // Attendance tracking for host
  attendance: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'showed_up', 'no_show'],
      default: 'pending'
    },
    markedAt: {
      type: Date
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Track if spells were awarded for hosting (prevent double counting)
  spellsAwardedForHost: {
    type: Boolean,
    default: false
  },
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
// Geospatial index for startCoordinates (sparse index - only indexes documents with startCoordinates)
tripSchema.index({ startCoordinates: '2dsphere' }, { sparse: true });

module.exports = mongoose.model('Trip', tripSchema);
