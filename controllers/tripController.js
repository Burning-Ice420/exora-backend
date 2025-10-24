const Trip = require('../models/Trip');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

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
    itinerary = []
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
    createdBy: req.user._id,
    membersInvolved: [req.user._id]
  });
  
  await newTrip.save();
  
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
  const { name, location, startDate, endDate, budget, visibility, description, itinerary } = req.body;
  
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
  createTrip,
  updateTrip,
  deleteTrip
};
