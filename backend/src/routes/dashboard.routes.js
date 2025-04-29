const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes for demo purposes
router.get('/stats', dashboardController.getDashboardStats);
router.get('/chart', dashboardController.getChartData);

module.exports = router;
