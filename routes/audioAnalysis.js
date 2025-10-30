const express = require('express');
const router = express.Router();
const { upload, analyzeAudio, analyzeAudioWithJSON, analyzeProfileText, healthCheck } = require('../controllers/audioAnalysisController');
const { validateAudioAnalysisInput, validateAudioFile, audioAnalysisLimiter } = require('../middleware/audioValidation');

// Apply rate limiting to all audio analysis routes
router.use(audioAnalysisLimiter);

// Health check endpoint for audio analysis service
router.get('/health', healthCheck);

// Main audio analysis endpoint (returns PDF directly)
router.post('/analyze-audio', 
  upload.single('audio'),
  validateAudioFile,
  validateAudioAnalysisInput,
  analyzeAudio
);

// Alternative endpoint that returns JSON with PDF data
router.post('/analyze-audio-json', 
  upload.single('audio'),
  validateAudioFile,
  validateAudioAnalysisInput,
  analyzeAudioWithJSON
);

// New: Text-only analysis (no audio). Accepts JSON body and returns same shape
router.post('/analyze', analyzeProfileText);

// Test endpoint for development
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Audio analysis service is running',
    endpoints: {
      'POST /api/audio-analysis/analyze-audio': 'Analyze audio file and return PDF directly',
      'POST /api/audio-analysis/analyze-audio-json': 'Analyze audio file and return JSON with PDF data',
      'POST /api/audio-analysis/analyze': 'Analyze structured JSON (no audio) and return same JSON format',
      'GET /api/audio-analysis/health': 'Check service health',
      'GET /api/audio-analysis/test': 'Test endpoint'
    },
    requiredFields: {
      audio: 'Only for audio endpoints; JSON endpoint requires structured fields',
      name: 'User name (2-100 characters)',
      email: 'Valid email address',
      phone: 'Phone number (10-15 characters)'
    },
    responseFormat: {
      success: 'boolean',
      data: {
        transcription: 'Complete transcript of the audio',
        insights: {
          whyUseful: '2-3 sentence explanation of value',
          benefits: ['Benefit 1', 'Benefit 2', 'Benefit 3', 'Benefit 4'],
          opportunities: ['Opportunity 1', 'Opportunity 2', 'Opportunity 3', 'Opportunity 4']
        }
      }
    }
  });
});

module.exports = router;
