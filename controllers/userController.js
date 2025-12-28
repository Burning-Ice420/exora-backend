const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { ValidationError, ConflictError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');
const config = require('../config/environment');

// Signup user
const signup = async (req, res) => {
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
    photos, 
    travel_type, 
    family_members, 
    ...rest 
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
    travel_type: travel_type || 'solo_traveler',
    ...rest 
  };

  // Add family members if travel_type is family or couple
  if ((travel_type === 'family' || travel_type === 'couple') && family_members && Array.isArray(family_members)) {
    userData.family_members = family_members.map(member => ({
      name: member.name,
      email: member.email,
      relation: member.relation,
      status: 'pending'
    }));
  }

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
      travel_type: user.travel_type,
      family_members: user.family_members,
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
  
  // Recalculate profile completion
  user.profileCompletion = user.calculateProfileCompletion();
  await user.save();

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
      travel_type: user.travel_type,
      family_members: user.family_members,
      exoraSpells: user.exoraSpells || 0,
      profileCompletion: user.profileCompletion || 0,
      profileStagesCompleted: user.profileStagesCompleted,
      createdAt: user.createdAt
    }
  });
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  res.json({
    status: 'success',
    user: req.user
  });
};

// Get user by ID
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-passwordHash');
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.json({
    status: 'success',
    user
  });
};

// Update current user
const updateUser = async (req, res) => {
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
    'interests', 
    'personalityType', 
    'travelPreferences', 
    'photos',
    'budgetPreference',
    'isMapPublic'
  ];
  const updates = {};
  
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { 
    new: true, 
    runValidators: true 
  }).select('-passwordHash');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Recalculate profile completion
  user.profileCompletion = user.calculateProfileCompletion();
  await user.save();
  
  res.json({
    status: 'success',
    user
  });
};

module.exports = {
  signup,
  login,
  getCurrentUser,
  getUserById,
  updateUser
};
