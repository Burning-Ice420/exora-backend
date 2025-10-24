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

const seedData = async () => {
  try {
    console.log('🌱 Starting enhanced seed data creation...');
    
    // Clear existing data
    await User.deleteMany({});
    await Itinerary.deleteMany({});
    await Block.deleteMany({});
    await ContentFeed.deleteMany({});
    await Request.deleteMany({});

    const bcrypt = require('bcryptjs');
    const defaultPassword = await bcrypt.hash('password123', 10);
    
    // Create 15 diverse users with Goa-centric data
    const users = [
      {
        email: 'rahul@example.com',
        passwordHash: defaultPassword,
        name: 'Rahul Nair',
        bio: 'Beach lover and foodie exploring Goas hidden gems 🏖️',
        age: 27,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1603415526960-f7e0328d13cd?w=150',
        location: { type: 'Point', coordinates: [73.7684, 15.4989] }, // Panaji
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
        location: { type: 'Point', coordinates: [73.7413, 15.3920] }, // Old Goa
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
        location: { type: 'Point', coordinates: [73.7360, 15.5556] }, // Anjuna
        interests: ['Surfing', 'Adventure', 'Music', 'Beach'],
        budgetPreference: { min: 150, max: 800 },
        isMapPublic: true
      },
      {
        email: 'priya@example.com',
        passwordHash: defaultPassword,
        name: 'Priya Sharma',
        bio: 'Yoga instructor finding peace in Goas spiritual side 🧘‍♀️',
        age: 31,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        location: { type: 'Point', coordinates: [73.7550, 15.4000] }, // Arambol
        interests: ['Wellness', 'Yoga', 'Nature', 'Meditation'],
        budgetPreference: { min: 200, max: 600 },
        isMapPublic: true
      },
      {
        email: 'arjun@example.com',
        passwordHash: defaultPassword,
        name: 'Arjun Patel',
        bio: 'Food blogger hunting for the best Goan cuisine 🍛',
        age: 26,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        location: { type: 'Point', coordinates: [73.7500, 15.4500] }, // Mapusa
        interests: ['Food', 'Culture', 'Photography', 'Local'],
        budgetPreference: { min: 100, max: 400 },
        isMapPublic: true
      },
      {
        email: 'sophia@example.com',
        passwordHash: defaultPassword,
        name: 'Sophia Chen',
        bio: 'Digital nomad working from Goas cafes ☕',
        age: 28,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        location: { type: 'Point', coordinates: [73.7600, 15.5000] }, // Baga
        interests: ['Work', 'Coffee', 'Networking', 'Travel'],
        budgetPreference: { min: 300, max: 1000 },
        isMapPublic: true
      },
      {
        email: 'marcus@example.com',
        passwordHash: defaultPassword,
        name: 'Marcus Johnson',
        bio: 'Music producer exploring Goas electronic scene 🎵',
        age: 32,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        location: { type: 'Point', coordinates: [73.7400, 15.5200] }, // Vagator
        interests: ['Music', 'Nightlife', 'Art', 'Technology'],
        budgetPreference: { min: 200, max: 700 },
        isMapPublic: true
      },
      {
        email: 'meera@example.com',
        passwordHash: defaultPassword,
        name: 'Meera Singh',
        bio: 'Solo traveler discovering hidden beaches and local culture 🏝️',
        age: 25,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        location: { type: 'Point', coordinates: [73.7200, 15.3500] }, // South Goa
        interests: ['Solo Travel', 'Beach', 'Culture', 'Adventure'],
        budgetPreference: { min: 150, max: 500 },
        isMapPublic: true
      },
      {
        email: 'david@example.com',
        passwordHash: defaultPassword,
        name: 'David Wilson',
        bio: 'Photographer capturing Goas vibrant street life 📸',
        age: 30,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        location: { type: 'Point', coordinates: [73.7800, 15.4500] }, // Margao
        interests: ['Photography', 'Art', 'Street', 'Culture'],
        budgetPreference: { min: 200, max: 600 },
        isMapPublic: true
      },
      {
        email: 'kavya@example.com',
        passwordHash: defaultPassword,
        name: 'Kavya Reddy',
        bio: 'Fitness enthusiast exploring Goas outdoor activities 💪',
        age: 23,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        location: { type: 'Point', coordinates: [73.7300, 15.4800] }, // Candolim
        interests: ['Fitness', 'Adventure', 'Sports', 'Nature'],
        budgetPreference: { min: 100, max: 400 },
        isMapPublic: true
      },
      {
        email: 'alex@example.com',
        passwordHash: defaultPassword,
        name: 'Alex Thompson',
        bio: 'Backpacker on a budget exploring Indias coastal paradise 🎒',
        age: 22,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        location: { type: 'Point', coordinates: [73.7100, 15.4000] }, // Palolem
        interests: ['Budget Travel', 'Backpacking', 'Adventure', 'Meeting People'],
        budgetPreference: { min: 50, max: 200 },
        isMapPublic: true
      },
      {
        email: 'nina@example.com',
        passwordHash: defaultPassword,
        name: 'Nina Rodriguez',
        bio: 'Art lover exploring Goas galleries and creative spaces 🎨',
        age: 29,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150',
        location: { type: 'Point', coordinates: [73.7700, 15.4200] }, // Fontainhas
        interests: ['Art', 'Culture', 'Creative', 'Local'],
        budgetPreference: { min: 200, max: 600 },
        isMapPublic: true
      },
      {
        email: 'raj@example.com',
        passwordHash: defaultPassword,
        name: 'Raj Kumar',
        bio: 'Local guide sharing authentic Goan experiences 🗺️',
        age: 35,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150',
        location: { type: 'Point', coordinates: [73.7500, 15.5000] }, // Central Goa
        interests: ['Local', 'Culture', 'History', 'Food'],
        budgetPreference: { min: 100, max: 300 },
        isMapPublic: true
      },
      {
        email: 'lisa@example.com',
        passwordHash: defaultPassword,
        name: 'Lisa Anderson',
        bio: 'Wellness retreat organizer promoting mindful travel 🧘‍♀️',
        age: 33,
        gender: 'Female',
        profilePicUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150',
        location: { type: 'Point', coordinates: [73.7400, 15.3800] }, // Assagao
        interests: ['Wellness', 'Retreat', 'Mindfulness', 'Nature'],
        budgetPreference: { min: 300, max: 800 },
        isMapPublic: true
      },
      {
        email: 'suresh@example.com',
        passwordHash: defaultPassword,
        name: 'Suresh Nair',
        bio: 'Tech entrepreneur building connections in Goas startup scene 💻',
        age: 28,
        gender: 'Male',
        profilePicUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        location: { type: 'Point', coordinates: [73.7600, 15.4800] }, // Porvorim
        interests: ['Technology', 'Networking', 'Business', 'Innovation'],
        budgetPreference: { min: 400, max: 1200 },
        isMapPublic: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create Goa-centric itineraries with authentic experiences
    const itineraries = [
      {
        userId: createdUsers[0]._id,
        title: 'North Goa Beach & Party Weekend',
        totalBudget: 400,
        isPublic: true,
        departureDate: new Date('2024-12-15'),
        arrivalDate: new Date('2024-12-17'),
        blocks: []
      },
      {
        userId: createdUsers[1]._id,
        title: 'Old Goa Heritage & Churches Tour',
        totalBudget: 300,
        isPublic: true,
        departureDate: new Date('2024-12-20'),
        arrivalDate: new Date('2024-12-20'),
        blocks: []
      },
      {
        userId: createdUsers[2]._id,
        title: 'Anjuna Surf & Adventure Week',
        totalBudget: 800,
        isPublic: true,
        departureDate: new Date('2024-12-10'),
        arrivalDate: new Date('2024-12-17'),
        blocks: []
      },
      {
        userId: createdUsers[3]._id,
        title: 'Arambol Yoga & Wellness Retreat',
        totalBudget: 600,
        isPublic: true,
        departureDate: new Date('2024-12-25'),
        arrivalDate: new Date('2024-12-30'),
        blocks: []
      },
      {
        userId: createdUsers[4]._id,
        title: 'Authentic Goan Food Trail',
        totalBudget: 350,
        isPublic: true,
        departureDate: new Date('2024-12-18'),
        arrivalDate: new Date('2024-12-22'),
        blocks: []
      },
      {
        userId: createdUsers[5]._id,
        title: 'Baga Digital Nomad Workation',
        totalBudget: 1000,
        isPublic: true,
        departureDate: new Date('2024-12-01'),
        arrivalDate: new Date('2024-12-31'),
        blocks: []
      },
      {
        userId: createdUsers[6]._id,
        title: 'Vagator Music & Trance Experience',
        totalBudget: 700,
        isPublic: true,
        departureDate: new Date('2024-12-28'),
        arrivalDate: new Date('2025-01-02'),
        blocks: []
      },
      {
        userId: createdUsers[7]._id,
        title: 'South Goa Hidden Beaches Discovery',
        totalBudget: 500,
        isPublic: true,
        departureDate: new Date('2024-12-12'),
        arrivalDate: new Date('2024-12-19'),
        blocks: []
      },
      {
        userId: createdUsers[8]._id,
        title: 'Margao Street Photography Walk',
        totalBudget: 250,
        isPublic: true,
        departureDate: new Date('2024-12-14'),
        arrivalDate: new Date('2024-12-14'),
        blocks: []
      },
      {
        userId: createdUsers[9]._id,
        title: 'Candolim Water Sports Adventure',
        totalBudget: 450,
        isPublic: true,
        departureDate: new Date('2024-12-16'),
        arrivalDate: new Date('2024-12-18'),
        blocks: []
      }
    ];

    const createdItineraries = await Itinerary.insertMany(itineraries);
    console.log(`✅ Created ${createdItineraries.length} itineraries`);

    // Create Goa-centric blocks with authentic experiences
    const blocks = [
      // North Goa Beach & Party Weekend blocks
      {
        itineraryId: createdItineraries[0]._id,
        type: 'Accommodation',
        date: new Date('2024-12-15'),
        time: '13:00',
        details: {
          title: 'Calangute Beach Shack Stay',
          description: 'Traditional Goan beach shack with sea view and hammocks',
          cost: 80,
          hotelName: 'Sandy Toes Beach Shack',
          checkIn: '13:00',
          checkOut: '11:00'
        },
        isJoinable: true,
        tags: ['Beach', 'Shack', 'Traditional']
      },
      {
        itineraryId: createdItineraries[0]._id,
        type: 'Activity',
        date: new Date('2024-12-16'),
        time: '07:00',
        details: {
          title: 'Dudhsagar Waterfall Day Trip',
          description: 'Jeep safari through Bhagwan Mahavir Wildlife Sanctuary to Dudhsagar Falls',
          cost: 35,
          duration: '6 hours',
          activityType: 'Adventure',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Waterfall', 'Wildlife', 'Adventure']
      },
      {
        itineraryId: createdItineraries[0]._id,
        type: 'Activity',
        date: new Date('2024-12-16'),
        time: '19:30',
        details: {
          title: 'Baga Nightlife & Tito\'s Lane',
          description: 'Explore Baga\'s famous nightlife including Tito\'s Lane and beach shacks',
          cost: 20,
          duration: '3 hours',
          activityType: 'Nightlife',
          difficulty: 'Beginner'
        },
        isJoinable: true,
        tags: ['Nightlife', 'Baga', 'Tito\'s']
      },
      // Old Goa Heritage & Churches Tour blocks
      {
        itineraryId: createdItineraries[1]._id,
        type: 'Activity',
        date: new Date('2024-12-20'),
        time: '10:00',
        details: {
          title: 'Basilica of Bom Jesus & Se Cathedral',
          description: 'UNESCO World Heritage site tour of Old Goa\'s famous churches',
          cost: 10,
          duration: '2 hours',
          activityType: 'Heritage',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['UNESCO', 'Heritage', 'Churches']
      },
      {
        itineraryId: createdItineraries[1]._id,
        type: 'Activity',
        date: new Date('2024-12-20'),
        time: '12:30',
        details: {
          title: 'Authentic Goan Fish Curry & Rice',
          description: 'Traditional Goan lunch at local restaurant in Old Goa',
          cost: 25,
          duration: '1.5 hours',
          activityType: 'Dining',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Fish Curry', 'Traditional', 'Local']
      },
      // Anjuna Surf & Adventure Week blocks
      {
        itineraryId: createdItineraries[2]._id,
        type: 'Accommodation',
        date: new Date('2024-12-10'),
        time: '14:00',
        details: {
          title: 'Anjuna Beach Surf House',
          description: 'Surfer-friendly hostel near Anjuna Beach with board storage',
          cost: 120,
          hotelName: 'Wave Rider Surf House',
          checkIn: '14:00',
          checkOut: '11:00'
        },
        isJoinable: true,
        tags: ['Surf', 'Anjuna', 'Hostel']
      },
      {
        itineraryId: createdItineraries[2]._id,
        type: 'Activity',
        date: new Date('2024-12-11'),
        time: '06:00',
        details: {
          title: 'Anjuna Beach Surf Lesson',
          description: 'Early morning surf lesson at Anjuna Beach with local instructor',
          cost: 50,
          duration: '2 hours',
          activityType: 'Surfing',
          difficulty: 'Beginner'
        },
        isJoinable: true,
        tags: ['Surf', 'Anjuna', 'Morning']
      },
      {
        itineraryId: createdItineraries[2]._id,
        type: 'Activity',
        date: new Date('2024-12-12'),
        time: '18:00',
        details: {
          title: 'Anjuna Wednesday Flea Market',
          description: 'Explore the famous Anjuna Flea Market for souvenirs and local crafts',
          cost: 15,
          duration: '2 hours',
          activityType: 'Shopping',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Flea Market', 'Shopping', 'Local']
      },
      // Arambol Yoga & Wellness Retreat blocks
      {
        itineraryId: createdItineraries[3]._id,
        type: 'Accommodation',
        date: new Date('2024-12-25'),
        time: '15:00',
        details: {
          title: 'Arambol Beach Yoga Resort',
          description: 'Peaceful resort near Arambol Beach with yoga shala and meditation space',
          cost: 200,
          hotelName: 'Zen Garden Arambol',
          checkIn: '15:00',
          checkOut: '11:00'
        },
        isJoinable: true,
        tags: ['Yoga', 'Arambol', 'Wellness']
      },
      {
        itineraryId: createdItineraries[3]._id,
        type: 'Activity',
        date: new Date('2024-12-26'),
        time: '07:00',
        details: {
          title: 'Arambol Beach Sunrise Yoga',
          description: 'Morning yoga session on Arambol Beach with experienced instructor',
          cost: 15,
          duration: '1.5 hours',
          activityType: 'Yoga',
          difficulty: 'All Levels'
        },
        isJoinable: true,
        tags: ['Yoga', 'Sunrise', 'Arambol']
      },
      // Authentic Goan Food Trail blocks
      {
        itineraryId: createdItineraries[4]._id,
        type: 'Activity',
        date: new Date('2024-12-18'),
        time: '08:00',
        details: {
          title: 'Traditional Goan Breakfast - Poha & Chai',
          description: 'Local breakfast at Mapusa market with authentic Goan poha',
          cost: 8,
          duration: '1 hour',
          activityType: 'Dining',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Breakfast', 'Local', 'Market']
      },
      {
        itineraryId: createdItineraries[4]._id,
        type: 'Activity',
        date: new Date('2024-12-18'),
        time: '13:00',
        details: {
          title: 'Goan Fish Thali Lunch',
          description: 'Authentic Goan fish thali with curry, rice, and local vegetables',
          cost: 30,
          duration: '1.5 hours',
          activityType: 'Dining',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Fish Thali', 'Traditional', 'Lunch']
      },
      {
        itineraryId: createdItineraries[4]._id,
        type: 'Activity',
        date: new Date('2024-12-18'),
        time: '19:00',
        details: {
          title: 'Goan Pork Vindaloo & Feni',
          description: 'Traditional Goan pork vindaloo with local feni at heritage restaurant',
          cost: 45,
          duration: '2 hours',
          activityType: 'Dining',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Pork Vindaloo', 'Feni', 'Heritage']
      },
      // Baga Digital Nomad Workation blocks
      {
        itineraryId: createdItineraries[5]._id,
        type: 'Accommodation',
        date: new Date('2024-12-01'),
        time: '14:00',
        details: {
          title: 'Baga Co-working Space & Stay',
          description: 'Modern co-working space with high-speed internet near Baga Beach',
          cost: 150,
          hotelName: 'Digital Nomad Hub Baga',
          checkIn: '14:00',
          checkOut: '11:00'
        },
        isJoinable: true,
        tags: ['Co-working', 'Internet', 'Baga']
      },
      {
        itineraryId: createdItineraries[5]._id,
        type: 'Activity',
        date: new Date('2024-12-02'),
        time: '18:00',
        details: {
          title: 'Baga Beach Sunset Work Session',
          description: 'Work from beachside cafe with sunset views and good WiFi',
          cost: 25,
          duration: '3 hours',
          activityType: 'Work',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Work', 'Sunset', 'Beach']
      },
      // Vagator Music & Trance Experience blocks
      {
        itineraryId: createdItineraries[6]._id,
        type: 'Accommodation',
        date: new Date('2024-12-28'),
        time: '15:00',
        details: {
          title: 'Vagator Hilltop Music Hostel',
          description: 'Music-themed hostel near Vagator Beach with sound system and instruments',
          cost: 100,
          hotelName: 'Vagator Music Hostel',
          checkIn: '15:00',
          checkOut: '11:00'
        },
        isJoinable: true,
        tags: ['Music', 'Vagator', 'Hostel']
      },
      {
        itineraryId: createdItineraries[6]._id,
        type: 'Activity',
        date: new Date('2024-12-29'),
        time: '22:00',
        details: {
          title: 'Vagator Trance Party Night',
          description: 'Experience Goa\'s famous trance music scene at Vagator Beach',
          cost: 40,
          duration: '6 hours',
          activityType: 'Music',
          difficulty: 'Beginner'
        },
        isJoinable: true,
        tags: ['Trance', 'Music', 'Vagator']
      },
      // South Goa Hidden Beaches Discovery blocks
      {
        itineraryId: createdItineraries[7]._id,
        type: 'Activity',
        date: new Date('2024-12-12'),
        time: '08:00',
        details: {
          title: 'Palolem Beach Discovery',
          description: 'Explore the beautiful crescent-shaped Palolem Beach in South Goa',
          cost: 20,
          duration: '4 hours',
          activityType: 'Beach',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Palolem', 'Beach', 'South Goa']
      },
      {
        itineraryId: createdItineraries[7]._id,
        type: 'Activity',
        date: new Date('2024-12-13'),
        time: '09:00',
        details: {
          title: 'Agonda Beach & Turtle Spotting',
          description: 'Visit Agonda Beach and try to spot Olive Ridley turtles',
          cost: 25,
          duration: '3 hours',
          activityType: 'Nature',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Agonda', 'Turtles', 'Nature']
      },
      // Margao Street Photography Walk blocks
      {
        itineraryId: createdItineraries[8]._id,
        type: 'Activity',
        date: new Date('2024-12-14'),
        time: '10:00',
        details: {
          title: 'Margao Market Street Photography',
          description: 'Capture the vibrant life of Margao\'s local markets and streets',
          cost: 15,
          duration: '3 hours',
          activityType: 'Photography',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Photography', 'Margao', 'Street']
      },
      // Candolim Water Sports Adventure blocks
      {
        itineraryId: createdItineraries[9]._id,
        type: 'Activity',
        date: new Date('2024-12-16'),
        time: '09:00',
        details: {
          title: 'Candolim Beach Water Sports',
          description: 'Jet skiing, parasailing, and banana boat rides at Candolim Beach',
          cost: 60,
          duration: '2 hours',
          activityType: 'Water Sports',
          difficulty: 'Moderate'
        },
        isJoinable: true,
        tags: ['Water Sports', 'Candolim', 'Adventure']
      },
      {
        itineraryId: createdItineraries[9]._id,
        type: 'Activity',
        date: new Date('2024-12-17'),
        time: '14:00',
        details: {
          title: 'Candolim Beach Volleyball',
          description: 'Join locals for beach volleyball at Candolim Beach',
          cost: 10,
          duration: '1.5 hours',
          activityType: 'Sports',
          difficulty: 'Easy'
        },
        isJoinable: true,
        tags: ['Volleyball', 'Beach', 'Sports']
      }
    ];

    const createdBlocks = await Block.insertMany(blocks);
    console.log(`✅ Created ${createdBlocks.length} blocks`);

    // Update itineraries with block references
    await Itinerary.findByIdAndUpdate(createdItineraries[0]._id, {
      blocks: [createdBlocks[0]._id, createdBlocks[1]._id, createdBlocks[2]._id]
    });

    await Itinerary.findByIdAndUpdate(createdItineraries[1]._id, {
      blocks: [createdBlocks[3]._id, createdBlocks[4]._id]
    });

    await Itinerary.findByIdAndUpdate(createdItineraries[2]._id, {
      blocks: [createdBlocks[5]._id, createdBlocks[6]._id]
    });

    await Itinerary.findByIdAndUpdate(createdItineraries[3]._id, {
      blocks: [createdBlocks[7]._id, createdBlocks[8]._id]
    });

    // Create Goa-centric feed content
    const feedContent = [
      {
        userId: createdUsers[0]._id,
        type: 'Post',
        text: 'Sunset at Calangute was unreal today! Perfect beach vibes 🌅 #Goa #Calangute #Beach',
        locationTag: 'Calangute, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[1]._id,
        type: 'Itinerary',
        text: 'Old Goa heritage trail this Thursday. Join for a slow walk through UNESCO sites! 🏛️ #Heritage #OldGoa',
        itineraryRef: createdItineraries[1]._id,
        locationTag: 'Old Goa, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[2]._id,
        type: 'Post',
        text: 'Caught perfect waves at Anjuna this morning! Surf season is here 🏄 #Surfing #Anjuna #Goa',
        locationTag: 'Anjuna, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[3]._id,
        type: 'Post',
        text: 'Morning meditation by the sea in Arambol. The sound of waves is so healing 🧘‍♀️ #Wellness #Arambol #Peace',
        locationTag: 'Arambol, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[4]._id,
        type: 'Post',
        text: 'Discovered the best fish curry in Mapusa market! Authentic Goan flavors 🍛 #Food #Mapusa #Local',
        locationTag: 'Mapusa, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[5]._id,
        type: 'Post',
        text: 'Working from a beachside cafe in Baga with amazing WiFi and sea views ☕ #DigitalNomad #Baga #Work',
        locationTag: 'Baga, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[6]._id,
        type: 'Post',
        text: 'Amazing trance night at Vagator! Goa\'s music scene is incredible 🎵 #Music #Vagator #Trance',
        locationTag: 'Vagator, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[7]._id,
        type: 'Post',
        text: 'Solo beach hopping in South Goa. Palolem and Agonda are magical! 🏝️ #SoloTravel #SouthGoa #Beach',
        locationTag: 'South Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[8]._id,
        type: 'Post',
        text: 'Captured the vibrant life of Margao markets today. Street photography gold! 📸 #Photography #Margao #Street',
        locationTag: 'Margao, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[9]._id,
        type: 'Post',
        text: 'Water sports at Candolim Beach were amazing! Jet skiing and parasailing 🏄‍♂️ #WaterSports #Candolim #Adventure',
        locationTag: 'Candolim, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[10]._id,
        type: 'Post',
        text: 'Backpacking through Goa on a budget. Palolem is perfect for budget travelers! 🎒 #BudgetTravel #Palolem #Backpacking',
        locationTag: 'Palolem, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[11]._id,
        type: 'Post',
        text: 'Exploring Fontainhas, the Latin Quarter of Panjim. So much history and art! 🎨 #Art #Fontainhas #Culture',
        locationTag: 'Fontainhas, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[12]._id,
        type: 'Post',
        text: 'Local guide showing hidden gems of Goa. There\'s so much more than beaches! 🗺️ #Local #HiddenGems #Goa',
        locationTag: 'Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[13]._id,
        type: 'Post',
        text: 'Wellness retreat in Assagao. Perfect blend of yoga and nature 🧘‍♀️ #Wellness #Assagao #Retreat',
        locationTag: 'Assagao, Goa',
        timestamp: new Date()
      },
      {
        userId: createdUsers[14]._id,
        type: 'Post',
        text: 'Tech meetup in Porvorim! Goa\'s startup scene is growing 💻 #Technology #Porvorim #Startup',
        locationTag: 'Porvorim, Goa',
        timestamp: new Date()
      }
    ];

    await ContentFeed.insertMany(feedContent);
    console.log(`✅ Created ${feedContent.length} feed items`);

    // Create some connection requests between users
    const requests = [
      {
        senderId: createdUsers[0]._id,
        receiverId: createdUsers[1]._id,
        blockId: createdBlocks[3]._id,
        status: 'Pending',
        message: 'Would love to join the heritage tour!'
      },
      {
        senderId: createdUsers[2]._id,
        receiverId: createdUsers[0]._id,
        blockId: createdBlocks[1]._id,
        status: 'Pending',
        message: 'Interested in the waterfall trip!'
      },
      {
        senderId: createdUsers[4]._id,
        receiverId: createdUsers[3]._id,
        blockId: createdBlocks[8]._id,
        status: 'Accepted',
        message: 'Would love to join the yoga session!'
      }
    ];

    await Request.insertMany(requests);
    console.log(`✅ Created ${requests.length} connection requests`);

    console.log('\n🎉 Enhanced seed data created successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   🗺️ Itineraries: ${createdItineraries.length}`);
    console.log(`   🧱 Blocks: ${createdBlocks.length}`);
    console.log(`   📝 Feed Items: ${feedContent.length}`);
    console.log(`   🤝 Requests: ${requests.length}`);
    console.log('\n🔑 Login credentials for all users:');
    console.log('   Email: [user-email]');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
