const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth.middleware');

// Remove authentication for testing purposes
// router.use(protect);

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get booking chart data
router.get('/chart', dashboardController.getBookingChartData);

// Get popular fields
router.get('/popular-fields', dashboardController.getPopularFields);

// Get booking trend
router.get('/chart/booking-trend', dashboardController.getBookingTrend);

module.exports = router;