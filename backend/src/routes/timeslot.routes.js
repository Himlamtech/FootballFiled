const express = require('express');
const timeslotController = require('../controllers/timeslot.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', timeslotController.getAllTimeSlots);
router.get('/:id', timeslotController.getTimeSlotById);

// Admin routes
router.post('/', verifyToken, isAdmin, timeslotController.createTimeSlot);
router.put('/:id', verifyToken, isAdmin, timeslotController.updateTimeSlot);
router.delete('/:id', verifyToken, isAdmin, timeslotController.deleteTimeSlot);

module.exports = router;
