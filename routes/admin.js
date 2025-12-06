const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyAdmin, adminLogin } = require('../middleware/adminAuth');
const { catchAsync } = require('../middleware/errorHandler');
const adminController = require('../controllers/adminController');

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Admin login
router.post('/login', catchAsync(adminLogin));

// All routes below require admin authentication
router.use(verifyAdmin);

// Activity management routes
router.get('/activities', catchAsync(adminController.getAllActivities));
router.get('/activities/stats', catchAsync(adminController.getActivityStats));
router.get('/activities/:id', catchAsync(adminController.getActivityById));
router.post('/activities', catchAsync(adminController.createActivity));
router.put('/activities/:id', catchAsync(adminController.updateActivity));
router.delete('/activities/:id', catchAsync(adminController.deleteActivity));

// Bulk upload CSV
router.post('/activities/bulk-upload', upload.single('csv'), catchAsync(adminController.bulkUploadActivities));

module.exports = router;

