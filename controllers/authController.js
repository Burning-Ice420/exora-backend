const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { ValidationError, ConflictError, AuthenticationError } = require('../middleware/errorHandler');
const config = require('../config/environment');

// Register user
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { 
    email, 
    password, 
    name, 
    age, 
    location, 
    bio, 
    personalityType, 
    travelPreferences, 
    interests, 
    photos 
  } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ConflictError('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  
  // Prepare user data with all new fields
  const userData = { 
    email, 
    passwordHash, 
    name, 
    age,
    location: location || 'Unknown',
    bio,
    personalityType: personalityType || 'explorer',
    travelPreferences: travelPreferences || [],
    interests: interests || [],
    photos: photos || [],
    travel_type: 'solo_traveler'
  };

  const user = new User(userData);
  await user.save();

  const token = jwt.sign({ 
    userId: user._id, 
    travel_type: user.travel_type 
  }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  
  res.status(201).json({
    status: 'success',
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      location: user.location,
      bio: user.bio,
      personalityType: user.personalityType,
      travelPreferences: user.travelPreferences,
      interests: user.interests,
      photos: user.photos,
      profileImage: user.profileImage,
      travel_type: user.travel_type,
      createdAt: user.createdAt
    }
  });
};

// Login user
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = jwt.sign({ 
    userId: user._id, 
    travel_type: user.travel_type 
  }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
  
  res.json({
    status: 'success',
    token,
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
      age: user.age,
      location: user.location,
      bio: user.bio,
      personalityType: user.personalityType,
      travelPreferences: user.travelPreferences,
      interests: user.interests,
      photos: user.photos,
      profileImage: user.profileImage,
      travel_type: user.travel_type,
      createdAt: user.createdAt
    }
  });
};

// Get current user
const getCurrentUser = async (req, res) => {
  res.json({
    status: 'success',
    user: req.user
  });
};

// Update profile
const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const allowedUpdates = [
    'name', 
    'email', 
    'bio', 
    'age', 
    'location', 
    'gender',
    'interests', 
    'personalityType', 
    'travelPreferences', 
    'photos',
    'budgetPreference',
    'isMapPublic',
    'profileImage'
  ];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      const value = req.body[key];
      // Only include non-empty values
      if (value !== '' && value !== null && value !== undefined) {
        updates[key] = value;
      }
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { 
    new: true, 
    runValidators: true 
  }).select('-passwordHash');
  
  res.json({
    status: 'success',
    user
  });
};

// Logout
const logout = async (req, res) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token. This endpoint can be used for logging purposes
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  logout
};
