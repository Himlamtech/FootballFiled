const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { 
  bookingValidation, 
  idParamValidation,
  paginationValidation,
  paymentValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// All booking routes require authentication
router.use(verifyToken);

// Booking routes
router.get('/', paginationValidation, bookingController.getAllBookings);
router.get('/:id', idParamValidation, bookingController.getBookingById);
router.post('/', bookingValidation, bookingController.createBooking);
router.put('/:id', idParamValidation, bookingValidation, bookingController.updateBooking);
router.delete('/:id', idParamValidation, bookingController.deleteBooking);

// User & field specific bookings
router.get('/user/:userId', idParamValidation, paginationValidation, isOwnerOrAdmin, bookingController.getBookingsByUser);
router.get('/field/:fieldId', idParamValidation, paginationValidation, bookingController.getBookingsByField);

// Payment update
router.patch('/:id/payment', idParamValidation, paymentValidation, bookingController.updatePaymentStatus);

module.exports = router; 