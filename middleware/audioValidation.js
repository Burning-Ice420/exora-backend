// Standalone validation functions for audio analysis endpoint
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return 'Name is required';
  }
  
  const trimmedName = name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return 'Name must be between 2 and 100 characters';
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) {
    return 'Name can only contain letters, spaces, hyphens, and apostrophes';
  }
  
  return null;
};

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }
  
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return 'Please provide a valid email address';
  }
  
  return null;
};

const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return 'Phone number is required';
  }
  
  const trimmedPhone = phone.trim();
  if (trimmedPhone.length < 10 || trimmedPhone.length > 15) {
    return 'Phone number must be between 10 and 15 characters';
  }
  
  if (!/^[\+]?[1-9][\d]{0,15}$/.test(trimmedPhone)) {
    return 'Please provide a valid phone number';
  }
  
  return null;
};

// Main validation function
const validateAudioAnalysisInput = (req, res, next) => {
  const { name, email, phone } = req.body;
  const errors = [];

  // Validate each field
  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const phoneError = validatePhone(phone);
  if (phoneError) errors.push(phoneError);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone.trim();

  next();
};

// File validation middleware
const validateAudioFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Audio file is required'
    });
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'File size too large. Maximum size is 50MB'
    });
  }

  // Check file type
  const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only audio files (WebM, MP3, WAV, M4A, OGG) are allowed'
    });
  }

  next();
};

// Rate limiting for audio analysis (more restrictive than general API)
const rateLimit = require('express-rate-limit');

const audioAnalysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many audio analysis requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  validateAudioAnalysisInput,
  validateAudioFile,
  audioAnalysisLimiter,
  validateName,
  validateEmail,
  validatePhone
};
