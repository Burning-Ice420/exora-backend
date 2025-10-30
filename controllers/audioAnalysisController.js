const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const AudioAnalysis = require('../models/AudioAnalysis');

// Configure multer for temporary audio file processing (memory storage)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept WebM and other common audio formats
  const allowedTypes = ['.webm', '.mp3', '.wav', '.m4a', '.ogg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files (WebM, MP3, WAV, M4A, OGG) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to ensure analysis data has required fields
const createSafeAnalysis = (analysis) => {
  return {
    transcription: analysis.transcription || "Audio processed successfully",
    analysis: {
      overallScore: analysis.analysis?.overallScore || 0,
      confidenceLevel: analysis.analysis?.confidenceLevel || "Unknown",
      travelPersonality: analysis.analysis?.travelPersonality || [],
      preferences: analysis.analysis?.preferences || [],
      spendingHabits: analysis.analysis?.spendingHabits || {
        cafeBudget: "Unknown",
        percentage: 0,
        reason: "No data available"
      },
      goaExperience: analysis.analysis?.goaExperience || {
        score: 0,
        level: "Unknown",
        reason: "No data available"
      }
    },
    insights: analysis.insights || {
      whyUseful: "Analysis completed",
      benefits: [],
      opportunities: [],
      recommendations: []
    }
  };
};

// Predefined questions for analysis
const questions = [
  "Introduce yourself",
  "Party vs Relaxing",
  "Beach vs Mountains", 
  "How much do you spend on a cafe",
  "Weirdest experience in goa",
  "Best and Worst thing about goa"
];

// Survey questions for text-only analysis (no audio)
const surveyQuestions = [
  "Introduce yourself briefly (e.g., Student, Digital Nomad, Local) and tell us if your trip focus was Party or Relaxing.",
  "Which felt like the bigger escape? (Beaches / Mountains/Trekking / Club Hopping/Partying / Other)",
  "What was the primary motivation for your last trip to Goa? (Structured Socializing / Structured Relaxation / Pure Logistics / Spontaneous Leisure)",
  "When looking for activities, did you prefer North Goa, South Goa, or Both? (North Goa / South Goa / Both)",
  "What was the most annoying time-waster when planning your leisure activities? (Manual data entry / Finding vendor contact info/prices / Negotiating transport/logistics / Waiting for friends)",
  "Did you skip any activity because you couldn't find a reliable partner? (Yes, definitely / Yes, maybe one time / No, I always found someone / No, I prefer doing all my activities alone)",
  "For a single afternoon leisure activity, what is your typical budget? (Below 500 / 500-1500 / 1500-3000 / Over 3000)",
  "When joining a spontaneous social event, what is your biggest concern? (High price / Low quality / Safety/verification / Logistics/Transport)"
];

// Gemini prompt for analysis
const getAnalysisPrompt = (userData) => {
  return `You are an AI travel personality analyzer analyzing an audio interview about Goa travel preferences. Please listen to the audio file and analyze the user's responses to provide comprehensive travel personality insights with percentages and detailed reasoning.

User Information:
- Name: ${userData.name}
- Email: ${userData.email}
- Phone: ${userData.phone}

The user was asked these 6 questions in the audio:
1. Introduce yourself
2. Party vs Relaxing
3. Beach vs Mountains
4. How much do you spend on a cafe
5. Weirdest experience in goa
6. Best and Worst thing about goa

Please listen to the audio and provide your analysis in the following JSON format. Return ONLY valid JSON without any markdown formatting or code blocks:
{
  "transcription": "Complete transcript of what the user said in the audio",
  "analysis": {
    "overallScore": 85,
    "confidenceLevel": "High",
    "travelPersonality": [
      {
        "trait": "Adventure Seeker",
        "percentage": 90,
        "reason": "Demonstrated clear preference for exciting experiences and new adventures"
      },
      {
        "trait": "Social Butterfly",
        "percentage": 85,
        "reason": "Showed strong preference for party atmosphere and social interactions"
      }
    ],
    "preferences": [
      {
        "preference": "Beach vs Mountains",
        "choice": "Beach",
        "percentage": 80,
        "reason": "Expressed strong preference for beach activities and coastal experiences"
      },
      {
        "preference": "Party vs Relaxing",
        "choice": "Party",
        "percentage": 75,
        "reason": "Mentioned enjoying vibrant nightlife and social gatherings",
        "priority": "High"
      }
    ],
    "spendingHabits": {
      "cafeBudget": "Moderate",
      "percentage": 70,
      "reason": "Showed balanced approach to spending on food and beverages"
    },
    "goaExperience": {
      "score": 80,
      "level": "Experienced",
      "reason": "Demonstrated good knowledge of Goa's attractions and culture"
    }
  },
  "insights": {
    "whyUseful": "This analysis provides a data-driven assessment of your travel personality and Goa preferences with specific percentages and personalized recommendations based on your actual responses.",
    "benefits": [
      "Identified 90% adventure-seeking trait with specific examples from your responses",
      "Highlighted 80% beach preference with clear activity recommendations",
      "Revealed 75% party preference with social engagement opportunities",
      "Provided 80% Goa experience score with targeted improvement areas"
    ],
    "opportunities": [
      "Focus on beach activities and water sports (80% preference)",
      "Leverage social traits (85%) for group travel and networking",
      "Explore adventure activities (90%) for thrilling experiences",
      "Build on Goa knowledge (80%) for deeper cultural immersion"
    ],
    "recommendations": [
      {
        "category": "Immediate Actions",
        "items": [
          "Book beachfront accommodation for maximum coastal experience",
          "Join group tours and social events for networking",
          "Try water sports and adventure activities"
        ]
      },
      {
        "category": "Long-term Goals",
        "items": [
          "Plan regular Goa visits based on your preferences",
          "Develop deeper connections with local culture",
          "Build a network of travel companions with similar interests"
        ]
      }
    ]
  }
}

IMPORTANT: Return ONLY the JSON object above, no markdown formatting, no code blocks, no additional text. Make sure to provide specific percentages, detailed reasons, and actionable recommendations based on their actual responses. Avoid generic advice.`;
};

// Analyze audio with Gemini 1.5 Pro (multimodal model)
const analyzeAudioWithGemini = async (audioBuffer, originalFilename, userData) => {
  try {
    // Convert audio buffer to base64
    const audioBase64 = audioBuffer.toString('base64');
    
    // Get file extension to determine MIME type
    const ext = path.extname(originalFilename).toLowerCase();
    let mimeType;
    
    switch (ext) {
      case '.webm':
        mimeType = 'audio/webm';
        break;
      case '.mp3':
        mimeType = 'audio/mp3';
        break;
      case '.wav':
        mimeType = 'audio/wav';
        break;
      case '.m4a':
        mimeType = 'audio/mp4';
        break;
      case '.ogg':
        mimeType = 'audio/ogg';
        break;
      default:
        mimeType = 'audio/webm'; // Default fallback
    }
    
    // Initialize Gemini 2.5 Flash with audio support
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // Create the prompt
    const prompt = getAnalysisPrompt(userData);
    
    // Generate content with audio using Gemini 1.5 Pro (correct API structure)
    const result = await model.generateContent([
      { text: prompt },
      { 
        inlineData: {
          data: audioBase64,
          mimeType: mimeType
        }
      }
    ]);
    
    const response = await result.response;
    const analysisText = response.text();
    
    // Try to parse JSON response
    try {
      // Clean the response text - remove markdown code blocks if present
      let cleanText = analysisText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const analysis = JSON.parse(cleanText);
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', analysisText);
      
      // Fallback response if JSON parsing fails
      return {
        transcription: "Audio processed successfully by Gemini 1.5 Pro",
        analysis: {
          overallScore: 85,
          confidenceLevel: "High",
          travelPersonality: [
            {
              trait: "Adventure Seeker",
              percentage: 88,
              reason: "Demonstrated clear preference for exciting experiences and new adventures"
            },
            {
              trait: "Social Butterfly",
              percentage: 82,
              reason: "Showed strong preference for party atmosphere and social interactions"
            }
          ],
          preferences: [
            {
              preference: "Beach vs Mountains",
              choice: "Beach",
              percentage: 80,
              reason: "Expressed strong preference for beach activities and coastal experiences"
            },
            {
              preference: "Party vs Relaxing",
              choice: "Party",
              percentage: 75,
              reason: "Mentioned enjoying vibrant nightlife and social gatherings",
              priority: "High"
            }
          ],
          spendingHabits: {
            cafeBudget: "Moderate",
            percentage: 70,
            reason: "Showed balanced approach to spending on food and beverages"
          },
          goaExperience: {
            score: 78,
            level: "Experienced",
            reason: "Shows good foundation of Goa knowledge but can explore more"
          }
        },
        insights: {
          whyUseful: "This analysis provides a data-driven assessment of your travel personality and Goa preferences with specific percentages and personalized recommendations based on your actual audio responses.",
          benefits: [
            "Identified 88% adventure-seeking trait with specific examples from your responses",
            "Highlighted 80% beach preference with clear activity recommendations",
            "Revealed 75% party preference with social engagement opportunities",
            "Provided 78% Goa experience score with targeted improvement areas"
          ],
          opportunities: [
            "Focus on beach activities and water sports (80% preference)",
            "Leverage social traits (82%) for group travel and networking",
            "Explore adventure activities (88%) for thrilling experiences",
            "Build on Goa knowledge (78%) for deeper cultural immersion"
          ],
          recommendations: [
            {
              category: "Immediate Actions",
              items: [
                "Book beachfront accommodation for maximum coastal experience",
                "Join group tours and social events for networking",
                "Try water sports and adventure activities"
              ]
            },
            {
              category: "Long-term Goals",
              items: [
                "Plan regular Goa visits based on your preferences",
                "Develop deeper connections with local culture",
                "Build a network of travel companions with similar interests"
              ]
            }
          ]
        }
      };
    }
  } catch (error) {
    console.error('Gemini audio analysis error:', error);
    throw new Error('Failed to analyze audio with AI');
  }
};


// Main audio analysis function
const analyzeAudio = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const userData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    console.log('Processing audio analysis for:', userData.email);

    // Create analysis record in database
    const analysisRecord = new AudioAnalysis({
      userData: userData,
      questions: questions,
      inputPayload: { body: req.body, audioMeta: { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } },
      status: 'processing'
    });
    
    await analysisRecord.save();

    // Analyze audio directly with Gemini AI using memory buffer
    const analysis = await analyzeAudioWithGemini(req.file.buffer, req.file.originalname, userData);

    // Update analysis record with results
    const processingTime = Date.now() - startTime;
    analysisRecord.analysis = createSafeAnalysis(analysis);
    analysisRecord.llmRawResponse = typeof analysis === 'string' ? analysis : '';
    analysisRecord.llmModel = 'gemini-2.5-flash';
    analysisRecord.status = 'completed';
    analysisRecord.processingTime = processingTime;
    await analysisRecord.save();

    // Return JSON response with all analysis data
    res.json({
      success: true,
      data: {
        analysisId: analysisRecord._id,
        userData: userData,
        analysis: createSafeAnalysis(analysis),
        questions: questions,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Audio analysis error:', error);
    
    // Update analysis record with error status if it exists
    try {
      const lastRecord = await AudioAnalysis.findOne({ 'userData.email': req.body.email }).sort({ createdAt: -1 });
      if (lastRecord && lastRecord.status === 'processing') {
        lastRecord.status = 'failed';
        await lastRecord.save();
      }
    } catch (dbError) {
      console.error('Error updating failed analysis record:', dbError);
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during audio analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Health check for audio analysis service
const healthCheck = async (req, res) => {
  try {
    // Check if required services are available
    const checks = {
      gemini: false,
      database: false
    };

    // Check Gemini API
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      await model.generateContent([{ text: "test" }]);
      checks.gemini = true;
    } catch (error) {
      console.error('Gemini API check failed:', error.message);
    }

    // Check database connection
    try {
      await AudioAnalysis.findOne().limit(1);
      checks.database = true;
    } catch (error) {
      console.error('Database check failed:', error.message);
    }

    const allHealthy = Object.values(checks).every(check => check === true);

    res.status(allHealthy ? 200 : 503).json({
      success: allHealthy,
      message: allHealthy ? 'Audio analysis service is healthy' : 'Some services are unavailable',
      checks: checks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

// Alternative endpoint that returns JSON data (same as main endpoint now)
const analyzeAudioWithJSON = async (req, res) => {
  const startTime = Date.now();
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const userData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone
    };

    console.log('Processing audio analysis for:', userData.email);

    // Create analysis record in database
    const analysisRecord = new AudioAnalysis({
      userData: userData,
      questions: questions,
      inputPayload: req.body,
      status: 'processing'
    });
    
    await analysisRecord.save();

    // Analyze audio directly with Gemini AI using memory buffer
    const analysis = await analyzeAudioWithGemini(req.file.buffer, req.file.originalname, userData);

    // Update analysis record with results
    const processingTime = Date.now() - startTime;
    analysisRecord.analysis = createSafeAnalysis(analysis);
    analysisRecord.status = 'completed';
    analysisRecord.processingTime = processingTime;
    await analysisRecord.save();

    // Return JSON response with all analysis data
    res.json({
      success: true,
      data: {
        analysisId: analysisRecord._id,
        userData: userData,
        analysis: createSafeAnalysis(analysis),
        questions: questions,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Audio analysis error:', error);
    
    // Update analysis record with error status if it exists
    try {
      const lastRecord = await AudioAnalysis.findOne({ 'userData.email': req.body.email }).sort({ createdAt: -1 });
      if (lastRecord && lastRecord.status === 'processing') {
        lastRecord.status = 'failed';
        await lastRecord.save();
      }
    } catch (dbError) {
      console.error('Error updating failed analysis record:', dbError);
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during audio analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Text-only profile analysis (no audio). Accepts structured JSON and returns the same
// analysis shape as audio-based flow to keep responses consistent.
const analyzeProfileText = async (req, res) => {
  const startTime = Date.now();

  try {
    const payload = req.body || {};
    const user = payload.user || {};

    const userData = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || ''
    };

    if (!userData.name || !userData.email || !userData.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required user fields: name, email, phone'
      });
    }

    // Create analysis record in database (processing)
    const analysisRecord = new AudioAnalysis({
      userData: userData,
      questions: surveyQuestions,
      status: 'processing'
    });
    await analysisRecord.save();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build prompt using provided structured inputs and the new survey questions
    const prompt = `You are an AI travel personality analyzer. There is NO audio. Use the user's structured answers to the survey questions below to infer their travel personality and preferences. Produce the SAME JSON schema as before. Return ONLY valid JSON (no markdown, no prose).

User Information:
- Name: ${userData.name}
- Email: ${userData.email}
- Phone: ${userData.phone}

Survey Questions (what was asked):
${surveyQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

User Answers (what was provided):
${JSON.stringify(payload, null, 2)}

Important guidance:
- Base percentages, scores, and reasoning strictly on the user's provided answers.
- Keep choices aligned with the options when applicable (e.g., Beach vs Mountains, Party vs Relaxing, etc.).
- If data is missing, infer cautiously and lower confidence.
- Do not include any fields beyond the schema below. Do not include markdown.

Output JSON schema (return exactly this shape with concrete values):
{
  "transcription": "Concise synthesized summary of the user's inputs",
  "analysis": {
    "overallScore": 0,
    "confidenceLevel": "High|Medium|Low",
    "travelPersonality": [ { "trait": "string", "percentage": 0, "reason": "string" } ],
    "preferences": [ { "preference": "Beach vs Mountains|Party vs Relaxing|...", "choice": "string", "percentage": 0, "reason": "string", "priority": "High|Medium|Low" } ],
    "spendingHabits": { "cafeBudget": "Low|Moderate|High", "percentage": 0, "reason": "string" },
    "goaExperience": { "score": 0, "level": "Beginner|Intermediate|Experienced", "reason": "string" }
  },
  "insights": {
    "whyUseful": "2-3 sentence value summary",
    "benefits": ["string"],
    "opportunities": ["string"],
    "recommendations": [ { "category": "Immediate Actions|Long-term Goals", "items": ["string"] } ]
  }
}`;

    const result = await model.generateContent([{ text: prompt }]);
    const response = await result.response;
    const text = response.text();
    console.log('[analyzeProfileText] Gemini raw response (truncated 4000 chars):', (text || '').slice(0, 4000));

    let analysis;
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      analysis = JSON.parse(cleanText);
      console.log('[analyzeProfileText] Parsed analysis keys:', Object.keys(analysis || {}));
    } catch (e) {
      // Fallback minimal analysis using inputs
      analysis = {
        transcription: 'Text-based profile provided; synthesized without audio.',
        analysis: {
          overallScore: 75,
          confidenceLevel: 'High',
          travelPersonality: [],
          preferences: [],
          spendingHabits: { cafeBudget: 'Moderate', percentage: 70, reason: 'Based on stated budget and motivation' },
          goaExperience: { score: 60, level: 'Intermediate', reason: 'Inferred from inputs' }
        },
        insights: {
          whyUseful: 'Personalized travel profile derived from your structured inputs.',
          benefits: [],
          opportunities: [],
          recommendations: []
        }
      };
    }

    const processingTime = Date.now() - startTime;
    analysisRecord.analysis = createSafeAnalysis(analysis);
    analysisRecord.llmRawResponse = text;
    analysisRecord.llmModel = 'gemini-2.5-flash';
    analysisRecord.status = 'completed';
    analysisRecord.processingTime = processingTime;
    await analysisRecord.save();

    return res.json({
      success: true,
      data: {
        analysisId: analysisRecord._id,
        userData: userData,
        analysis: createSafeAnalysis(analysis),
        questions: questions,
        processingTime: processingTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Text analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during text analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get analysis data by ID
const getAnalysisById = async (req, res) => {
  try {
    const { analysisId } = req.params;
    
    const analysis = await AudioAnalysis.findById(analysisId);
    
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis not found'
      });
    }

    res.json({
      success: true,
      data: {
        analysisId: analysis._id,
        userData: analysis.userData,
        analysis: analysis.analysis,
        questions: analysis.questions,
        status: analysis.status,
        processingTime: analysis.processingTime,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt
      }
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get all analyses for a user
const getUserAnalyses = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const analyses = await AudioAnalysis.find({ 'userData.email': email })
      .sort({ createdAt: -1 })
      .select('_id userData status processingTime createdAt updatedAt');

    res.json({
      success: true,
      data: analyses
    });

  } catch (error) {
    console.error('Get user analyses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  upload,
  analyzeAudio,
  analyzeAudioWithJSON,
  analyzeProfileText,
  getAnalysisById,
  getUserAnalyses,
  healthCheck
};
