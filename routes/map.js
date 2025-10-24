const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Block = require('../models/Block');

// Get nearby users for map
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10, ageMin, ageMax, gender, interests } = req.query;
    
    // Validate required parameters
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseInt(radius) * 1000;

    // Build the base query
    let query = {
      isMapPublic: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    };

    // Apply filters
    if (ageMin && ageMax) {
      query.age = { $gte: parseInt(ageMin), $lte: parseInt(ageMax) };
    }
    if (gender) {
      query.gender = gender;
    }
    if (interests) {
      const interestArray = interests.split(',').map(i => i.trim());
      query.interests = { $in: interestArray };
    }

    // Execute the query with proper error handling
    const nearbyUsers = await User.find(query)
      .select('name bio age gender profilePicUrl interests location')
      .limit(50)
      .lean(); // Use lean() for better performance

    // Get next joinable activities for each user
    const usersWithActivities = await Promise.all(
      nearbyUsers.map(async (user) => {
        try {
          const nextActivity = await Block.findOne({
            isJoinable: true,
            date: { $gte: new Date() }
          })
          .populate('itineraryId', 'title')
          .sort({ date: 1 })
          .lean();

          return {
            ...user,
            nextJoinableActivity: nextActivity
          };
        } catch (activityError) {
          console.error('Error fetching activity for user:', user._id, activityError);
          return {
            ...user,
            nextJoinableActivity: null
          };
        }
      })
    );

    res.json(usersWithActivities);
  } catch (error) {
    console.error('Map nearby error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch nearby users',
      details: error.message 
    });
  }
});

module.exports = router;
