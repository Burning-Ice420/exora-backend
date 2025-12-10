const { body, validationResult } = require('express-validator');
const Waitlister = require('../models/Waitlister');
const { ValidationError, ConflictError } = require('../middleware/errorHandler');

// Validation rules
const validateWaitlister = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must be less than 20 characters')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Please provide a valid phone number')
];

// Add to waitlist
const addToWaitlist = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError(errors.array().map(err => err.msg).join(', '));
  }

  const { email, name, phone } = req.body;

  // Check if email already exists
  const existing = await Waitlister.findOne({ email });
  if (existing) {
    throw new ConflictError('This email is already on the waitlist');
  }

  // Create new waitlister
  const waitlister = new Waitlister({
    email,
    name,
    phone: phone || undefined
  });

  await waitlister.save();

  res.status(201).json({
    success: true,
    message: 'Successfully added to waitlist',
    data: {
      id: waitlister._id,
      email: waitlister.email,
      name: waitlister.name
    }
  });
};

// Get all waitlisters (admin only - you can add auth middleware later)
const getWaitlisters = async (req, res) => {
  const { page = 1, limit = 50, notified } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (notified !== undefined) {
    query.notified = notified === 'true';
  }

  const waitlisters = await Waitlister.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  const total = await Waitlister.countDocuments(query);

  res.json({
    success: true,
    data: waitlisters,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
};

// Get waitlister count
const getWaitlistCount = async (req, res) => {
  const total = await Waitlister.countDocuments();
  const notified = await Waitlister.countDocuments({ notified: true });
  const notNotified = await Waitlister.countDocuments({ notified: false });

  res.json({
    success: true,
    data: {
      total,
      notified,
      notNotified
    }
  });
};

module.exports = {
  addToWaitlist,
  getWaitlisters,
  getWaitlistCount,
  validateWaitlister
};

