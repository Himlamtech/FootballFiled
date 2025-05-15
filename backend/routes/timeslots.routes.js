const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlot.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.get('/', timeSlotController.getAvailableTimeSlots);
router.get('/all', timeSlotController.getAllTimeSlots);

// Admin only routes
router.use(protect, restrictTo('admin'));

// Create a new time slot
router.post('/', timeSlotController.createTimeSlot);

// Update time slot
router.put('/:id', timeSlotController.updateTimeSlot);

// Delete time slot
router.delete('/:id', timeSlotController.deleteTimeSlot);

module.exports = router;