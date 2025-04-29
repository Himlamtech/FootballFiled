const express = require('express');
const authController = require('../controllers/auth.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Admin routes
router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);

// Protected routes
router.get('/admin/me', verifyToken, isAdmin, authController.getCurrentAdmin);

module.exports = router;