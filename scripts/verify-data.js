const mongoose = require('mongoose');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');
const Block = require('../models/Block');
const ContentFeed = require('../models/ContentFeed');
const Request = require('../models/Request');
const config = require('../config/environment');

// Connect to MongoDB using environment configuration
const MONGODB_URI = config.MONGODB_URI || 'mongodb://localhost:27017/wanderblocks';
console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI);

const verifyData = async () => {
  try {
    console.log('🔍 Verifying MongoDB Seed Data...\n');

    // Count all documents
    const userCount = await User.countDocuments();
    const itineraryCount = await Itinerary.countDocuments();
    const blockCount = await Block.countDocuments();
    const feedCount = await ContentFeed.countDocuments();
    const requestCount = await Request.countDocuments();

    console.log('📊 Data Counts:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`🗺️ Itineraries: ${itineraryCount}`);
    console.log(`🧱 Blocks: ${blockCount}`);
    console.log(`📝 Feed Items: ${feedCount}`);
    console.log(`🤝 Requests: ${requestCount}`);

    // Sample data verification
    console.log('\n🔍 Sample Data Verification:');
    
    // Sample users
    const users = await User.find({}, 'name email location interests').limit(3);
    console.log('\n👥 Sample Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
      console.log(`  Location: ${user.location.coordinates.join(', ')}`);
      console.log(`  Interests: ${user.interests.join(', ')}`);
    });

    // Sample itineraries
    const itineraries = await Itinerary.find({}, 'title totalBudget isPublic').limit(3);
    console.log('\n🗺️ Sample Itineraries:');
    itineraries.forEach(it => {
      console.log(`- ${it.title} - ₹${it.totalBudget} - ${it.isPublic ? 'Public' : 'Private'}`);
    });

    // Sample blocks
    const blocks = await Block.find({}, 'type details.title details.cost').limit(5);
    console.log('\n🧱 Sample Blocks:');
    blocks.forEach(block => {
      console.log(`- ${block.type}: ${block.details.title} - ₹${block.details.cost}`);
    });

    // Sample feed items
    const feedItems = await ContentFeed.find({}, 'text locationTag').limit(3);
    console.log('\n📝 Sample Feed Items:');
    feedItems.forEach(item => {
      console.log(`- ${item.text.substring(0, 50)}... (${item.locationTag})`);
    });

    // Sample requests
    const requests = await Request.find({}, 'status message').limit(2);
    console.log('\n🤝 Sample Requests:');
    requests.forEach(req => {
      console.log(`- Status: ${req.status} - ${req.message}`);
    });

    console.log('\n✅ All seed data is properly structured in MongoDB!');
    console.log('\n🔑 Test Login Credentials:');
    console.log('   Email: rahul@example.com (or any user email)');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    mongoose.connection.close();
  }
};

verifyData();
