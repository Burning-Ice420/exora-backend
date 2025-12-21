const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const paymentController = require('../controllers/paymentController');

// Create Razorpay order (no auth required - public checkout)
router.post(
  '/create-order',
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('activityId').notEmpty().withMessage('Activity ID is required'),
  ],
  catchAsync(paymentController.createOrder)
);

// Verify payment (no auth required - public checkout)
router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Signature is required'),
    body('activityId').notEmpty().withMessage('Activity ID is required'),
    body('attendeeName').notEmpty().withMessage('Attendee name is required'),
    body('attendeeEmail').isEmail().withMessage('Valid email is required'),
  ],
  catchAsync(paymentController.verifyPayment)
);

module.exports = router;

