const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block'
  }],
  departureDate: {
    type: Date,
    required: true
  },
  arrivalDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
