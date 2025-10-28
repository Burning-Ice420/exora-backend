const mongoose = require('mongoose');

const audioAnalysisSchema = new mongoose.Schema({
  userData: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  questions: [{
    type: String,
    required: true
  }],
  analysis: {
    transcription: {
      type: String,
      default: ""
    },
    analysis: {
      overallScore: {
        type: Number,
        default: 0
      },
      confidenceLevel: {
        type: String,
        default: "Unknown"
      },
      travelPersonality: [{
        trait: { type: String, default: "" },
        percentage: { type: Number, default: 0 },
        reason: { type: String, default: "" }
      }],
      preferences: [{
        preference: { type: String, default: "" },
        choice: { type: String, default: "" },
        percentage: { type: Number, default: 0 },
        reason: { type: String, default: "" },
        priority: { type: String, default: "Medium" }
      }],
      spendingHabits: {
        cafeBudget: { type: String, default: "Unknown" },
        percentage: { type: Number, default: 0 },
        reason: { type: String, default: "" }
      },
      goaExperience: {
        score: { type: Number, default: 0 },
        level: { type: String, default: "Unknown" },
        reason: { type: String, default: "" }
      }
    },
    insights: {
      whyUseful: { type: String, default: "" },
      benefits: { type: [String], default: [] },
      opportunities: { type: [String], default: [] },
      recommendations: [{
        category: { type: String, default: "" },
        items: { type: [String], default: [] }
      }]
    }
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing'
  },
  processingTime: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
audioAnalysisSchema.index({ 'userData.email': 1, 'createdAt': -1 });
audioAnalysisSchema.index({ status: 1 });

module.exports = mongoose.model('AudioAnalysis', audioAnalysisSchema);
