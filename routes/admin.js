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

// Exclusives activities (used by /api/activities and frontend "Exclusives by Exora")
router.get('/exclusive-activities', catchAsync(adminController.getAllExclusiveActivities));
router.get('/exclusive-activities/stats', catchAsync(adminController.getExclusiveActivityStats));
router.get('/exclusive-activities/:id', catchAsync(adminController.getExclusiveActivityById));
router.post('/exclusive-activities', catchAsync(adminController.createExclusiveActivity));
router.put('/exclusive-activities/:id', catchAsync(adminController.updateExclusiveActivity));
router.delete('/exclusive-activities/:id', catchAsync(adminController.deleteExclusiveActivity));

// Bulk upload CSV
router.post('/activities/bulk-upload', upload.single('csv'), catchAsync(adminController.bulkUploadActivities));

module.exports = router;

