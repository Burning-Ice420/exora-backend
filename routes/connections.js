const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const connectionController = require('../controllers/connectionController');

// Get user's connections
router.get('/', verifyToken, catchAsync(connectionController.getConnections));

// Send connection request
router.post('/:userId/request', verifyToken, catchAsync(connectionController.sendConnectionRequest));

// Accept connection request
router.post('/:connectionId/accept', verifyToken, catchAsync(connectionController.acceptConnectionRequest));

// Reject connection request
router.post('/:connectionId/reject', verifyToken, catchAsync(connectionController.rejectConnectionRequest));

module.exports = router;
