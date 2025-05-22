const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/field.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/fields
 * @desc    Get all fields
 * @access  Public
 */
router.get('/', fieldController.getAllFields);

/**
 * @route   GET /api/fields/:id
 * @desc    Get field by ID
 * @access  Public
 */
router.get('/:id', fieldController.getFieldById);

module.exports = router;