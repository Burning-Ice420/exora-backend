const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const tripController = require('../controllers/tripController');

// Get user's trips
router.get('/', verifyToken, catchAsync(tripController.getTrips));

// Get public trips (no auth required)
router.get('/public', catchAsync(tripController.getPublicTrips));

// Create trip
router.post('/', verifyToken, [
  body('name').trim().isLength({ min: 2 }).withMessage('Trip name must be at least 2 characters'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location must be at least 2 characters'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').isISO8601().withMessage('End date must be a valid date'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
], catchAsync(tripController.createTrip));

// Update trip
router.put('/:id', verifyToken, catchAsync(tripController.updateTrip));

// Delete trip
router.delete('/:id', verifyToken, catchAsync(tripController.deleteTrip));

module.exports = router;
