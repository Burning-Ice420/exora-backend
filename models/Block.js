const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  itineraryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary',
    required: false // Made optional for sub-blocks
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  radius: {
    type: Number,
    default: 5 // Default radius in kilometers
  },
  type: {
    type: String,
    enum: ['main_block', 'sub_block', 'Flight', 'Accommodation', 'Activity', 'Restaurant', 'Transport', 'Entertainment', 'Shopping', 'Wellness'],
    required: true
  },
  approved: {
    type: Boolean,
    default: true // false if waiting for approval
  },
  parentBlockId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block' // link sub-blocks to main block
  },
  membersInvolved: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  suggestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // who suggested this destination
  },
  
  // Enhanced Details for All Categories
  description: {
    type: String,
    maxlength: 1000
  },
  location: {
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    city: String,
    country: String,
    postalCode: String
  },
  timing: {
    startDate: Date,
    endDate: Date,
    startTime: String,
    endTime: String,
    duration: String, // e.g., "2 hours", "1 day"
    timezone: String
  },
  cost: {
    estimated: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    perPerson: Boolean,
    includes: [String], // e.g., ["meals", "transport", "entrance"]
    excludes: [String]
  },
  capacity: {
    minPeople: Number,
    maxPeople: Number,
    currentBookings: {
      type: Number,
      default: 0
    }
  },
  requirements: {
    ageRestriction: {
      min: Number,
      max: Number
    },
    physicalFitness: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging', 'Extreme']
    },
    equipment: [String],
    documents: [String], // e.g., ["passport", "visa", "insurance"]
    specialNeeds: [String]
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    bookingUrl: String
  },
  media: {
    images: [String], // URLs to images
    videos: [String], // URLs to videos
    virtualTour: String // URL to virtual tour
  },
  ratings: {
    overall: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    categories: {
      value: Number,
      service: Number,
      location: Number,
      cleanliness: Number,
      food: Number
    },
    totalReviews: {
      type: Number,
      default: 0
    }
  },
  tags: [String],
  isJoinable: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  
  // Category-Specific Details
  categoryDetails: {
    // Flight specific
    flight: {
      airline: String,
      flightNumber: String,
      departure: {
        airport: String,
        terminal: String,
        gate: String
      },
      arrival: {
        airport: String,
        terminal: String,
        gate: String
      },
      class: String, // Economy, Business, First
      baggage: {
        carryOn: String,
        checked: String
      }
    },
    
    // Accommodation specific
    accommodation: {
      hotelName: String,
      roomType: String,
      amenities: [String],
      checkIn: String,
      checkOut: String,
      policies: {
        cancellation: String,
        checkIn: String,
        checkOut: String
      },
      facilities: [String] // pool, gym, spa, etc.
    },
    
    // Activity specific
    activity: {
      activityType: String,
      difficulty: String,
      instructor: String,
      equipment: [String],
      groupSize: {
        min: Number,
        max: Number
      },
      weatherDependent: Boolean,
      indoor: Boolean
    },
    
    // Restaurant specific
    restaurant: {
      cuisine: [String],
      priceRange: String, // $, $$, $$$, $$$$
      dietaryOptions: [String], // vegetarian, vegan, gluten-free
      dressCode: String,
      reservations: {
        required: Boolean,
        phone: String,
        online: String
      },
      specialties: [String]
    },
    
    // Transport specific
    transport: {
      transportType: String, // taxi, bus, train, car rental
      vehicle: String,
      driver: String,
      pickup: {
        location: String,
        time: String
      },
      dropoff: {
        location: String,
        time: String
      }
    },
    
    // Entertainment specific
    entertainment: {
      venue: String,
      eventType: String,
      performers: [String],
      ageRestriction: String,
      dressCode: String,
      tickets: {
        available: Number,
        price: Number,
        purchaseUrl: String
      }
    },
    
    // Shopping specific
    shopping: {
      storeType: String,
      brands: [String],
      priceRange: String,
      specialties: [String],
      openingHours: String
    },
    
    // Wellness specific
    wellness: {
      serviceType: String, // spa, yoga, massage, gym
      therapist: String,
      duration: String,
      benefits: [String],
      requirements: [String]
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  details: {
    title: { type: String, required: true },
    description: { type: String },
    cost: { type: Number, default: 0 },
    location: { type: String },
    duration: { type: String },
    // Flight specific
    airline: { type: String },
    flightNumber: { type: String },
    // Accommodation specific
    hotelName: { type: String },
    checkIn: { type: String },
    checkOut: { type: String },
    // Activity specific
    activityType: { type: String },
    difficulty: { type: String }
  },
  isJoinable: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Block', blockSchema);
