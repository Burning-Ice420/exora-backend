const Block = require('../models/Block');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

// Get experiences (activities from database)
const getExperiences = async (req, res) => {
  try {
    const { category, priceRange, user, limit = 10, page = 1, search = '' } = req.query;
    
    // Build query for activities
    const query = { 
      type: 'Activity',
      status: { $ne: 'cancelled' } // Exclude cancelled activities
    };
    
    // Filter by category (using tags or activityType)
    if (category && category !== 'all') {
      query.$or = [
        { 'categoryDetails.activity.activityType': { $regex: category, $options: 'i' } },
        { tags: { $in: [category] } }
      ];
    }
    
    // Filter by price range
    if (priceRange === 'free') {
      query.$or = [
        { 'cost.estimated': 0 },
        { 'cost.estimated': { $exists: false } },
        { 'cost.estimated': null }
      ];
    } else if (priceRange === 'paid') {
      query['cost.estimated'] = { $gt: 0 };
    }
    
    // Filter by user (for user's own experiences)
    if (user) {
      query.createdBy = user;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get activities
    const activities = await Block.find(query)
      .populate('createdBy', 'name email profileImage')
      .populate('membersInvolved', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Transform activities to experience format for frontend compatibility
    const experiences = activities.map(activity => ({
      id: activity._id.toString(),
      name: activity.title,
      host: activity.createdBy?.name || 'Admin',
      hostAvatar: activity.createdBy?.profileImage || '👤',
      hostId: activity.createdBy?._id?.toString(),
      participants: activity.membersInvolved?.length || 0,
      time: activity.time || 'TBD',
      distance: activity.location?.name ? `${activity.location.name}` : 'Location TBD',
      category: activity.categoryDetails?.activity?.activityType || activity.tags?.[0] || 'Activity',
      price: activity.cost?.estimated || 0,
      description: activity.description || activity.details?.description || '',
      image: activity.media?.images?.[0] || '🎯',
      location: activity.location?.coordinates || { lat: 15.2993, lng: 74.1240 },
      duration: activity.details?.duration || activity.timing?.duration || '2 hours',
      difficulty: activity.categoryDetails?.activity?.difficulty || activity.requirements?.physicalFitness || 'Easy',
      createdAt: activity.createdAt,
      status: activity.status,
      destination: activity.destination
    }));
    
    const total = await Block.countDocuments(query);
    
    res.json({
      status: 'success',
      experiences,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    throw error;
  }
};

// Create experience (as Activity block)
const createExperience = async (req, res) => {
  try {
    const { name, description, category, price, time, location, duration, difficulty } = req.body;
    
    // Create activity block
    const activityData = {
      type: 'Activity',
      title: name,
      destination: location?.name || 'Goa',
      description: description,
      createdBy: req.user._id,
      date: new Date(),
      time: time || '00:00',
      status: 'published',
      approved: true,
      cost: {
        estimated: parseInt(price) || 0,
        currency: 'USD',
        perPerson: false
      },
      location: location || {
        coordinates: { latitude: 15.2993, longitude: 74.1240 }
      },
      categoryDetails: {
        activity: {
          activityType: category || 'Activity',
          difficulty: difficulty || 'Easy',
          weatherDependent: false,
          indoor: false
        }
      },
      details: {
        title: name,
        description: description,
        cost: parseInt(price) || 0,
        duration: duration || '2 hours',
        activityType: category || 'Activity',
        difficulty: difficulty || 'Easy'
      },
      tags: category ? [category] : []
    };
    
    const activity = new Block(activityData);
    await activity.save();
    
    const populatedActivity = await Block.findById(activity._id)
      .populate('createdBy', 'name email profileImage');
    
    // Transform to experience format
    const experience = {
      id: populatedActivity._id.toString(),
      name: populatedActivity.title,
      host: populatedActivity.createdBy?.name || 'User',
      hostAvatar: populatedActivity.createdBy?.profileImage || '👤',
      hostId: populatedActivity.createdBy?._id?.toString(),
      participants: 0,
      time: populatedActivity.time,
      distance: 'New',
      category: category || 'Activity',
      price: populatedActivity.cost?.estimated || 0,
      description: populatedActivity.description,
      image: '🎯',
      location: populatedActivity.location?.coordinates || { lat: 15.2993, lng: 74.1240 },
      createdAt: populatedActivity.createdAt
    };
    
    res.status(201).json({
      status: 'success',
      experience
    });
  } catch (error) {
    throw error;
  }
};

// Join experience (add user to membersInvolved)
const joinExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const activity = await Block.findById(experienceId);
    
    if (!activity) {
      throw new NotFoundError('Experience not found');
    }
    
    if (activity.type !== 'Activity') {
      throw new ValidationError('This is not an activity');
    }
    
    // Add user to membersInvolved if not already there
    if (!activity.membersInvolved.includes(req.user._id)) {
      activity.membersInvolved.push(req.user._id);
      await activity.save();
    }
    
    const populatedActivity = await Block.findById(activity._id)
      .populate('createdBy', 'name email profileImage')
      .populate('membersInvolved', 'name email');
    
    // Transform to experience format
    const experience = {
      id: populatedActivity._id.toString(),
      name: populatedActivity.title,
      host: populatedActivity.createdBy?.name || 'Admin',
      hostAvatar: populatedActivity.createdBy?.profileImage || '👤',
      hostId: populatedActivity.createdBy?._id?.toString(),
      participants: populatedActivity.membersInvolved?.length || 0,
      time: populatedActivity.time,
      distance: populatedActivity.location?.name || 'Location TBD',
      category: populatedActivity.categoryDetails?.activity?.activityType || populatedActivity.tags?.[0] || 'Activity',
      price: populatedActivity.cost?.estimated || 0,
      description: populatedActivity.description,
      image: '🎯',
      location: populatedActivity.location?.coordinates || { lat: 15.2993, lng: 74.1240 },
      createdAt: populatedActivity.createdAt
    };
    
    res.json({
      status: 'success',
      message: 'Successfully joined the experience',
      experience
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getExperiences,
  createExperience,
  joinExperience
};
