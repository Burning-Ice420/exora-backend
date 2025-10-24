const mongoose = require('mongoose');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');
const Block = require('../models/Block');
const ContentFeed = require('../models/ContentFeed');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderblocks');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Itinerary.deleteMany({});
    await Block.deleteMany({});
    await ContentFeed.deleteMany({});

    // Goa-centric users
    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        email: 'rahul@example.com',
        passwordHash: defaultPassword,
        name: 'Rahul Nair',
        bio: 'Beach lover and foodie exploring Goas hidden gems 🏖️',
        age: 27,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1603415526960-f7e0328d13cd?w=150',
        location: {
          type: 'Point',
          coordinates: [73.7684, 15.4989] // Panaji
        },
        interests: ['Food', 'Photography', 'Nightlife', 'Beach'],
        budgetPreference: { min: 50, max: 300 },
        isMapPublic: true
      },
      {
        email: 'aisha@example.com',
        passwordHash: defaultPassword,
        name: 'Aisha Khan',
        bio: 'History buff wandering around forts and churches 🏰',
        age: 29,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=150',
        location: {
          type: 'Point',
          coordinates: [73.7413, 15.3920] // Old Goa area
        },
        interests: ['Culture', 'Art', 'Walking', 'History'],
        budgetPreference: { min: 100, max: 500 },
        isMapPublic: true
      },
      {
        email: 'vikram@example.com',
        passwordHash: defaultPassword,
        name: 'Vikram Desai',
        bio: 'Surfer chasing the best swells in North Goa 🏄',
        age: 24,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150',
        location: {
          type: 'Point',
          coordinates: [73.7360, 15.5556] // Anjuna/Vagator
        },
        interests: ['Surfing', 'Adventure', 'Music', 'Beach'],
        budgetPreference: { min: 150, max: 800 },
        isMapPublic: true
      }
    ];

    const createdUsers = await User.insertMany(users);

    // Create sample itineraries
    const itineraries = [
      {
        userId: createdUsers[0]._id,
        title: 'North Goa Chill Weekend',
        totalBudget: 400,
        isPublic: true,
        departureDate: new Date('2025-11-15'),
        arrivalDate: new Date('2025-11-17'),
        blocks: []
      },
      {
        userId: createdUsers[1]._id,
        title: 'Old Goa Heritage Day',
        totalBudget: 300,
        isPublic: true,
        departureDate: new Date('2025-11-20'),
        arrivalDate: new Date('2025-11-20'),
        blocks: []
      }
    ];

    const createdItineraries = await Itinerary.insertMany(itineraries);

    // Create sample blocks
    const blocks = [
      {
        itineraryId: createdItineraries[0]._id,
        type: 'Accommodation',
        date: new Date('2025-11-15'),
        time: '13:00',
        details: {
          title: 'Calangute Beach Shack Stay',
          description: 'Cozy beachside hut near Calangute with sea view',
          cost: 80,
          hotelName: 'Sandy Toes Shack',
          checkIn: '13:00',
          checkOut: '11:00'
        },
        isJoinable: true,
        tags: ['Beach', 'Budget', 'Stay']
      },
      {
        itineraryId: createdItineraries[0]._id,
        type: 'Activity',
        date: new Date('2025-11-16'),
        time: '07:00',
        details: {
          title: 'Dudhsagar Waterfall Day Trip',
          description: 'Early start jeep safari and trek to the falls',
          cost: 35,
          duration: '6 hours',
          activityType: 'Hiking',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Nature', 'Trek', 'Waterfall']
      },
      {
        itineraryId: createdItineraries[0]._id,
        type: 'Activity',
        date: new Date('2025-11-16'),
        time: '19:30',
        details: {
          title: 'Baga Nightlife Crawl',
          description: 'Music, food, and beach vibes across 3 spots',
          cost: 20,
          duration: '3 hours',
          activityType: 'Nightlife',
          difficulty: 'Beginner'
        },
        isJoinable: true,
        tags: ['Nightlife', 'Music', 'Food']
      },
      {
        itineraryId: createdItineraries[1]._id,
        type: 'Activity',
        date: new Date('2025-11-20'),
        time: '10:00',
        details: {
          title: 'Basilica of Bom Jesus & Se Cathedral',
          description: 'Guided heritage tour through Old Goa churches',
          cost: 10,
          duration: '2 hours',
          activityType: 'Culture',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Culture', 'Heritage', 'Walking']
      }
    ];

    const createdBlocks = await Block.insertMany(blocks);

    // Update itineraries with block references
    await Itinerary.findByIdAndUpdate(createdItineraries[0]._id, {
      blocks: [createdBlocks[0]._id, createdBlocks[1]._id, createdBlocks[2]._id]
    });

    await Itinerary.findByIdAndUpdate(createdItineraries[1]._id, {
      blocks: [createdBlocks[3]._id]
    });

    // Goa-centric feed content
    const feedContent = [
      {
        userId: createdUsers[0]._id,
        type: 'Post',
        text: 'Sunset at Calangute was unreal today 🌅 #Goa #Beach',
        locationTag: 'Calangute, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[1]._id,
        type: 'Itinerary',
        text: 'Old Goa heritage trail this Thursday. Join for a slow walk! 🏛️',
        itineraryRef: createdItineraries[1]._id,
        locationTag: 'Old Goa, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[2]._id,
        type: 'Post',
        text: 'Caught perfect waves at Anjuna this morning 🏄 #Surfing #Goa',
        locationTag: 'Anjuna, Goa',
        timestamp: new Date()
      }
    ];

    await ContentFeed.insertMany(feedContent);

    console.log('✅ Seed data created successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${createdItineraries.length} itineraries`);
    console.log(`Created ${createdBlocks.length} blocks`);
    console.log(`Created ${feedContent.length} feed items`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
