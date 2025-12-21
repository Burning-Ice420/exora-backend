const Activity = require('../models/Activity');
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

module.exports = {
  getActivities,
  getActivity,
};


