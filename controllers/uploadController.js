const { upload, deleteImage } = require('../config/cloudinary');
const { catchAsync } = require('../middleware/errorHandler');

// Upload single image
const uploadSingleImage = (fieldName) => {
  return upload.single(fieldName);
};

// Upload multiple images
const uploadMultipleImages = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

// Upload profile image
const uploadProfileImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No image file provided'
    });
  }

  const imageData = {
    url: req.file.path,
    publicId: req.file.filename,
    secureUrl: req.file.secure_url,
    width: req.file.width,
    height: req.file.height,
    format: req.file.format,
    size: req.file.size
  };

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: imageData
  });
});

// Upload feed images
const uploadFeedImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No image files provided'
    });
  }

  const imagesData = req.files.map(file => ({
    url: file.path,
    publicId: file.filename,
    secureUrl: file.secure_url,
    width: file.width,
    height: file.height,
    format: file.format,
    size: file.size
  }));

  res.status(200).json({
    success: true,
    message: 'Images uploaded successfully',
    data: imagesData
  });
});

// Delete image
const deleteUploadedImage = catchAsync(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    return res.status(400).json({
      success: false,
      message: 'Public ID is required'
    });
  }

  const result = await deleteImage(publicId);

  res.status(200).json({
    success: true,
    message: 'Image deleted successfully',
    data: result
  });
});

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  uploadProfileImage,
  uploadFeedImages,
  deleteUploadedImage
};
