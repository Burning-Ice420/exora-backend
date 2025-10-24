const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const Block = require('../models/Block');

// Create new itinerary
router.post('/create', async (req, res) => {
  try {
    const itinerary = new Itinerary(req.body);
    await itinerary.save();
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's itineraries
router.get('/user/:userId', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.params.userId })
      .populate('blocks')
      .sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public itineraries
router.get('/public', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ isPublic: true })
      .populate('userId', 'name profilePicUrl')
      .populate('blocks')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clone itinerary
router.post('/clone/:itineraryId', async (req, res) => {
  try {
    const originalItinerary = await Itinerary.findById(req.params.itineraryId)
      .populate('blocks');
    
    if (!originalItinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Create new itinerary with same structure
    const clonedItinerary = new Itinerary({
      userId: req.body.userId,
      title: `${originalItinerary.title} (Cloned)`,
      totalBudget: originalItinerary.totalBudget,
      isPublic: false,
      departureDate: originalItinerary.departureDate,
      arrivalDate: originalItinerary.arrivalDate
    });

    await clonedItinerary.save();

    // Clone all blocks
    const clonedBlocks = await Promise.all(
      originalItinerary.blocks.map(async (block) => {
        const newBlock = new Block({
          itineraryId: clonedItinerary._id,
          type: block.type,
          date: block.date,
          time: block.time,
          details: block.details,
          isJoinable: false, // Cloned blocks are not joinable by default
          tags: block.tags
        });
        await newBlock.save();
        return newBlock._id;
      })
    );

    clonedItinerary.blocks = clonedBlocks;
    await clonedItinerary.save();

    res.status(201).json(clonedItinerary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
