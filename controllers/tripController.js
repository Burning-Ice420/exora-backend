const Trip = require('../models/Trip');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const spellsService = require('../services/spellsService');

// Get user's trips
const getTrips = async (req, res) => {
  const userTrips = await Trip.find({ createdBy: req.user._id })
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    trips: userTrips
  });
};

// Get public trips
const getPublicTrips = async (req, res) => {
  const publicTrips = await Trip.find({ visibility: 'public' })
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    trips: publicTrips
  });
};

// Get trip by ID (public or user's own trip)
const getTripById = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?._id; // Optional - user might not be authenticated (for public trips)
  
  if (!tripId) {
    throw new ValidationError('Trip ID is required');
  }
  
  const trip = await Trip.findById(tripId)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  
  // Check if trip is public or user owns it
  const isPublic = trip.visibility === 'public';
  const isOwner = userId && trip.createdBy._id.toString() === userId.toString();
  
  if (!isPublic && !isOwner) {
    throw new NotFoundError('Trip not found or not accessible');
  }
  
  res.json({
    status: 'success',
    trip
  });
};

// Create trip
const createTrip = async (req, res) => {
  const { 
    name, 
    location, 
    startDate, 
    endDate, 
    budget, 
    visibility = 'public',
    description,
    itinerary = [],
    startCoordinates
  } = req.body;
  
  const newTrip = new Trip({
    name,
    destination: location,
    location,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    budget: parseInt(budget) || 0,
    visibility,
    description,
    itinerary,
    startCoordinates: startCoordinates && Array.isArray(startCoordinates) && startCoordinates.length === 2 
      ? startCoordinates 
      : undefined,
    createdBy: req.user._id,
    membersInvolved: [req.user._id]
  });
  
  await newTrip.save();
  
  // Award spells for hosting a trip (only if not already awarded)
  if (!newTrip.spellsAwardedForHost) {
    try {
      await spellsService.awardHostTrip(req.user._id, newTrip._id);
      newTrip.spellsAwardedForHost = true;
      await newTrip.save();
    } catch (error) {
      console.error('Error awarding spells for hosting trip:', error);
      // Don't fail the request if spells update fails
    }
  }
  
  // Populate the created trip
  const populatedTrip = await Trip.findById(newTrip._id)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  res.status(201).json({
    status: 'success',
    trip: populatedTrip
  });
};

// Update trip
const updateTrip = async (req, res) => {
  const tripId = req.params.id;
  const { name, location, startDate, endDate, budget, visibility, description, itinerary, startCoordinates, status } = req.body;
  
  const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
  
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  
  // Update fields
  if (name) trip.name = name;
  if (location) {
    trip.location = location;
    trip.destination = location;
  }
  if (startDate) trip.startDate = new Date(startDate);
  if (endDate) trip.endDate = new Date(endDate);
  if (budget !== undefined) trip.budget = parseInt(budget);
  if (visibility) trip.visibility = visibility;
  if (description !== undefined) trip.description = description;
  if (itinerary) trip.itinerary = itinerary;
  if (startCoordinates !== undefined) {
    trip.startCoordinates = startCoordinates && Array.isArray(startCoordinates) && startCoordinates.length === 2
      ? startCoordinates
      : null;
  }
  if (status && ['planning', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    trip.status = status;
  }
  
  await trip.save();
  
  // Populate the updated trip
  const populatedTrip = await Trip.findById(trip._id)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  res.json({
    status: 'success',
    trip: populatedTrip
  });
};

// Delete trip
const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  
  const trip = await Trip.findOneAndDelete({ _id: tripId, createdBy: req.user._id });
  
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  
  res.json({
    status: 'success',
    message: 'Trip deleted successfully'
  });
};

module.exports = {
  getTrips,
  getPublicTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
