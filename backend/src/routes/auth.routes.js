const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { registerValidation, loginValidation } = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Admin routes
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router; 