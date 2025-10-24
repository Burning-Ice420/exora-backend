const Block = require('../models/Block');
const User = require('../models/User');
const { ValidationError, NotFoundError, ForbiddenError } = require('../middleware/errorHandler');

// Create new main block
const createBlock = async (req, res) => {
  const { 
    title, 
    destination, 
    radius, 
    membersInvolved,
    type = 'main_block',
    description,
    location,
    timing,
    cost,
    capacity,
    requirements,
    contact,
    media,
    tags,
    categoryDetails,
    time,
    date,
    details,
    ratings
  } = req.body;
  
  const blockData = {
    createdBy: req.user._id,
    title,
    destination,
    radius: radius || 5,
    type,
    approved: true,
    membersInvolved: membersInvolved || [req.user._id],
    description,
    location,
    timing,
    cost,
    capacity,
    requirements,
    contact,
    media,
    tags,
    categoryDetails,
    time,
    date,
    details,
    ratings
  };

  const block = new Block(blockData);
  await block.save();
  
  // Populate the created block with user details
  const populatedBlock = await Block.findById(block._id)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');
  
  res.status(201).json({
    status: 'success',
    block: populatedBlock
  });
};

// Suggest sub-block (Family Member)
const suggestSubBlock = async (req, res) => {
  const { parentBlockId, destination, radius } = req.body;
  
  // Verify parent block exists and user has access
  const parentBlock = await Block.findById(parentBlockId);
  if (!parentBlock) {
    throw new NotFoundError('Parent block not found');
  }

  // Check if user is a member of the family/couple
  const user = await User.findById(req.user._id);
  if (user.travel_type === 'solo_traveler') {
    throw new ForbiddenError('Solo travelers cannot suggest sub-blocks');
  }

  // Check if user is involved in the parent block
  if (!parentBlock.membersInvolved.includes(req.user._id)) {
    throw new ForbiddenError('You are not authorized to suggest for this block');
  }

  const subBlockData = {
    createdBy: req.user._id,
    title: `Suggestion: ${destination}`,
    destination,
    radius: radius || 2.5,
    type: 'sub_block',
    approved: false, // Requires approval
    parentBlockId,
    suggestedBy: req.user._id,
    membersInvolved: [req.user._id]
  };

  const subBlock = new Block(subBlockData);
  await subBlock.save();
  
  res.status(201).json({
    status: 'success',
    message: 'Sub-block suggestion created and pending approval',
    subBlock
  });
};

// Approve or reject sub-block
const approveSubBlock = async (req, res) => {
  const { subBlockId } = req.params;
  const { approved } = req.body;

  const subBlock = await Block.findById(subBlockId);
  if (!subBlock) {
    throw new NotFoundError('Sub-block not found');
  }

  if (subBlock.type !== 'sub_block') {
    throw new ValidationError('This is not a sub-block');
  }

  // Get parent block to verify ownership
  const parentBlock = await Block.findById(subBlock.parentBlockId);
  if (!parentBlock) {
    throw new NotFoundError('Parent block not found');
  }

  // Check if user is the creator of the parent block (head of family)
  if (parentBlock.createdBy.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Only the head of family can approve sub-blocks');
  }

  subBlock.approved = approved;
  await subBlock.save();

  res.json({
    status: 'success',
    message: `Sub-block ${approved ? 'approved' : 'rejected'} successfully`,
    subBlock
  });
};

// Get all blocks for a user
const getMyBlocks = async (req, res) => {
  const blocks = await Block.find({
    $or: [
      { createdBy: req.user._id },
      { membersInvolved: req.user._id }
    ]
  }).populate('createdBy', 'name email profileImage')
    .populate('suggestedBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    blocks
  });
};

// Get sub-blocks for a main block
const getSubBlocks = async (req, res) => {
  const { blockId } = req.params;
  
  const mainBlock = await Block.findById(blockId);
  if (!mainBlock) {
    throw new NotFoundError('Main block not found');
  }

  // Check if user has access to this block
  if (!mainBlock.membersInvolved.includes(req.user._id)) {
    throw new ForbiddenError('You do not have access to this block');
  }

  const subBlocks = await Block.find({ 
    parentBlockId: blockId,
    type: 'sub_block'
  }).populate('suggestedBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    subBlocks
  });
};

