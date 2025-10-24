const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Import configurations and middleware
const config = require('./config/environment');
const connectDB = require('./config/database');
const { apiLimiter, authLimiter, corsOptions, securityHeaders } = require('./middleware/security');
const { requestLogger, errorLogger } = require('./middleware/logging');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(compression());

// CORS
app.use(require('cors')(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/signup', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/map', require('./routes/map'));
app.use('/api/itineraries', require('./routes/itineraries'));
app.use('/api/blocks', require('./routes/blocks'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/uploads', require('./routes/uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'WanderBlocks API is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorLogger);
app.use(globalErrorHandler);

const PORT = config.PORT;
const HOST = config.HOST;

app.listen(PORT, HOST, () => {
  console.log(`🚀 WanderBlocks API running on ${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌍 Environment: ${config.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
