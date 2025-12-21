const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/environment');
const Activity = require('../models/Activity');
const ActivityPass = require('../models/ActivityPass');
const { sendActivityPassEmail } = require('../services/emailService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || config.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET || config.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
const createOrder = async (req, res) => {
  try {
    const { amount, activityId, activityName } = req.body;

    if (!amount || amount <= 0) {
      throw new ValidationError('Invalid amount');
    }

    if (!activityId) {
      throw new ValidationError('Activity ID is required');
    }

    // Verify activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    // Create order in Razorpay
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `activity_${activityId}_${Date.now()}`,
      notes: {
        activityId: activityId.toString(),
        activityName: activityName || activity.name,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      activityId,
      attendeeName,
      attendeeEmail,
      attendeePhone 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ValidationError('Missing payment details');
    }

    if (!activityId) {
      throw new ValidationError('Activity ID is required');
    }

    if (!attendeeName || !attendeeEmail) {
      throw new ValidationError('Attendee name and email are required');
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || config.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new ValidationError('Invalid payment signature');
    }

    // Verify activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    // Get payment amount from Razorpay order
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const amount = order.amount / 100; // Convert from paise to rupees

    // Create activity pass
    const pass = new ActivityPass({
      activityId: activity._id,
      activityName: activity.name,
      attendeeName,
      attendeeEmail,
      attendeePhone: attendeePhone || '',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount,
    });

    await pass.save();

    // Update activity booked count
    activity.booked = (activity.booked || 0) + 1;
    await activity.save();

    // Send confirmation email with pass
    const emailData = {
      attendeeName,
      attendeeEmail,
      passId: pass.passId,
      activityName: activity.name,
      date: activity.date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: activity.time,
      location: activity.location?.name || activity.location?.address || 'TBD',
      amount,
    };

    await sendActivityPassEmail(emailData);

    res.json({
      success: true,
      message: 'Payment verified successfully. Confirmation email sent.',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      activityId: activityId,
      passId: pass.passId,
      pass: {
        id: pass.passId,
        attendeeName: pass.attendeeName,
        activityName: pass.activityName,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    console.error('Error verifying payment:', error);
    throw new Error('Payment verification failed');
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};

