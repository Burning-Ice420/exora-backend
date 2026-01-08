const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const OTP = require('../models/OTP');
const fast2smsService = require('../services/fast2smsService');
const { ValidationError, ConflictError, AuthenticationError, NotFoundError } = require('../middleware/errorHandler');
const config = require('../config/environment');

// Send OTP for phone verification
const sendOTP = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { phone } = req.body;

  // Check if phone number is already registered
  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    throw new ConflictError('Phone number already registered');
  }

  // Generate OTP
  const otp = fast2smsService.generateOTP();

  // Delete any existing OTPs for this phone number
  await OTP.deleteMany({ phone });

  // Save OTP to database
  const otpRecord = new OTP({
    phone,
    otp,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });
  await otpRecord.save();

  // Send OTP via Fast2SMS
  try {
    await fast2smsService.sendOTP(phone, otp);
    
    res.json({
      status: 'success',
      message: 'OTP sent successfully to your phone number'
    });
  } catch (error) {
    // Delete OTP record if sending failed
    await OTP.deleteOne({ phone });
    throw new ValidationError(`Failed to send OTP: ${error.message}`);
  }
};

// Verify OTP and create user profile
const verifyOTPAndSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { 
    phone,
    otp,
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

  // Verify OTP
  const otpRecord = await OTP.findOne({ 
    phone, 
    verified: false 
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new ValidationError('OTP not found. Please request a new OTP.');
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new ValidationError('OTP has expired. Please request a new OTP.');
  }

  if (otpRecord.otp !== otp) {
    throw new ValidationError('Invalid OTP. Please try again.');
  }

  // Check if email or phone is already registered
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    throw new ConflictError('Phone number already registered');
  }

  // Mark OTP as verified
  otpRecord.verified = true;
  await otpRecord.save();

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  
  // Prepare user data with all new fields
  const userData = { 
    email, 
    phone,
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
    phoneVerified: true, // Mark phone as verified
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

  // Mark Stage 1 as completed (basic info)
  user.profileStagesCompleted.stage1 = true;
  user.profileCompletion = user.calculateProfileCompletion();
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
      phone: user.phone,
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
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt
    }
  });
};

// Legacy signup (kept for backward compatibility, but will require phone verification)
const signup = async (req, res) => {
  throw new ValidationError('Please use the OTP verification flow. Send OTP first, then verify and signup.');
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
  sendOTP,
  verifyOTPAndSignup,
  signup, // Legacy, kept for backward compatibility
  login,
  getCurrentUser,
  getUserById,
  updateUser
};
