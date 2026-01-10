const Trip = require('../models/Trip');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const spellsService = require('../services/spellsService');

// Get user's trips
const getTrips = async (req, res) => {
  const userTrips = await Trip.find({ createdBy: req.user._id })
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    trips: userTrips
  });
};

// Get public trips
const getPublicTrips = async (req, res) => {
  const publicTrips = await Trip.find({ visibility: 'public' })
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });
  
  res.json({
    status: 'success',
    trips: publicTrips
  });
};

// Get trip by ID (public or user's own trip)
const getTripById = async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user?._id; // Optional - user might not be authenticated (for public trips)
  
  if (!tripId) {
    throw new ValidationError('Trip ID is required');
  }
  
  const trip = await Trip.findById(tripId)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  
  // Check if trip is public or user owns it
  const isPublic = trip.visibility === 'public';
  const isOwner = userId && trip.createdBy._id.toString() === userId.toString();
  
  if (!isPublic && !isOwner) {
    throw new NotFoundError('Trip not found or not accessible');
  }
  
  res.json({
    status: 'success',
    trip
  });
};

// Helper function to extract coordinates from itinerary items
const extractItineraryCoordinates = (itinerary) => {
  if (!Array.isArray(itinerary)) return itinerary;
  
  return itinerary.map(item => {
    const processedItem = { ...item };
    
    // Extract coordinates from various formats
    let lat, lng;
    
    // Check for coordinates object: { latitude, longitude }
    if (item.coordinates && typeof item.coordinates === 'object' && !Array.isArray(item.coordinates)) {
      if (item.coordinates.latitude !== undefined && item.coordinates.longitude !== undefined) {
        lat = item.coordinates.latitude;
        lng = item.coordinates.longitude;
      }
    }
    // Check for direct latitude/longitude properties
    else if (item.latitude !== undefined && item.longitude !== undefined) {
      lat = item.latitude;
      lng = item.longitude;
    }
    // Check for coordinates array: [lat, lng] or [lng, lat]
    else if (Array.isArray(item.coordinates) && item.coordinates.length === 2) {
      const coords = item.coordinates;
      // Determine order based on value ranges
      if (Math.abs(coords[0]) > 90 || Math.abs(coords[1]) > 180) {
        [lng, lat] = coords;
      } else {
        [lat, lng] = coords;
      }
    }
    // Check for Google Places format
    else if (item.place?.geometry?.location) {
      lat = item.place.geometry.location.lat || item.place.geometry.location.latitude;
      lng = item.place.geometry.location.lng || item.place.geometry.location.longitude;
    }
    
    // If we found valid coordinates, store them
    if (lat !== undefined && lng !== undefined && 
        typeof lat === 'number' && typeof lng === 'number' &&
        !isNaN(lat) && !isNaN(lng) &&
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      processedItem.coordinates = [lat, lng];
      processedItem.latitude = lat;
      processedItem.longitude = lng;
    }
    
    // Preserve location and place data
    if (item.location) {
      processedItem.location = item.location;
    }
    if (item.place) {
      processedItem.place = item.place;
    }
    
    // Preserve and extract image data
    console.log(`[Trip Controller] Processing itinerary item: ${item.experienceName || item.id}`);
    console.log(`[Trip Controller] Item has images array:`, !!item.images, 'length:', item.images?.length || 0);
    console.log(`[Trip Controller] Item has image field:`, !!item.image);
    console.log(`[Trip Controller] Item has place.photos:`, !!item.place?.photos, 'length:', item.place?.photos?.length || 0);
    
    // First, check if images are already extracted (highest priority)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const validImages = item.images.filter(img => img && typeof img === 'string');
      if (validImages.length > 0) {
        processedItem.images = validImages;
        processedItem.image = validImages[0] || item.image || null;
        console.log(`[Trip Controller] ✅ Preserved ${validImages.length} images from item.images`);
      } else {
        console.log(`[Trip Controller] ⚠️ item.images exists but contains no valid URLs`);
      }
    }
    
    // If no images yet, check for direct image field
    if ((!processedItem.images || processedItem.images.length === 0) && item.image) {
      processedItem.image = item.image;
      processedItem.images = [item.image];
      console.log('[Trip Controller] ✅ Using item.image field');
    }
    
    // If still no images, try to extract from place.photos using photo_reference
    // Note: place.photos objects lose getUrl() method when serialized
    // We need to construct URLs using photo_reference and Google Places Photo API
    if ((!processedItem.images || processedItem.images.length === 0) && item.place?.photos && Array.isArray(item.place.photos) && item.place.photos.length > 0) {
      const config = require('../config/environment');
      const apiKey = config.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
      
      console.log(`[Trip Controller] Attempting to extract from place.photos (${item.place.photos.length} photos), API key available:`, !!apiKey);
      console.log(`[Trip Controller] First photo object keys:`, item.place.photos[0] ? Object.keys(item.place.photos[0]) : 'null');
      console.log(`[Trip Controller] First photo object:`, JSON.stringify(item.place.photos[0], null, 2));
      
      const extractedUrls = item.place.photos
        .map((photo, index) => {
          // Check if photo is already a URL string (from frontend extraction)
          if (typeof photo === 'string' && photo.startsWith('http')) {
            return photo;
          }
          // Check if photo object has a stored URL (from frontend extraction)
          if (photo && typeof photo === 'object') {
            // First priority: use stored URL from frontend extraction
            if (photo.url && typeof photo.url === 'string' && photo.url.startsWith('http')) {
              console.log(`[Trip Controller] Using stored URL for photo ${index}`);
              return photo.url;
            }
            // Second priority: construct URL from photo_reference if API key is available
            if (photo.photo_reference && apiKey) {
              const constructedUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photo.photo_reference}&key=${apiKey}`;
              console.log(`[Trip Controller] Constructed URL from photo_reference for photo ${index}`);
              return constructedUrl;
            }
            // Third priority: if photo_reference exists but no API key, we can't construct URL
            // But we'll log it for debugging
            if (photo.photo_reference) {
              console.log(`[Trip Controller] Photo ${index} has photo_reference but no API key:`, photo.photo_reference);
            }
          }
          return null;
        })
        .filter(Boolean);
      
      if (extractedUrls.length > 0) {
        processedItem.images = extractedUrls;
        processedItem.image = extractedUrls[0];
        console.log(`[Trip Controller] ✅ Extracted ${extractedUrls.length} photo URLs from place.photos`);
      } else {
        console.log('[Trip Controller] ⚠️ place.photos exists but no extractable URLs. Photo sample keys:', item.place.photos[0] ? Object.keys(item.place.photos[0]) : 'null');
      }
    }
    
    // Log final state
    if (processedItem.images && processedItem.images.length > 0) {
      console.log(`[Trip Controller] ✅ Final: ${processedItem.images.length} images saved for "${item.experienceName || item.id}"`);
    } else {
      console.log(`[Trip Controller] ❌ WARNING: No images found for "${item.experienceName || item.id}"`);
    }
    
    return processedItem;
  });
};

// Create trip
const createTrip = async (req, res) => {
  const { 
    name, 
    location, 
    startDate, 
    endDate, 
    budget, 
    visibility = 'public',
    description,
    itinerary = [],
    startCoordinates
  } = req.body;
  
  // Extract coordinates from itinerary items
  const processedItinerary = extractItineraryCoordinates(itinerary);
  
  const newTrip = new Trip({
    name,
    destination: location,
    location,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    budget: parseInt(budget) || 0,
    visibility,
    description,
    itinerary: processedItinerary,
    startCoordinates: startCoordinates && Array.isArray(startCoordinates) && startCoordinates.length === 2 
      ? startCoordinates 
      : undefined,
    createdBy: req.user._id,
    membersInvolved: [req.user._id]
  });
  
  await newTrip.save();
  
  // Award spells for hosting a trip (only if not already awarded)
  if (!newTrip.spellsAwardedForHost) {
    try {
      await spellsService.awardHostTrip(req.user._id, newTrip._id);
      newTrip.spellsAwardedForHost = true;
      await newTrip.save();
    } catch (error) {
      console.error('Error awarding spells for hosting trip:', error);
      // Don't fail the request if spells update fails
    }
  }
  
  // Populate the created trip
  const populatedTrip = await Trip.findById(newTrip._id)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  res.status(201).json({
    status: 'success',
    trip: populatedTrip
  });
};

// Update trip
const updateTrip = async (req, res) => {
  const tripId = req.params.id;
  const { name, location, startDate, endDate, budget, visibility, description, itinerary, startCoordinates, status } = req.body;
  
  const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
  
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  
  // Update fields
  if (name) trip.name = name;
  if (location) {
    trip.location = location;
    trip.destination = location;
  }
  if (startDate) trip.startDate = new Date(startDate);
  if (endDate) trip.endDate = new Date(endDate);
  if (budget !== undefined) trip.budget = parseInt(budget);
  if (visibility) trip.visibility = visibility;
  if (description !== undefined) trip.description = description;
  if (itinerary) {
    // Extract coordinates from itinerary items
    trip.itinerary = extractItineraryCoordinates(itinerary);
  }
  if (startCoordinates !== undefined) {
    trip.startCoordinates = startCoordinates && Array.isArray(startCoordinates) && startCoordinates.length === 2
      ? startCoordinates
      : null;
  }
  if (status && ['planning', 'confirmed', 'completed', 'cancelled'].includes(status)) {
    trip.status = status;
  }
  
  await trip.save();
  
  // Populate the updated trip
  const populatedTrip = await Trip.findById(trip._id)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  res.json({
    status: 'success',
    trip: populatedTrip
  });
};

// Delete trip
const deleteTrip = async (req, res) => {
  const tripId = req.params.id;
  
  const trip = await Trip.findOneAndDelete({ _id: tripId, createdBy: req.user._id });
  
  if (!trip) {
    throw new NotFoundError('Trip not found');
  }
  
  res.json({
    status: 'success',
    message: 'Trip deleted successfully'
  });
};

module.exports = {
  getTrips,
  getPublicTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip
};
