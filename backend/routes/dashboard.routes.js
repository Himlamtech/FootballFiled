const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Remove authentication for testing purposes
// router.use(protect, restrictTo('admin'));

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get booking chart data
router.get('/chart', dashboardController.getBookingChartData);

// Get popular fields
router.get('/popular-fields', dashboardController.getPopularFields);

module.exports = router;