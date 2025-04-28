const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { 
  bookingValidation, 
  idValidation,
  paginationValidation,
  paymentStatusValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

// Booking routes
router.get('/', paginationValidation, bookingController.getAllBookings);
router.get('/:id', idValidation, bookingController.getBookingById);
router.post('/', bookingValidation, bookingController.createBooking);
router.put('/:id', idValidation, bookingValidation, bookingController.updateBooking);
router.delete('/:id', idValidation, bookingController.deleteBooking);

// User & field specific bookings
router.get('/user/:userId', idValidation, paginationValidation, isOwnerOrAdmin, bookingController.getBookingsByUser);
router.get('/field/:fieldId', idValidation, paginationValidation, bookingController.getBookingsByField);

// Payment update
router.patch('/:id/payment', idValidation, paymentStatusValidation, bookingController.updatePaymentStatus);

module.exports = router; 