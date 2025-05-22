const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, isAdmin } = require('../middleware/auth.middleware');

// Admin login - using custom validation for admin
router.post('/admin/login', authController.adminLogin);

// Get current admin
router.get('/admin/me', protect, authController.getCurrentUser);

module.exports = router;