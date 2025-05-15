const express = require('express');
const router = express.Router();
const fieldManagementController = require('../controllers/fieldManagement.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/field-management/status
 * @desc    Get field management status for a specific field and date
 * @access  Public
 */
router.get('/status', fieldManagementController.getFieldStatus);

/**
 * @route   POST /api/field-management/:fieldId/lock
 * @desc    Lock a time slot for a specific field and date
 * @access  Private/Admin
 */
router.post(
  '/:fieldId/lock',
  authenticate,
  isAdmin,
  fieldManagementController.lockTimeSlot
);

/**
 * @route   POST /api/field-management/:fieldId/unlock
 * @desc    Unlock a time slot for a specific field and date
 * @access  Private/Admin
 */
router.post(
  '/:fieldId/unlock',
  authenticate,
  isAdmin,
  fieldManagementController.unlockTimeSlot
);

/**
 * @route   POST /api/field-management/:fieldId/lock-all
 * @desc    Lock all time slots for a specific field and date
 * @access  Private/Admin
 */
router.post(
  '/:fieldId/lock-all',
  authenticate,
  isAdmin,
  fieldManagementController.lockAllTimeSlots
);

module.exports = router;
