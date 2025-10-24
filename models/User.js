const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 150,
    trim: true
  },
  age: {
    type: Number,
    min: 18,
    max: 100
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
  },
  profilePicUrl: {
    type: String,
    default: ''
  },
  profileImage: {
    url: String,
    publicId: String,
    secureUrl: String,
    width: Number,
    height: Number,
    format: String,
    size: Number
  },
  location: {
    type: String,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  // Travel preferences from signup
  travelPreferences: [{
    type: String,
    enum: ['adventure', 'beach', 'culture', 'food', 'nightlife', 'nature', 'photography', 'wellness'],
    trim: true
  }],
  // Personality type from signup
  personalityType: {
    type: String,
    enum: ['explorer', 'planner', 'spontaneous', 'social', 'solo', 'group'],
    default: 'explorer'
  },
  // Profile photos
  photos: [{
    url: {
      type: String,
      required: true
    },
    isMain: {
      type: Boolean,
      default: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  budgetPreference: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 10000 }
  },
  isMapPublic: {
    type: Boolean,
    default: true
  },
  travel_type: {
    type: String,
    enum: ["solo_traveler", "couple", "family"],
    default: "solo_traveler"
  },
  family_members: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending"
    },
    relation: {
      type: String,
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for location search
userSchema.index({ location: 'text' });

module.exports = mongoose.model('User', userSchema);
