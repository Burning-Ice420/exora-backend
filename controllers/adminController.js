const Block = require('../models/Block');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

// Get all activities (blocks with type 'Activity')
const getAllActivities = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', status = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = { type: 'Activity' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const activities = await Block.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Block.countDocuments(query);
    
    res.json({
      status: 'success',
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    throw error;
  }
};

// Get single activity by ID
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Block.findById(id)
      .populate('createdBy', 'name email')
      .populate('membersInvolved', 'name email');
    
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }
    
    if (activity.type !== 'Activity') {
      throw new ValidationError('This is not an activity');
    }
    
    res.json({
      status: 'success',
      activity
    });
  } catch (error) {
    throw error;
  }
};

// Create new activity
const createActivity = async (req, res) => {
  try {
    const activityData = {
      ...req.body,
      type: 'Activity',
      createdBy: req.body.createdBy || null, // Admin can create activities without a user
      approved: true,
      status: req.body.status || 'published'
    };
    
    // Ensure required fields
    if (!activityData.title) {
      throw new ValidationError('Title is required');
    }
    if (!activityData.destination) {
      throw new ValidationError('Destination is required');
    }
    if (!activityData.date) {
      activityData.date = new Date();
    }
    if (!activityData.time) {
      activityData.time = '00:00';
    }
    if (!activityData.details) {
      activityData.details = { title: activityData.title };
    }
    
    const activity = new Block(activityData);
    await activity.save();
    
    const populatedActivity = await Block.findById(activity._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      status: 'success',
      message: 'Activity created successfully',
      activity: populatedActivity
    });
  } catch (error) {
    throw error;
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Block.findById(id);
    
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }
    
    if (activity.type !== 'Activity') {
      throw new ValidationError('This is not an activity');
    }
    
    // Update activity
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        activity[key] = req.body[key];
      }
    });
    
    await activity.save();
    
    const updatedActivity = await Block.findById(id)
      .populate('createdBy', 'name email');
    
    res.json({
      status: 'success',
      message: 'Activity updated successfully',
      activity: updatedActivity
    });
  } catch (error) {
    throw error;
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    
    const activity = await Block.findById(id);
    
    if (!activity) {
      throw new NotFoundError('Activity not found');
    }
    
    if (activity.type !== 'Activity') {
      throw new ValidationError('This is not an activity');
    }
    
    await Block.findByIdAndDelete(id);
    
    res.json({
      status: 'success',
      message: 'Activity deleted successfully'
    });
  } catch (error) {
    throw error;
  }
};

// Bulk upload activities from CSV
const bulkUploadActivities = async (req, res) => {
  try {
    if (!req.file) {
      throw new ValidationError('CSV file is required');
    }
    
    const results = [];
    const errors = [];
    let rowNumber = 0;
    
    // Parse CSV file
    const csvData = req.file.buffer.toString('utf-8');
    const lines = csvData.split('\n').filter(line => line.trim());
    
    // Skip header row
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    for (let i = 1; i < lines.length; i++) {
      rowNumber = i + 1;
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length === 0 || values.every(v => !v)) {
        continue; // Skip empty rows
      }
      
      try {
        // Map CSV columns to activity fields
        const activityData = {
          type: 'Activity',
          title: values[headers.indexOf('title')] || values[0] || 'Untitled Activity',
          destination: values[headers.indexOf('destination')] || values[1] || '',
          description: values[headers.indexOf('description')] || values[2] || '',
          date: values[headers.indexOf('date')] ? new Date(values[headers.indexOf('date')]) : new Date(),
          time: values[headers.indexOf('time')] || values[headers.indexOf('starttime')] || '00:00',
          approved: true,
          status: values[headers.indexOf('status')] || 'published',
          tags: values[headers.indexOf('tags')] ? values[headers.indexOf('tags')].split(';').map(t => t.trim()) : [],
          details: {
            title: values[headers.indexOf('title')] || values[0] || 'Untitled Activity',
            description: values[headers.indexOf('description')] || values[2] || '',
            cost: parseFloat(values[headers.indexOf('cost')] || values[headers.indexOf('price')] || 0),
            location: values[headers.indexOf('location')] || values[1] || '',
            duration: values[headers.indexOf('duration')] || '',
            activityType: values[headers.indexOf('activitytype')] || '',
            difficulty: values[headers.indexOf('difficulty')] || ''
          }
        };
        
        // Add location coordinates if provided
        if (values[headers.indexOf('latitude')] && values[headers.indexOf('longitude')]) {
          activityData.location = {
            ...activityData.location,
            coordinates: {
              latitude: parseFloat(values[headers.indexOf('latitude')]),
              longitude: parseFloat(values[headers.indexOf('longitude')])
            }
          };
        }
        
        // Add cost information
        if (values[headers.indexOf('cost')] || values[headers.indexOf('price')]) {
          activityData.cost = {
            estimated: parseFloat(values[headers.indexOf('cost')] || values[headers.indexOf('price')] || 0),
            currency: values[headers.indexOf('currency')] || 'USD',
            perPerson: values[headers.indexOf('perperson')] === 'true' || false
          };
        }
        
        // Add category details for activity
        if (values[headers.indexOf('activitytype')] || values[headers.indexOf('difficulty')]) {
          activityData.categoryDetails = {
            activity: {
              activityType: values[headers.indexOf('activitytype')] || '',
              difficulty: values[headers.indexOf('difficulty')] || '',
              instructor: values[headers.indexOf('instructor')] || '',
              equipment: values[headers.indexOf('equipment')] ? values[headers.indexOf('equipment')].split(';').map(e => e.trim()) : [],
              weatherDependent: values[headers.indexOf('weatherdependent')] === 'true' || false,
              indoor: values[headers.indexOf('indoor')] === 'true' || false
            }
          };
        }
        
        const activity = new Block(activityData);
        await activity.save();
        
        results.push({
          row: rowNumber,
          title: activityData.title,
          id: activity._id,
          status: 'success'
        });
      } catch (error) {
        errors.push({
          row: rowNumber,
          error: error.message,
          data: values
        });
      }
    }
    
    res.json({
      status: 'success',
      message: `Processed ${results.length} activities successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: results.length + errors.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    throw error;
  }
};

// Get activity statistics
const getActivityStats = async (req, res) => {
  try {
    const total = await Block.countDocuments({ type: 'Activity' });
    const published = await Block.countDocuments({ type: 'Activity', status: 'published' });
    const draft = await Block.countDocuments({ type: 'Activity', status: 'draft' });
    const cancelled = await Block.countDocuments({ type: 'Activity', status: 'cancelled' });
    
    res.json({
      status: 'success',
      stats: {
        total,
        published,
        draft,
        cancelled
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  bulkUploadActivities,
  getActivityStats
};

