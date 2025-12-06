const { AuthenticationError } = require('./errorHandler');

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_TOKEN = 'admin-secure-token-2024';

// Admin login handler
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return res.json({
        status: 'success',
        message: 'Admin login successful',
        token: ADMIN_TOKEN,
        admin: { username: ADMIN_USERNAME }
      });
    } else {
      throw new AuthenticationError('Invalid admin credentials');
    }
  } catch (error) {
    next(error);
  }
};

// Verify admin token
const verifyAdmin = (req, res, next) => {
  try {
    // Skip verification for login endpoint
    if (req.path === '/login' && req.method === 'POST') {
      return next();
    }
    
    // Check Authorization header
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      if (token === ADMIN_TOKEN) {
        req.admin = { username: ADMIN_USERNAME };
        return next();
      }
    }
    
    // Check for admin token in body (for some requests)
    if (req.body && req.body.adminToken === ADMIN_TOKEN) {
      req.admin = { username: ADMIN_USERNAME };
      return next();
    }
    
    // Check for admin session cookie (if cookie-parser is available)
    if (req.cookies && req.cookies.adminToken === ADMIN_TOKEN) {
      req.admin = { username: ADMIN_USERNAME };
      return next();
    }
    
    throw new AuthenticationError('Admin authentication required');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyAdmin,
  adminLogin
};

