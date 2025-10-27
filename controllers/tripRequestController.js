const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const TripRequest = require('../models/TripRequest');
const Trip = require('../models/Trip');
const ChatRoom = require('../models/ChatRoom');
const { v4: uuidv4 } = require('uuid');

// Send trip join request
const sendTripJoinRequest = async (req, res) => {
  const { tripId } = req.params;
  const { message } = req.body;
  const requesterId = req.user._id;

  // Check if trip exists
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }

  // Check if user is trying to join their own trip
  if (trip.createdBy.toString() === requesterId) {
    throw new ValidationError('Cannot join your own trip');
  }

  // Check if request already exists
  const existingRequest = await TripRequest.findOne({
    tripId,
    requesterId
  });

  if (existingRequest) {
    throw new ValidationError('Join request already sent');
  }

  // Create new request
  const tripRequest = new TripRequest({
    tripId,
    requesterId,
    tripOwnerId: trip.createdBy,
    message: message || ''
  });

  await tripRequest.save();

  // Populate user data
  await tripRequest.populate('requesterId', 'name profileImage');
  await tripRequest.populate('tripOwnerId', 'name profileImage');

  res.status(201).json({
    status: 'success',
    request: tripRequest
  });
};

// Get trip join requests for trip owner
const getTripJoinRequests = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  // Verify user owns the trip
  const trip = await Trip.findById(tripId);
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }

  if (trip.createdBy.toString() !== userId) {
    throw new ValidationError('Not authorized to view requests for this trip');
  }

  const requests = await TripRequest.find({
    tripId,
    tripOwnerId: userId,
    status: 'pending'
  })
  .populate('requesterId', 'name profileImage')
  .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    requests
  });
};

// Accept trip join request
const acceptTripJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await TripRequest.findById(requestId)
    .populate('requesterId', 'name profileImage')
    .populate('tripId');

  if (!request) {
    throw new NotFoundError('Join request not found');
  }

  // Verify user owns the trip
  if (request.tripOwnerId.toString() !== userId.toString()) {
    throw new ValidationError('Not authorized to accept this request');
  }

  if (request.status !== 'pending') {
    throw new ValidationError('Request has already been processed');
  }

  // Update request status
  request.status = 'accepted';
  request.respondedAt = new Date();
  await request.save();

  // Create or update chat room
  let chatRoom = await ChatRoom.findOne({ tripId: request.tripId._id });
  
  if (!chatRoom) {
    // Create new chat room
    const firebaseRoomId = `trip_${request.tripId._id}_${uuidv4()}`;
    chatRoom = new ChatRoom({
      tripId: request.tripId._id,
      tripOwnerId: userId,
      participants: [userId, request.requesterId._id],
      firebaseRoomId
    });
  } else {
    // Add participant to existing chat room
    if (!chatRoom.participants.includes(request.requesterId._id)) {
      chatRoom.participants.push(request.requesterId._id);
    }
  }

  await chatRoom.save();

  res.json({
    status: 'success',
    request,
    chatRoom: {
      id: chatRoom._id,
      firebaseRoomId: chatRoom.firebaseRoomId,
      participants: chatRoom.participants
    }
  });
};

// Reject trip join request
const rejectTripJoinRequest = async (req, res) => {
  const { requestId } = req.params;
  const userId = req.user._id;

  const request = await TripRequest.findById(requestId);

  if (!request) {
    throw new NotFoundError('Join request not found');
  }

  // Verify user owns the trip
  if (request.tripOwnerId.toString() !== userId.toString()) {
    throw new ValidationError('Not authorized to reject this request');
  }

  if (request.status !== 'pending') {
    throw new ValidationError('Request has already been processed');
  }

  // Update request status
  request.status = 'rejected';
  request.respondedAt = new Date();
  await request.save();

  res.json({
    status: 'success',
    request
  });
};

// Get user's sent requests
const getMyTripRequests = async (req, res) => {
  const userId = req.user._id;

  const requests = await TripRequest.find({
    requesterId: userId
  })
  .populate('tripId', 'name location startDate endDate')
  .populate('tripOwnerId', 'name profileImage')
  .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    requests
  });
};

// Get trip requests for trips owned by user
const getMyTripRequestsAsOwner = async (req, res) => {
  const userId = req.user._id;

  // First get all trips owned by the user
  const userTrips = await Trip.find({ createdBy: userId }).select('_id');
  const tripIds = userTrips.map(trip => trip._id);

  // Then get all requests for those trips
  const requests = await TripRequest.find({
    tripId: { $in: tripIds }
  })
  .populate('tripId', 'name location startDate endDate')
  .populate('requesterId', 'name profileImage')
  .populate('tripOwnerId', 'name profileImage')
  .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    requests
  });
};

// Get chat rooms for user
const getMyChatRooms = async (req, res) => {
  const userId = req.user._id;

  const chatRooms = await ChatRoom.find({
    participants: userId,
    isActive: true
  })
  .populate('tripId', 'name location startDate endDate')
  .populate('tripOwnerId', 'name profileImage')
  .populate('participants', 'name profileImage')
  .sort({ lastMessageAt: -1 });

  res.json({
    status: 'success',
    chatRooms
  });
};

// Delete chat room (only by trip owner)
const deleteChatRoom = async (req, res) => {
  const { chatRoomId } = req.params;
  const userId = req.user._id;

  const chatRoom = await ChatRoom.findById(chatRoomId);

  if (!chatRoom) {
    throw new NotFoundError('Chat room not found');
  }

  // Verify user is the trip owner
  if (chatRoom.tripOwnerId.toString() !== userId.toString()) {
    throw new ValidationError('Not authorized to delete this chat room');
  }

  // Deactivate the chat room instead of deleting it
  chatRoom.isActive = false;
  await chatRoom.save();

  res.json({
    status: 'success',
    message: 'Chat room has been closed'
  });
};

module.exports = {
  sendTripJoinRequest,
  getTripJoinRequests,
  acceptTripJoinRequest,
  rejectTripJoinRequest,
  getMyTripRequests,
  getMyTripRequestsAsOwner,
  getMyChatRooms,
  deleteChatRoom
};
