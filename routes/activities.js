const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { catchAsync } = require('../middleware/errorHandler');
const activityController = require('../controllers/activityController');

// Get all activities (public, no auth required)
router.get('/', catchAsync(activityController.getActivities));

// Save attendee information before payment (public, no auth required)
router.post(
  '/save-attendee',
  [
    body('activityId').notEmpty().withMessage('Activity ID is required'),
    body('attendeeName').trim().notEmpty().withMessage('Name is required'),
    body('attendeeEmail').isEmail().withMessage('Valid email is required'),
    body('attendeeCollege').trim().notEmpty().withMessage('College is required'),
  ],
  catchAsync(activityController.saveAttendee)
);

// Get single activity by slug or ID (public, no auth required)
router.get('/:slugOrId', catchAsync(activityController.getActivity));

module.exports = router;


