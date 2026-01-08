const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
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
  // Exora Spells - Reputation system
  exoraSpells: {
    type: Number,
    default: 0,
    min: 0
  },
  // Profile completion tracking
  profileCompletion: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Track which profile stages have been completed
  profileStagesCompleted: {
    stage1: { type: Boolean, default: false }, // Basic info (name, email, password)
    stage2: { type: Boolean, default: false }, // Profile details (bio, age, location)
    stage3: { type: Boolean, default: false }, // Photos
    stage4: { type: Boolean, default: false }, // Travel preferences & personality
    stage5: { type: Boolean, default: false }, // Interests & verification
  },
  // Email verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Phone verification
  phoneVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for location search
userSchema.index({ location: 'text' });

// Method to calculate profile completion percentage
userSchema.methods.calculateProfileCompletion = function() {
  const fields = {
    name: !!this.name,
    email: !!this.email,
    bio: !!this.bio && this.bio.trim().length > 0,
    age: !!this.age,
    location: !!this.location && this.location.trim().length > 0,
    profileImage: !!(this.profileImage?.secureUrl || this.profileImage?.url || this.profilePicUrl),
    photos: !!(this.photos && this.photos.length > 0),
    travelPreferences: !!(this.travelPreferences && this.travelPreferences.length > 0),
    personalityType: !!this.personalityType,
    interests: !!(this.interests && this.interests.length > 0),
    emailVerified: this.emailVerified || false,
  };

  const totalFields = Object.keys(fields).length;
  const completedFields = Object.values(fields).filter(Boolean).length;
  
  return Math.round((completedFields / totalFields) * 100);
};

// Method to get user initials for privacy
userSchema.methods.getInitials = function() {
  if (!this.name) return 'U';
  const parts = this.name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

module.exports = mongoose.model('User', userSchema);
