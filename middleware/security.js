const rateLimit = require('express-rate-limit');

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Rate limiting disabled for development
const apiLimiter = (req, res, next) => next();
const authLimiter = (req, res, next) => next();


module.exports = {
  apiLimiter,
  authLimiter,
};
