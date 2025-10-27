const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const Connection = require('../models/Connection');

// Get user's connections
const getConnections = async (req, res) => {
  const userConnections = await Connection.find({
    $or: [
      { userId: req.user._id },
      { connectedUserId: req.user._id }
    ]
  })
  .populate('userId', 'name profileImage')
  .populate('connectedUserId', 'name profileImage')
  .sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    connections: userConnections
  });
};

// Send connection request
const sendConnectionRequest = async (req, res) => {
  const targetUserId = req.params.userId;
  
  if (targetUserId === req.user._id) {
    throw new ValidationError('Cannot connect with yourself');
  }
  
  // Check if connection already exists
  const existingConnection = await Connection.findOne({
    $or: [
      { userId: req.user._id, connectedUserId: targetUserId },
      { userId: targetUserId, connectedUserId: req.user._id }
    ]
  });
  
  if (existingConnection) {
    throw new ValidationError('Connection already exists');
  }
  
  const newConnection = new Connection({
    userId: req.user._id,
    connectedUserId: targetUserId,
    status: 'pending'
  });
  
  await newConnection.save();
  
  // Populate user data for response
  await newConnection.populate('userId', 'name profileImage');
  await newConnection.populate('connectedUserId', 'name profileImage');
  
  res.status(201).json({
    status: 'success',
    connection: newConnection
  });
};

// Accept connection request
const acceptConnectionRequest = async (req, res) => {
  const connectionId = req.params.connectionId;
  const connection = await Connection.findOne({
    _id: connectionId,
    connectedUserId: req.user._id,
    status: 'pending'
  });
  
  if (!connection) {
    throw new NotFoundError('Connection request not found');
  }
  
  connection.status = 'accepted';
  connection.acceptedAt = new Date();
  await connection.save();
  
  // Populate user data for response
  await connection.populate('userId', 'name profileImage');
  await connection.populate('connectedUserId', 'name profileImage');
  
  res.json({
    status: 'success',
    connection
  });
};

// Reject connection request
const rejectConnectionRequest = async (req, res) => {
  const connectionId = req.params.connectionId;
  const connection = await Connection.findOne({
    _id: connectionId,
    connectedUserId: req.user._id,
    status: 'pending'
  });
  
  if (!connection) {
    throw new NotFoundError('Connection request not found');
  }
  
  connection.status = 'rejected';
  connection.rejectedAt = new Date();
  await connection.save();
  
  // Populate user data for response
  await connection.populate('userId', 'name profileImage');
  await connection.populate('connectedUserId', 'name profileImage');
  
  res.json({
    status: 'success',
    connection
  });
};

module.exports = {
  getConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest
};
