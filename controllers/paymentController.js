const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/environment');
const Activity = require('../models/Activity');
const ActivityPass = require('../models/ActivityPass');
const PendingActivityRegistration = require('../models/PendingActivityRegistration');
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
    const receipt = `act_${activityId.toString().slice(-10)}_${Date.now().toString(36)}`.slice(0, 40);
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt,
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
      attendeePhone,
      attendeeCollege 
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

    // If attendee data is missing, try to retrieve from pending registration
    let finalAttendeeName = attendeeName;
    let finalAttendeeEmail = attendeeEmail;
    let finalAttendeePhone = attendeePhone || '';
    let finalAttendeeCollege = attendeeCollege || '';

    if (!finalAttendeeName || !finalAttendeeEmail || !finalAttendeeCollege) {
      const pendingRegistration = await PendingActivityRegistration.findOne({
        activityId,
        attendeeEmail: finalAttendeeEmail,
        status: 'pending',
      }).sort({ createdAt: -1 });

      if (pendingRegistration) {
        finalAttendeeName = finalAttendeeName || pendingRegistration.attendeeName;
        finalAttendeeEmail = finalAttendeeEmail || pendingRegistration.attendeeEmail;
        finalAttendeePhone = finalAttendeePhone || pendingRegistration.attendeePhone || '';
        finalAttendeeCollege = finalAttendeeCollege || pendingRegistration.attendeeCollege || '';
        
        // Mark pending registration as completed
        pendingRegistration.status = 'completed';
        await pendingRegistration.save();
      }
    }

    if (!finalAttendeeName || !finalAttendeeEmail) {
      throw new ValidationError('Attendee name and email are required');
    }

    // Create activity pass
    const pass = new ActivityPass({
      activityId: activity._id,
      activityName: activity.name,
      attendeeName: finalAttendeeName,
      attendeeEmail: finalAttendeeEmail,
      attendeePhone: finalAttendeePhone,
      attendeeCollege: finalAttendeeCollege,
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
      attendeeName: finalAttendeeName,
      attendeeEmail: finalAttendeeEmail,
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

