const mongoose = require('mongoose');
require('dotenv').config();

async function dropGeoIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/exora');
    console.log('Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get current indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the 2dsphere index if it exists
    try {
      await usersCollection.dropIndex('location_2dsphere');
      console.log('✅ Dropped location_2dsphere index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  location_2dsphere index does not exist');
      } else {
        console.log('❌ Error dropping index:', error.message);
      }
    }

    // Create a text index for location search
    try {
      await usersCollection.createIndex({ location: 'text' });
      console.log('✅ Created text index for location search');
    } catch (error) {
      console.log('❌ Error creating text index:', error.message);
    }

    // Get updated indexes
    const updatedIndexes = await usersCollection.indexes();
    console.log('Updated indexes:', updatedIndexes.map(idx => ({ name: idx.name, key: idx.key })));

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

dropGeoIndex();
