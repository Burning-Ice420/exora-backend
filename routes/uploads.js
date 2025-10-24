const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  uploadSingleImage, 
  uploadMultipleImages, 
  uploadProfileImage, 
  uploadFeedImages, 
  deleteUploadedImage 
} = require('../controllers/uploadController');

// Upload profile image
router.post('/profile', 
  verifyToken, 
  uploadSingleImage('image'), 
  uploadProfileImage
);

// Upload feed images
router.post('/feed', 
  verifyToken, 
  uploadMultipleImages('images', 10), 
  uploadFeedImages
);

// Delete image
router.delete('/:publicId', 
  verifyToken, 
  deleteUploadedImage
);

module.exports = router;
