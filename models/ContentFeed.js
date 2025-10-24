const mongoose = require('mongoose');

const contentFeedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Post', 'Itinerary'],
    required: true
  },
  text: {
    type: String,
    maxlength: 500
  },
  mediaUrl: {
    type: String
  },
  images: [{
    url: String,
    publicId: String,
    secureUrl: String,
    width: Number,
    height: Number,
    format: String,
    size: Number
  }],
  itineraryRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Itinerary'
  },
  locationTag: {
    type: String
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      maxlength: 200
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ContentFeed', contentFeedSchema);
