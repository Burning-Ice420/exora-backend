const Activity = require('../models/Activity');
const PendingActivityRegistration = require('../models/PendingActivityRegistration');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

// Get all activities (public)
const getActivities = async (req, res) => {
  try {
    const { category, status = 'active', featured, limit = 50, page = 1 } = req.query;

    const query = { status: status !== 'all' ? status : { $ne: 'cancelled' } };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.json({
      status: 'success',
      activities,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    throw error;
  }
};

// Get single activity by slug or ID
const getActivity = async (req, res) => {
  try {
    const { slugOrId } = req.params;

    let activity;
    if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      activity = await Activity.findById(slugOrId);
    } else {
      // It's a slug
      activity = await Activity.findOne({ slug: slugOrId });
    }

    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    res.json({
      status: 'success',
      activity,
    });
  } catch (error) {
    throw error;
  }
};

// Save attendee information before payment (public)
const saveAttendee = async (req, res) => {
  try {
    const { activityId, attendeeName, attendeeEmail, attendeePhone, attendeeCollege } = req.body;

    if (!activityId || !attendeeName || !attendeeEmail || !attendeeCollege) {
      throw new ValidationError('Activity ID, name, email, and college are required');
    }

    // Verify activity exists
    const activity = await Activity.findById(activityId);
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    // Check if there's already a pending registration for this email and activity
    const existing = await PendingActivityRegistration.findOne({
      activityId,
      attendeeEmail,
      status: 'pending',
    });

    if (existing) {
      // Update existing registration
      existing.attendeeName = attendeeName;
      existing.attendeePhone = attendeePhone || '';
      existing.attendeeCollege = attendeeCollege;
      await existing.save();
    } else {
      // Create new pending registration
      const registration = new PendingActivityRegistration({
        activityId,
        attendeeName,
        attendeeEmail,
        attendeePhone: attendeePhone || '',
        attendeeCollege,
      });
      await registration.save();
    }

    res.json({
      status: 'success',
      message: 'Attendee information saved',
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getActivities,
  getActivity,
  saveAttendee,
};


