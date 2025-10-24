const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/environment');

const createIndexes = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create geospatial index for User location
    await User.collection.createIndex({ location: '2dsphere' });
    console.log('✅ Created geospatial index for User location');

    // Create other useful indexes
    await User.collection.createIndex({ email: 1 });
    console.log('✅ Created email index');

    await User.collection.createIndex({ isMapPublic: 1 });
    console.log('✅ Created isMapPublic index');

    await User.collection.createIndex({ interests: 1 });
    console.log('✅ Created interests index');

    await User.collection.createIndex({ age: 1 });
    console.log('✅ Created age index');

    await User.collection.createIndex({ gender: 1 });
    console.log('✅ Created gender index');

    console.log('🎉 All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();
