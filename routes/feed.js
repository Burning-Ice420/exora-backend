const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const feedController = require('../controllers/feedController');

// Get all feed posts
router.get('/', verifyToken, catchAsync(feedController.getFeedPosts));

// Create a new feed post
router.post('/', verifyToken, [
  body('text').optional().isLength({ min: 1, max: 500 }).withMessage('Text must be between 1 and 500 characters'),
  body('locationTag').optional().isString().withMessage('Location tag must be a string'),
  body('images').optional().isArray().withMessage('Images must be an array')
], catchAsync(feedController.createFeedPost));

// Like/Unlike a post
router.post('/:postId/like', verifyToken, catchAsync(feedController.toggleLike));

// Add comment to a post
router.post('/:postId/comments', verifyToken, [
  body('text').notEmpty().isLength({ min: 1, max: 200 }).withMessage('Comment text must be between 1 and 200 characters')
], catchAsync(feedController.addComment));

// Get comments for a post
router.get('/:postId/comments', verifyToken, catchAsync(feedController.getPostComments));

// Save/Unsave a post
router.post('/:postId/save', verifyToken, catchAsync(feedController.toggleSave));

// Delete a post
router.delete('/:postId', verifyToken, catchAsync(feedController.deletePost));

module.exports = router;