// Get detailed block information by ID
const getBlockById = async (req, res) => {
  const { blockId } = req.params;
  
  const block = await Block.findById(blockId)
    .populate('createdBy', 'name email profileImage')
    .populate('suggestedBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .populate('parentBlockId', 'title destination type')
    .populate('itineraryId', 'title description');

  if (!block) {
    throw new NotFoundError('Block not found');
  }

  // Check if user has access to this block
  if (!block.membersInvolved.includes(req.user._id) && block.createdBy._id.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You do not have access to this block');
  }

  // Get related blocks (sub-blocks if this is a main block, or parent block info)
  let relatedBlocks = [];
  if (block.type === 'main_block') {
    relatedBlocks = await Block.find({ 
      parentBlockId: blockId,
      type: 'sub_block'
    }).populate('suggestedBy', 'name email profileImage')
      .populate('membersInvolved', 'name email profileImage')
      .sort({ createdAt: -1 });
  }

  // Get user's other blocks for recommendations
  const userBlocks = await Block.find({
    createdBy: req.user._id,
    _id: { $ne: blockId },
    type: { $in: ['main_block', 'sub_block'] }
  }).select('title destination type status')
    .limit(5)
    .sort({ createdAt: -1 });

  res.json({
    status: 'success',
    block: {
      ...block.toObject(),
      relatedBlocks,
      userOtherBlocks: userBlocks
    }
  });
};

// Get blocks for itinerary (legacy support)
const getBlocksForItinerary = async (req, res) => {
  const blocks = await Block.find({ itineraryId: req.params.itineraryId })
    .sort({ date: 1, time: 1 });
  res.json(blocks);
};

// Update block
const updateBlock = async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) {
    throw new NotFoundError('Block not found');
  }

  // Check if user can update this block
  if (block.createdBy.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You can only update blocks you created');
  }

  const updatedBlock = await Block.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({
    status: 'success',
    block: updatedBlock
  });
};

// Delete block
const deleteBlock = async (req, res) => {
  const block = await Block.findById(req.params.id);
  if (!block) {
    throw new NotFoundError('Block not found');
  }

  // Check if user can delete this block
  if (block.createdBy.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('You can only delete blocks you created');
  }

  await Block.findByIdAndDelete(req.params.id);
  res.json({
    status: 'success',
    message: 'Block deleted successfully'
  });
};

// Get family/couple blocks with pending approvals
const getFamilyBlocks = async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (user.travel_type === 'solo_traveler') {
    return res.json({
      status: 'success',
      message: 'Solo travelers do not have family blocks',
      blocks: []
    });
  }

  // Get blocks where user is involved and has family members
  const familyBlocks = await Block.find({
    membersInvolved: req.user._id,
    type: { $in: ['main_block', 'sub_block'] }
  }).populate('createdBy', 'name email profileImage')
    .populate('suggestedBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage')
    .sort({ createdAt: -1 });

  // Get pending sub-blocks that need approval
  const pendingSubBlocks = await Block.find({
    type: 'sub_block',
    approved: false,
    parentBlockId: { $in: familyBlocks.map(block => block._id) }
  }).populate('suggestedBy', 'name email profileImage')
    .populate('parentBlockId', 'title destination');

  res.json({
    status: 'success',
    blocks: familyBlocks,
    pendingApprovals: pendingSubBlocks
  });
};

// Add family member to block
const addFamilyMember = async (req, res) => {
  const { blockId } = req.params;
  const { memberId } = req.body;

  const block = await Block.findById(blockId);
  if (!block) {
    throw new NotFoundError('Block not found');
  }

  // Check if user can add members to this block
  if (block.createdBy.toString() !== req.user._id.toString()) {
    throw new ForbiddenError('Only the block creator can add family members');
  }

  // Verify the member exists and is a family member
  const member = await User.findById(memberId);
  if (!member) {
    throw new NotFoundError('Member not found');
  }

  if (member.travel_type === 'solo_traveler') {
    throw new ValidationError('Cannot add solo travelers to family blocks');
  }

  // Add member to the block
  if (!block.membersInvolved.includes(memberId)) {
    block.membersInvolved.push(memberId);
    await block.save();
  }

  const updatedBlock = await Block.findById(blockId)
    .populate('createdBy', 'name email profileImage')
    .populate('membersInvolved', 'name email profileImage');

  res.json({
    status: 'success',
    message: 'Family member added successfully',
    block: updatedBlock
  });
};

module.exports = {
  createBlock,
  suggestSubBlock,
  approveSubBlock,
  getMyBlocks,
  getSubBlocks,
  getBlockById,
  getBlocksForItinerary,
  updateBlock,
  deleteBlock,
  getFamilyBlocks,
  addFamilyMember
};
