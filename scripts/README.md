# WanderBlocks Enhanced Seed Data

This directory contains scripts to populate the WanderBlocks database with comprehensive, Goa-centric mock data.

## 🚀 Quick Start

### Run Enhanced Seed Data
```bash
# From backend directory
npm run seed:enhanced
```

### Run Original Seed Data
```bash
# From backend directory
npm run seed
```

## 📊 What Gets Created

### 👥 Users (15 diverse profiles)
- **Rahul Nair** - Beach lover and foodie (Panaji)
- **Aisha Khan** - History buff (Old Goa)
- **Vikram Desai** - Surfer (Anjuna)
- **Priya Sharma** - Yoga instructor (Arambol)
- **Arjun Patel** - Food blogger (Mapusa)
- **Sophia Chen** - Digital nomad (Baga)
- **Marcus Johnson** - Music producer (Vagator)
- **Meera Singh** - Solo traveler (South Goa)
- **David Wilson** - Photographer (Margao)
- **Kavya Reddy** - Fitness enthusiast (Candolim)
- **Alex Thompson** - Backpacker (Palolem)
- **Nina Rodriguez** - Art lover (Fontainhas)
- **Raj Kumar** - Local guide (Central Goa)
- **Lisa Anderson** - Wellness organizer (Assagao)
- **Suresh Nair** - Tech entrepreneur (Porvorim)

### 🗺️ Itineraries (10 Goa-centric experiences)
1. **North Goa Beach & Party Weekend** - Calangute, Baga nightlife
2. **Old Goa Heritage & Churches Tour** - UNESCO sites
3. **Anjuna Surf & Adventure Week** - Surfing, flea market
4. **Arambol Yoga & Wellness Retreat** - Yoga, meditation
5. **Authentic Goan Food Trail** - Local cuisine exploration
6. **Baga Digital Nomad Workation** - Co-working, beach work
7. **Vagator Music & Trance Experience** - Music scene
8. **South Goa Hidden Beaches Discovery** - Palolem, Agonda
9. **Margao Street Photography Walk** - Local markets
10. **Candolim Water Sports Adventure** - Water activities

### 🧱 Blocks (20+ authentic experiences)
- **Accommodation**: Beach shacks, surf houses, yoga resorts
- **Activities**: Surfing, yoga, heritage tours, water sports
- **Food**: Traditional Goan cuisine, local markets
- **Nightlife**: Baga, Vagator trance parties
- **Adventure**: Dudhsagar falls, water sports
- **Culture**: Old Goa churches, local markets

### 📝 Feed Content (15 posts)
- Beach experiences from Calangute, Anjuna, Arambol
- Heritage content from Old Goa
- Food discoveries in Mapusa, local markets
- Digital nomad experiences in Baga
- Music and nightlife in Vagator
- Photography in Margao
- Wellness content from Arambol
- Tech meetups in Porvorim

### 🤝 Connection Requests
- Join requests for heritage tours
- Adventure activity requests
- Yoga session invitations

## 🏖️ Goa-Centric Features

### Authentic Locations
- **North Goa**: Calangute, Baga, Anjuna, Vagator, Arambol
- **South Goa**: Palolem, Agonda, Margao
- **Central Goa**: Panaji, Old Goa, Mapusa, Porvorim
- **Heritage**: Old Goa churches, Fontainhas

### Real Experiences
- **Beach Activities**: Surfing, yoga, water sports
- **Cultural**: Heritage tours, local markets
- **Food**: Traditional Goan cuisine, local restaurants
- **Nightlife**: Baga, Vagator trance scene
- **Adventure**: Dudhsagar falls, wildlife sanctuary

### Local Elements
- **Traditional**: Beach shacks, local markets
- **Modern**: Co-working spaces, digital nomad scene
- **Cultural**: UNESCO sites, heritage walks
- **Wellness**: Yoga retreats, meditation

## 🔑 Login Credentials

All users have the same password for easy testing:
- **Email**: [any-user-email]@example.com
- **Password**: password123

### Test Users
- `rahul@example.com` - Beach & party enthusiast
- `aisha@example.com` - Heritage lover
- `vikram@example.com` - Surfer
- `priya@example.com` - Yoga instructor
- `arjun@example.com` - Food blogger

## 🛠️ Technical Details

### Database Structure
- **Users**: 15 profiles with realistic Goan locations
- **Itineraries**: 10 diverse travel plans
- **Blocks**: 20+ activities and accommodations
- **Feed**: 15 social media posts
- **Requests**: 3 connection requests

### Location Data
- **Coordinates**: Real Goan locations with GPS coordinates
- **Interests**: Goa-relevant tags and categories
- **Budgets**: Realistic price ranges for Goa
- **Activities**: Authentic Goan experiences

### Data Relationships
- Users have multiple itineraries
- Itineraries contain multiple blocks
- Feed posts reference users and locations
- Connection requests link users and activities

## 🎯 Use Cases

### For Development
- Test user authentication and profiles
- Explore itinerary creation and management
- Test social features and connections
- Validate location-based features

### For Demo
- Showcase diverse user types
- Demonstrate itinerary functionality
- Display social feed features
- Test map and location features

### For Testing
- User registration and login
- Itinerary creation and editing
- Social interactions and requests
- Location-based searches

## 🚨 Important Notes

- **Database Reset**: This script clears all existing data
- **Environment**: Ensure MongoDB is running
- **Dependencies**: Requires bcryptjs for password hashing
- **Location**: All coordinates are Goa-specific
- **Content**: All content is Goa-themed and authentic

## 🔄 Running the Script

```bash
# Make sure MongoDB is running
mongod

# Run the enhanced seed script
cd backend
npm run seed:enhanced

# Start the backend server
npm run dev

# Start the frontend (in another terminal)
cd frontend
npm run dev
```

## 📱 Testing the Data

1. **Login**: Use any user email with password `password123`
2. **Explore**: Check the map for nearby users
3. **Feed**: Browse the social feed for Goa content
4. **Blocks**: Create and view itineraries
5. **Connections**: Send and receive join requests

The enhanced seed data provides a rich, authentic Goan experience for testing and demonstration purposes!
