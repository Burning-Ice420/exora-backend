const express = require('express');
const router = express.Router();
const {
  addToWaitlist,
  getWaitlisters,
  getWaitlistCount,
  validateWaitlister
} = require('../controllers/waitlisterController');

// Public route - add to waitlist
router.post('/', validateWaitlister, addToWaitlist);

// Admin routes (you can add auth middleware later)
router.get('/', getWaitlisters);
router.get('/count', getWaitlistCount);

module.exports = router;

