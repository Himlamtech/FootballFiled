const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBookingById);
router.get('/field/:fieldId', bookingController.getBookingsByField);
router.post('/', bookingController.createBooking);

// Admin routes
router.put('/:id', verifyToken, isAdmin, bookingController.updateBooking);
router.delete('/:id', verifyToken, isAdmin, bookingController.deleteBooking);
router.put('/:id/status', verifyToken, isAdmin, bookingController.updateBookingStatus);
router.put('/:id/payment', verifyToken, isAdmin, bookingController.updatePaymentStatus);

module.exports = router;