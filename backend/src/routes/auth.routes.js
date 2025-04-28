const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.post('/register', validationMiddleware.registerValidation, authController.register);
router.post('/login', validationMiddleware.loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);

// Admin routes
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);

// Protected routes
router.get('/me', authMiddleware.verifyToken, authController.getCurrentUser);

module.exports = router; 