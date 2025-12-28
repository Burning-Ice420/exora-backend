const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const TripRequest = require('../models/TripRequest');
const Trip = require('../models/Trip');
const ChatRoom = require('../models/ChatRoom');
const { v4: uuidv4 } = require('uuid');

// Send trip join request
const sendTripJoinRequest = async (req, res) => {
  const { tripId } = req.params;
  const { message, selectedItineraries } = req.body;
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
    requesterId,
    status: 'pending'
  });

  if (existingRequest) {
    throw new ValidationError('Join request already sent');
  }

  // Validate selected itineraries if provided
  let validatedItineraries = [];
  if (selectedItineraries && Array.isArray(selectedItineraries) && selectedItineraries.length > 0) {
    // Validate that all selected itinerary IDs exist in the trip
    const tripItineraryIds = trip.itinerary.map(item => item.id || item._id?.toString());
    validatedItineraries = selectedItineraries
      .filter(itineraryId => tripItineraryIds.includes(itineraryId))
      .map(itineraryId => {
        const itineraryItem = trip.itinerary.find(item => (item.id || item._id?.toString()) === itineraryId);
        if (itineraryItem) {
          return {
            itineraryId: itineraryId,
            experienceName: itineraryItem.experienceName || itineraryItem.name,
            day: itineraryItem.day,
            startTime: itineraryItem.startTime,
            endTime: itineraryItem.endTime
          };
        }
        return null;
      })
      .filter(item => item !== null);
  }

  // Create new request
  const tripRequest = new TripRequest({
    tripId,
    requesterId,
    tripOwnerId: trip.createdBy,
    message: message || '',
    selectedItineraries: validatedItineraries
  });

  await tripRequest.save();

  // Populate user data (for requester, we'll show limited info in get requests)
  await tripRequest.populate('requesterId', 'name exoraSpells');
  await tripRequest.populate('tripOwnerId', 'name profileImage');

  // Return privacy-filtered request for requester
  const requester = tripRequest.requesterId;
  const requesterObj = requester.toObject ? requester.toObject() : requester;
  
  const privacyFilteredRequest = {
    ...tripRequest.toObject(),
    requesterId: {
      _id: requesterObj._id,
      initials: getInitials(requesterObj.name),
      exoraSpells: requesterObj.exoraSpells || 0
    }
  };

  res.status(201).json({
    status: 'success',
    request: privacyFilteredRequest
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
  .populate('requesterId', 'name exoraSpells')
  .sort({ createdAt: -1 });

  // Transform requests to show only initials + spells (privacy-first)
  const privacyFilteredRequests = requests.map(request => {
    const requester = request.requesterId;
    const requesterObj = requester.toObject ? requester.toObject() : requester;
    
    return {
      _id: request._id,
      tripId: request.tripId,
      message: request.message,
      selectedItineraries: request.selectedItineraries,
      status: request.status,
      createdAt: request.createdAt,
      requester: {
        _id: requesterObj._id,
        initials: getInitials(requesterObj.name),
        exoraSpells: requesterObj.exoraSpells || 0
        // No name, no profile image - privacy first
      }
    };
  });

  res.json({
    status: 'success',
    requests: privacyFilteredRequests
  });
};

// Helper function to get user initials
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

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

  // Add user to trip members if not already added
  const trip = await Trip.findById(request.tripId._id);
  if (!trip.membersInvolved.includes(request.requesterId._id)) {
    trip.membersInvolved.push(request.requesterId._id);
  }

  // Add user to selected itineraries as participants
  if (request.selectedItineraries && request.selectedItineraries.length > 0) {
    request.selectedItineraries.forEach(selectedItinerary => {
      // Check if user is already a participant for this itinerary
      const existingParticipant = trip.itineraryParticipants.find(
        p => p.itineraryId === selectedItinerary.itineraryId && 
        p.userId.toString() === request.requesterId._id.toString()
      );

      if (!existingParticipant) {
        trip.itineraryParticipants.push({
          itineraryId: selectedItinerary.itineraryId,
          userId: request.requesterId._id,
          joinedAt: new Date()
        });
      }
    });
  }

  await trip.save();

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

  // Populate itinerary participants for response
  await trip.populate('itineraryParticipants.userId', 'name profileImage');

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
  .select('+selectedItineraries') // Ensure selectedItineraries is included
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

// Check if user has already sent a request for a trip
const checkUserRequest = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  const request = await TripRequest.findOne({
    tripId,
    requesterId: userId
  })
  .populate('requesterId', 'name profileImage')
  .sort({ createdAt: -1 });

  if (request) {
    res.json({
      status: 'success',
      hasRequest: true,
      request: {
        _id: request._id,
        status: request.status,
        message: request.message,
        selectedItineraries: request.selectedItineraries,
        createdAt: request.createdAt
      }
    });
  } else {
    res.json({
      status: 'success',
      hasRequest: false
    });
  }
};

// Get itinerary participants for a trip (for trip owner)
const getItineraryParticipants = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user._id;

  // Verify trip exists and user owns it
  const trip = await Trip.findById(tripId)
    .populate('itineraryParticipants.userId', 'name profileImage');

  if (!trip) {
    throw new NotFoundError('Trip not found');
  }

  if (trip.createdBy.toString() !== userId.toString()) {
    throw new ValidationError('Not authorized to view itinerary participants for this trip');
  }

  // Group participants by itinerary
  const participantsByItinerary = {};
  
  trip.itineraryParticipants.forEach(participant => {
    const itineraryId = participant.itineraryId;
    if (!participantsByItinerary[itineraryId]) {
      participantsByItinerary[itineraryId] = [];
    }
    participantsByItinerary[itineraryId].push({
      userId: participant.userId._id,
      name: participant.userId.name,
      profileImage: participant.userId.profileImage,
      joinedAt: participant.joinedAt
    });
  });

  // Map to itinerary structure with participants
  const itineraryWithParticipants = trip.itinerary.map(item => {
    const itineraryId = item.id || item._id?.toString();
    return {
      ...item.toObject(),
      participants: participantsByItinerary[itineraryId] || []
    };
  });

  res.json({
    status: 'success',
    tripId: trip._id,
    tripName: trip.name,
    itineraries: itineraryWithParticipants
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
  deleteChatRoom,
  getItineraryParticipants,
  checkUserRequest
};
