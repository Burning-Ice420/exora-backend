const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

// Mock data for now - replace with actual database operations
let connections = [];

// Get user's connections
const getConnections = async (req, res) => {
  const userConnections = connections.filter(conn => 
    conn.userId === req.user._id || conn.connectedUserId === req.user._id
  );
  
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
  const existingConnection = connections.find(conn => 
    (conn.userId === req.user._id && conn.connectedUserId === targetUserId) ||
    (conn.userId === targetUserId && conn.connectedUserId === req.user._id)
  );
  
  if (existingConnection) {
    throw new ValidationError('Connection already exists');
  }
  
  const newConnection = {
    id: (connections.length + 1).toString(),
    userId: req.user._id,
    connectedUserId: targetUserId,
    status: 'pending',
    createdAt: new Date()
  };
  
  connections.push(newConnection);
  
  res.status(201).json({
    status: 'success',
    connection: newConnection
  });
};

// Accept connection request
const acceptConnectionRequest = async (req, res) => {
  const connectionId = req.params.connectionId;
  const connection = connections.find(conn => 
    conn.id === connectionId && conn.connectedUserId === req.user._id
  );
  
  if (!connection) {
    throw new NotFoundError('Connection request not found');
  }
  
  connection.status = 'accepted';
  connection.acceptedAt = new Date();
  
  res.json({
    status: 'success',
    connection
  });
};

module.exports = {
  getConnections,
  sendConnectionRequest,
  acceptConnectionRequest
};
