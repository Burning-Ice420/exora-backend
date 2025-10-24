const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Block = require('../models/Block');
const User = require('../models/User');

// Send join request
router.post('/send', async (req, res) => {
  try {
    const { blockId, senderId, receiverId, message } = req.body;
    
    // Check if block exists and is joinable
    const block = await Block.findById(blockId).populate('itineraryId');
    if (!block || !block.isJoinable) {
      return res.status(400).json({ error: 'Block is not joinable' });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      blockId,
      senderId,
      receiverId
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Request already sent' });
    }

    const request = new Request({
      blockId,
      senderId,
      receiverId,
      message
    });

    await request.save();
    await request.populate('senderId', 'name profilePicUrl');
    await request.populate('blockId');

    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's requests
router.get('/user/:userId', async (req, res) => {
  try {
    const { type } = req.query; // 'sent' or 'received'
    
    let query = {};
    if (type === 'sent') {
      query.senderId = req.params.userId;
    } else if (type === 'received') {
      query.receiverId = req.params.userId;
    } else {
      query.$or = [
        { senderId: req.params.userId },
        { receiverId: req.params.userId }
      ];
    }

    const requests = await Request.find(query)
      .populate('senderId', 'name profilePicUrl')
      .populate('receiverId', 'name profilePicUrl')
      .populate('blockId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update request status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('senderId', 'name profilePicUrl')
     .populate('receiverId', 'name profilePicUrl')
     .populate('blockId');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(request);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
