const express = require('express');
const router = express.Router();
const { catchAsync } = require('../middleware/errorHandler');
const activityController = require('../controllers/activityController');

// Get all activities (public, no auth required)
router.get('/', catchAsync(activityController.getActivities));

// Get single activity by slug or ID (public, no auth required)
router.get('/:slugOrId', catchAsync(activityController.getActivity));

module.exports = router;


