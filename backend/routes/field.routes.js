const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/field.controller');
const { authenticate, isAdmin, isStaffOrAdmin } = require('../middleware/auth.middleware');

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

/**
 * @route   POST /api/fields
 * @desc    Create a new field
 * @access  Private/Admin
 */
router.post('/', authenticate, isAdmin, fieldController.createField);

/**
 * @route   PUT /api/fields/:id
 * @desc    Update field
 * @access  Private/Admin
 */
router.put('/:id', authenticate, isAdmin, fieldController.updateField);

/**
 * @route   DELETE /api/fields/:id
 * @desc    Delete field
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, isAdmin, fieldController.deleteField);

module.exports = router;