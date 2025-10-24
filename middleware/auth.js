const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AuthenticationError, AuthorizationError } = require('./errorHandler');
const config = require('../config/environment');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      throw new AuthenticationError('Invalid token. User not found.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token.'));
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired.'));
    } else {
      next(error);
    }
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user is authorized to access resource
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required.'));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions.'));
    }

    next();
  };
};

// Check if user owns the resource
const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return next(new NotFoundError('Resource not found.'));
      }

      // Check if user owns the resource
      if (resource.userId && resource.userId.toString() !== req.user._id.toString()) {
        return next(new AuthorizationError('Access denied. You can only access your own resources.'));
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  verifyToken,
  optionalAuth,
  authorize,
  checkOwnership,
};
