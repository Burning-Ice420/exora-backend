const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true,
  },
  description: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
    default: '',
  },
  images: [{
    url: String,
    alt: String,
    order: Number,
  }],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    default: '2 hours',
  },
  location: {
    name: String,
    address: String,
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  category: {
    type: String,
    enum: ['Adventure', 'Food', 'Culture', 'Wellness', 'Entertainment', 'Nature', 'Sports'],
    required: true,
  },
  tags: [String],
  highlights: [String],
  includes: [String],
  excludes: [String],
  requirements: {
    minAge: Number,
    maxAge: Number,
    physicalFitness: String,
    specialRequirements: [String],
  },
  capacity: {
    type: Number,
    default: null,
  },
  booked: {
    type: Number,
    default: 0,
  },
  host: {
    name: String,
    bio: String,
    image: String,
  },
  status: {
    type: String,
    enum: ['active', 'sold_out', 'cancelled', 'upcoming'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Generate slug from name
activitySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
activitySchema.index({ slug: 1 });
activitySchema.index({ status: 1, date: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ featured: 1 });

module.exports = mongoose.model('Activity', activitySchema);

