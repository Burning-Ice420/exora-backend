const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { body, validationResult } = require('express-validator');
const blockController = require('../controllers/blockController');

// Create new main block
router.post('/', verifyToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('radius').optional().isNumeric().withMessage('Radius must be a number'),
  body('type').optional().isIn(['main_block', 'sub_block', 'Flight', 'Accommodation', 'Activity', 'Restaurant', 'Transport', 'Entertainment', 'Shopping', 'Wellness']).withMessage('Invalid block type'),
  body('time').notEmpty().withMessage('Time is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('details.title').notEmpty().withMessage('Details title is required'),
], catchAsync(blockController.createBlock));

// Suggest sub-block (Family Member)
router.post('/suggest', verifyToken, [
  body('parentBlockId').notEmpty().withMessage('Parent block ID is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('radius').optional().isNumeric().withMessage('Radius must be a number'),
], catchAsync(blockController.suggestSubBlock));

// Approve or reject sub-block
router.patch('/approve/:subBlockId', verifyToken, [
  body('approved').isBoolean().withMessage('Approved must be a boolean'),
], catchAsync(blockController.approveSubBlock));

// Get all blocks for a user
router.get('/my-blocks', verifyToken, catchAsync(blockController.getMyBlocks));

// Get sub-blocks for a main block
router.get('/:blockId/sub-blocks', verifyToken, catchAsync(blockController.getSubBlocks));

// Get detailed block information by ID
router.get('/:blockId', verifyToken, catchAsync(blockController.getBlockById));

// Get blocks for itinerary (legacy support)
router.get('/itinerary/:itineraryId', catchAsync(blockController.getBlocksForItinerary));

// Update block
router.put('/:id', verifyToken, catchAsync(blockController.updateBlock));

// Delete block
router.delete('/:id', verifyToken, catchAsync(blockController.deleteBlock));

// Family/Couple specific routes
// Get family blocks with pending approvals
router.get('/family/blocks', verifyToken, catchAsync(blockController.getFamilyBlocks));

// Add family member to block
router.post('/:blockId/add-member', verifyToken, [
  body('memberId').notEmpty().withMessage('Member ID is required'),
], catchAsync(blockController.addFamilyMember));

module.exports = router;
