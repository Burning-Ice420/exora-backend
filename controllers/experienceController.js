const { ValidationError, NotFoundError } = require('../middleware/errorHandler');

// Mock data for now - replace with actual database operations
let experiences = [
  {
    id: "1",
    name: "Sunset Beach Bonfire",
    host: "Sarah",
    hostAvatar: "👩",
    participants: 4,
    time: "Today, 6 PM",
    distance: "2.3 km away",
    category: "Beach",
    price: 0,
    description: "Join us for an unforgettable sunset bonfire on the beach. Bring your favorite snacks and stories!",
    image: "🔥",
    location: { lat: 15.2993, lng: 74.1240 },
    createdAt: new Date()
  },
  {
    id: "2",
    name: "Goa Food Tour",
    host: "Marco",
    hostAvatar: "👨",
    participants: 6,
    time: "Tomorrow, 10 AM",
    distance: "1.8 km away",
    category: "Food",
    price: 500,
    description: "Explore the best street food spots in Goa. Taste authentic Goan cuisine with a local guide.",
    image: "🍜",
    location: { lat: 15.2993, lng: 74.1240 },
    createdAt: new Date()
  },
  {
    id: "3",
    name: "Water Sports Adventure",
    host: "Raj",
    hostAvatar: "👨",
    participants: 3,
    time: "This weekend",
    distance: "3.1 km away",
    category: "Adventure",
    price: 1500,
    description: "Jet skiing, parasailing, and paddleboarding. All equipment provided. Beginner-friendly!",
    image: "🏄",
    location: { lat: 15.2993, lng: 74.1240 },
    createdAt: new Date()
  },
  {
    id: "4",
    name: "Yoga & Meditation",
    host: "Priya",
    hostAvatar: "👩",
    participants: 8,
    time: "Daily, 6 AM",
    distance: "0.5 km away",
    category: "Wellness",
    price: 200,
    description: "Start your day with sunrise yoga and meditation. Perfect for relaxation and connection.",
    image: "🧘",
    location: { lat: 15.2993, lng: 74.1240 },
    createdAt: new Date()
  },
  {
    id: "5",
    name: "Night Market Exploration",
    host: "Alex",
    hostAvatar: "👨",
    participants: 5,
    time: "Tonight, 8 PM",
    distance: "2.1 km away",
    category: "Culture",
    price: 300,
    description: "Discover local crafts, street art, and hidden gems at the night market.",
    image: "🎨",
    location: { lat: 15.2993, lng: 74.1240 },
    createdAt: new Date()
  },
  {
    id: "6",
    name: "Hiking Trail Adventure",
    host: "Nina",
    hostAvatar: "👩",
    participants: 7,
    time: "Sunday, 7 AM",
    distance: "4.2 km away",
    category: "Adventure",
    price: 0,
    description: "Scenic hiking trail with breathtaking views. Moderate difficulty. Bring water and snacks.",
    image: "⛰️",
    location: { lat: 15.2993, lng: 74.1240 },
    createdAt: new Date()
  }
];

// Get experiences
const getExperiences = async (req, res) => {
  const { category, priceRange, user, limit = 10, page = 1 } = req.query;
  
  let filteredExperiences = [...experiences];
  
  // Filter by category
  if (category && category !== 'all') {
    filteredExperiences = filteredExperiences.filter(exp => exp.category === category);
  }
  
  // Filter by price range
  if (priceRange === 'free') {
    filteredExperiences = filteredExperiences.filter(exp => exp.price === 0);
  } else if (priceRange === 'paid') {
    filteredExperiences = filteredExperiences.filter(exp => exp.price > 0);
  }
  
  // Filter by user (for user's own experiences)
  if (user) {
    filteredExperiences = filteredExperiences.filter(exp => exp.hostId === user);
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedExperiences = filteredExperiences.slice(startIndex, endIndex);
  
  res.json({
    status: 'success',
    experiences: paginatedExperiences,
    total: filteredExperiences.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
};

// Create experience
const createExperience = async (req, res) => {
  const { name, description, category, price, time, location } = req.body;
  
  const newExperience = {
    id: (experiences.length + 1).toString(),
    name,
    description,
    category,
    price: parseInt(price),
    time,
    location,
    host: req.user.name,
    hostAvatar: "👤",
    hostId: req.user._id,
    participants: 0,
    distance: "0 km away",
    image: "🎯",
    createdAt: new Date()
  };
  
  experiences.push(newExperience);
  
  res.status(201).json({
    status: 'success',
    experience: newExperience
  });
};

// Join experience
const joinExperience = async (req, res) => {
  const experienceId = req.params.id;
  const experience = experiences.find(exp => exp.id === experienceId);
  
  if (!experience) {
    throw new NotFoundError('Experience not found');
  }
  
  // In a real app, you'd add the user to the participants list
  experience.participants += 1;
  
  res.json({
    status: 'success',
    message: 'Successfully joined the experience',
    experience
  });
};

module.exports = {
  getExperiences,
  createExperience,
  joinExperience
};
