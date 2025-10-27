const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const tripRequestController = require('../controllers/tripRequestController');

// Send trip join request
router.post('/:tripId/request', verifyToken, catchAsync(tripRequestController.sendTripJoinRequest));

// Get trip join requests (for trip owner)
router.get('/:tripId/requests', verifyToken, catchAsync(tripRequestController.getTripJoinRequests));

// Accept trip join request
router.post('/requests/:requestId/accept', verifyToken, catchAsync(tripRequestController.acceptTripJoinRequest));

// Reject trip join request
router.post('/requests/:requestId/reject', verifyToken, catchAsync(tripRequestController.rejectTripJoinRequest));

// Get user's sent requests
router.get('/my-requests', verifyToken, catchAsync(tripRequestController.getMyTripRequests));

// Get trip requests for trips owned by user
router.get('/my-trips-requests', verifyToken, catchAsync(tripRequestController.getMyTripRequestsAsOwner));

// Get user's chat rooms
router.get('/my-chat-rooms', verifyToken, catchAsync(tripRequestController.getMyChatRooms));

// Delete chat room (only by trip owner)
router.delete('/chat-rooms/:chatRoomId', verifyToken, catchAsync(tripRequestController.deleteChatRoom));

module.exports = router;
