// Simple startup script for WanderBlocks backend
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderblocks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/map', require('./routes/map'));
app.use('/api/itineraries', require('./routes/itineraries'));
app.use('/api/blocks', require('./routes/blocks'));
app.use('/api/requests', require('./routes/requests'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'WanderBlocks API is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 WanderBlocks API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
