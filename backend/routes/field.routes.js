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

/**
 * @route   POST /api/fields/:id/lock-day
 * @desc    Lock all time slots for a field on a specific date (fallback endpoint)
 * @access  Private/Admin
 */
router.post('/:id/lock-day', authenticate, isAdmin, async (req, res) => {
  try {
    const { date } = req.body;
    const fieldId = req.params.id;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // This is a fallback endpoint - redirect to field management API
    const fieldManagementController = require('../controllers/field-management.controller');
    req.params.fieldId = fieldId;
    return fieldManagementController.lockAllTimeSlots(req, res);
  } catch (error) {
    console.error('Lock day error:', error);
    res.status(500).json({
      success: false,
      message: 'Error locking day',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/fields/:id/unlock-day
 * @desc    Unlock all time slots for a field on a specific date (fallback endpoint)
 * @access  Private/Admin
 */
router.post('/:id/unlock-day', authenticate, isAdmin, async (req, res) => {
  try {
    const { date } = req.body;
    const fieldId = req.params.id;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // This is a fallback endpoint - redirect to field management API
    const fieldManagementController = require('../controllers/field-management.controller');
    req.params.fieldId = fieldId;
    return fieldManagementController.unlockAllTimeSlots(req, res);
  } catch (error) {
    console.error('Unlock day error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unlocking day',
      error: error.message
    });
  }
});

module.exports = router;