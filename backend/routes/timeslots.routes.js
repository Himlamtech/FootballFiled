const express = require('express');
const router = express.Router();
const timeSlotController = require('../controllers/timeSlot.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', timeSlotController.getAvailableTimeSlots);
router.get('/all', timeSlotController.getAllTimeSlots);

// Admin only routes
router.use(protect);

// Update time slot (only keep this one as it's used for price updates)
router.put('/:id', timeSlotController.updateTimeSlot);

// Removed POST and DELETE endpoints as we're using fixed time slots

module.exports = router;