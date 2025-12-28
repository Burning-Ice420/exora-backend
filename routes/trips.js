const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const tripController = require('../controllers/tripController');
const attendanceController = require('../controllers/attendanceController');

// Get user's trips
router.get('/', verifyToken, catchAsync(tripController.getTrips));

// Get public trips (no auth required)
router.get('/public', catchAsync(tripController.getPublicTrips));

// Attendance routes (must come before /:tripId to avoid route conflicts)
router.get('/:tripId/attendance', verifyToken, catchAsync(attendanceController.getTripAttendance));
router.post('/:tripId/attendance', verifyToken, [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('status').isIn(['showed_up', 'no_show']).withMessage('Status must be "showed_up" or "no_show"')
], catchAsync(attendanceController.markAttendance));

// Get trip by ID (public or authenticated user's own trip)
// Note: This route must come after /public and attendance routes
// Uses optionalAuth so public trips can be accessed without auth, but authenticated users can access their own trips
router.get('/:tripId', optionalAuth, catchAsync(tripController.getTripById));

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
