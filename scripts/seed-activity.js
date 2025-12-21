const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const config = require('../config/environment');

const seedActivity = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing activities
    await Activity.deleteMany({});
    console.log('Cleared existing activities');

    // Create detailed activity
    const activity = new Activity({
      name: 'Sunset Beach Yoga & Meditation Experience',
      description: 'Unwind with a serene yoga session on the beach as the sun sets, followed by guided meditation and refreshments.',
      longDescription: `Join us for an unforgettable evening of tranquility and mindfulness at one of Goa's most beautiful beaches. This experience combines the ancient practice of yoga with the natural beauty of a sunset beach setting.

Our certified yoga instructor will guide you through a 60-minute Hatha yoga session suitable for all levels, from beginners to advanced practitioners. As the sun begins to set, we'll transition into a 30-minute guided meditation session that will help you connect with nature and find inner peace.

After the session, enjoy fresh coconut water and light snacks while mingling with fellow participants. This is the perfect way to end your day and start your evening with a sense of calm and rejuvenation.

What makes this experience special:
- Small group size (max 15 people) for personalized attention
- Professional yoga mats and props provided
- Stunning beachfront location with unobstructed sunset views
- Certified and experienced instructor
- Refreshments included
- Perfect for solo travelers, couples, and groups

Whether you're a yoga enthusiast or a complete beginner, this experience is designed to help you relax, recharge, and connect with yourself and nature.`,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
          alt: 'Beach yoga session at sunset',
          order: 1,
        },
        {
          url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200',
          alt: 'Yoga mats on beach',
          order: 2,
        },
        {
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
          alt: 'Sunset meditation',
          order: 3,
        },
        {
          url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200',
          alt: 'Group yoga session',
          order: 4,
        },
        {
          url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
          alt: 'Beach sunset view',
          order: 5,
        },
      ],
      price: 1299,
      originalPrice: 1999,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      time: '6:00 PM',
      duration: '2 hours',
      location: {
        name: 'Anjuna Beach',
        address: 'Anjuna Beach, North Goa',
        city: 'Goa',
        state: 'Goa',
        coordinates: {
          lat: 15.5844,
          lng: 73.7394,
        },
      },
      category: 'Wellness',
      tags: ['yoga', 'meditation', 'beach', 'sunset', 'wellness', 'mindfulness', 'relaxation'],
      highlights: [
        '60-minute Hatha yoga session for all levels',
        '30-minute guided meditation at sunset',
        'Professional instructor with 10+ years experience',
        'Yoga mats and props provided',
        'Fresh coconut water and light snacks',
        'Small group size (max 15 people)',
        'Stunning beachfront location',
        'Perfect for solo travelers and groups',
      ],
      includes: [
        'Professional yoga instruction',
        'Yoga mats and props',
        'Guided meditation session',
        'Fresh coconut water',
        'Light snacks',
        'Beach access',
      ],
      excludes: [
        'Transportation to/from beach',
        'Personal items',
        'Additional food and beverages',
      ],
      requirements: {
        minAge: 12,
        maxAge: null,
        physicalFitness: 'Light - suitable for all fitness levels',
        specialRequirements: ['Bring water bottle', 'Wear comfortable clothes'],
      },
      capacity: 15,
      booked: 0,
      host: {
        name: 'Priya Sharma',
        bio: 'Certified yoga instructor with 10+ years of experience in Hatha, Vinyasa, and meditation. Passionate about helping people find peace and balance through yoga.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      },
      status: 'active',
      featured: true,
      rating: {
        average: 4.8,
        count: 127,
      },
    });

    await activity.save();
    console.log('✅ Activity created:', activity.name);
    console.log('   Slug:', activity.slug);
    console.log('   ID:', activity._id);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding activity:', error);
    process.exit(1);
  }
};

seedActivity();


