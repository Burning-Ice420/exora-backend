const mongoose = require('mongoose');

const waitlisterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notified: {
    type: Boolean,
    default: false
  },
  notifiedAt: {
    type: Date
  }
});

// Index for faster queries
waitlisterSchema.index({ email: 1 });
waitlisterSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Waitlister', waitlisterSchema);

