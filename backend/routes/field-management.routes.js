const express = require('express');
const router = express.Router();
const fieldManagementController = require('../controllers/field-management.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/field-management/status
 * @desc    Get field status with bookings and lock information
 * @access  Private/Admin
 */
router.get(
  '/status',
  authenticate,
  isAdmin,
  fieldManagementController.getFieldStatus
);

/**
 * @route   POST /api/field-management/:fieldId/lock
 * @desc    Lock a specific time slot
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
 * @desc    Unlock a specific time slot
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
 * @desc    Lock all time slots for a field on a specific date
 * @access  Private/Admin
 */
router.post(
  '/:fieldId/lock-all',
  authenticate,
  isAdmin,
  fieldManagementController.lockAllTimeSlots
);

/**
 * @route   POST /api/field-management/:fieldId/unlock-all
 * @desc    Unlock all time slots for a field on a specific date
 * @access  Private/Admin
 */
router.post(
  '/:fieldId/unlock-all',
  authenticate,
  isAdmin,
  fieldManagementController.unlockAllTimeSlots
);

module.exports = router;
