const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const experienceController = require('../controllers/experienceController');

// Get experiences (public, optional auth)
router.get('/', optionalAuth, catchAsync(experienceController.getExperiences));

// Create experience
router.post('/', verifyToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Experience name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['Beach', 'Food', 'Adventure', 'Wellness', 'Culture']).withMessage('Invalid category'),
  body('price').isNumeric().withMessage('Price must be a number'),
], catchAsync(experienceController.createExperience));

// Join experience
router.post('/:id/join', verifyToken, catchAsync(experienceController.joinExperience));

module.exports = router;
