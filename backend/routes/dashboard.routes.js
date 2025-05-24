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

// Get detailed booking history with pagination and filtering
router.get('/bookings', dashboardController.getBookingHistory);

// Get revenue analysis by time period
router.get('/revenue-analysis', dashboardController.getRevenueAnalysis);

// Get customer statistics
router.get('/customer-stats', dashboardController.getCustomerStats);

module.exports = router;