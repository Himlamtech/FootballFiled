const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerValidationRules: registerRules, loginValidationRules: loginRules, validate } = require('../middleware/validation.middleware');

// Register a new user
router.post('/register', registerRules, validate, authController.register);

// Login user
router.post('/login', loginRules, validate, authController.login);

// Admin login - using custom validation for admin
router.post('/admin/login', authController.adminLogin);

// Get current user
router.get('/me', protect, authController.getCurrentUser);

// Get current admin
router.get('/admin/me', protect, authController.getCurrentUser);

module.exports = router;