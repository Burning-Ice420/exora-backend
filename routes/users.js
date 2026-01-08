const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, checkOwnership } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const userController = require('../controllers/userController');

// Send OTP for phone verification
router.post('/send-otp', [
  body('phone').trim().isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Phone number must be a valid Indian mobile number'),
], catchAsync(userController.sendOTP));

// Verify OTP and signup
router.post('/verify-otp-signup', [
  body('phone').trim().isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Phone number must be a valid Indian mobile number'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio must be less than 150 characters'),
  body('personalityType').optional().isIn(['explorer', 'planner', 'spontaneous', 'social', 'solo', 'group']).withMessage('Invalid personality type'),
  body('travelPreferences').optional().isArray().withMessage('Travel preferences must be an array'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
  body('travel_type').optional().isIn(['solo_traveler', 'couple', 'family']).withMessage('Invalid travel type'),
], catchAsync(userController.verifyOTPAndSignup));

// Legacy signup (kept for backward compatibility)
router.post('/signup', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio must be less than 150 characters'),
  body('personalityType').optional().isIn(['explorer', 'planner', 'spontaneous', 'social', 'solo', 'group']).withMessage('Invalid personality type'),
  body('travelPreferences').optional().isArray().withMessage('Travel preferences must be an array'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
  body('travel_type').optional().isIn(['solo_traveler', 'couple', 'family']).withMessage('Invalid travel type'),
], catchAsync(userController.signup));

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], catchAsync(userController.login));

// Get current user profile
router.get('/me', verifyToken, catchAsync(userController.getCurrentUser));

// Get user by ID (public endpoint for viewing profiles)
router.get('/:id', catchAsync(userController.getUserById));

// Update current user
router.put('/me', verifyToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio must be less than 150 characters'),
  body('personalityType').optional().isIn(['explorer', 'planner', 'spontaneous', 'social', 'solo', 'group']).withMessage('Invalid personality type'),
  body('travelPreferences').optional().isArray().withMessage('Travel preferences must be an array'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
], catchAsync(userController.updateUser));

module.exports = router;
