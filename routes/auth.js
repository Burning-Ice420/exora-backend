const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const authController = require('../controllers/authController');

// Register
router.post('/register', [
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
], catchAsync(authController.register));

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], catchAsync(authController.login));

// Get current user
router.get('/me', verifyToken, catchAsync(authController.getCurrentUser));

// Update profile
router.put('/profile', verifyToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('location').optional().trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio must be less than 150 characters'),
  body('gender').optional().custom((value) => {
    if (value === '' || value === null || value === undefined) return true;
    return ['Male', 'Female', 'Non-binary', 'Prefer not to say'].includes(value);
  }).withMessage('Invalid gender'),
  body('personalityType').optional().isIn(['explorer', 'planner', 'spontaneous', 'social', 'solo', 'group']).withMessage('Invalid personality type'),
  body('travelPreferences').optional().isArray().withMessage('Travel preferences must be an array'),
  body('interests').optional().isArray().withMessage('Interests must be an array'),
  body('photos').optional().isArray().withMessage('Photos must be an array'),
  body('profileImage').optional().isObject().withMessage('Profile image must be an object'),
], catchAsync(authController.updateProfile));

// Logout
router.post('/logout', verifyToken, catchAsync(authController.logout));

module.exports = router;
