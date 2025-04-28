const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// All booking routes require authentication
router.use(authMiddleware.verifyToken);

// Get all bookings (filtered by user for regular users, all for admins)
router.get('/', validationMiddleware.paginationValidation, bookingController.getAllBookings);

// Get booking by ID
router.get('/:id', validationMiddleware.validateIdParam, bookingController.getBookingById);

// Create booking
router.post('/', validationMiddleware.bookingValidation, bookingController.createBooking);

// Update booking
router.put('/:id', validationMiddleware.validateIdParam, bookingController.updateBooking);

// Delete booking
router.delete('/:id', validationMiddleware.validateIdParam, bookingController.deleteBooking);

// Get bookings by user ID (admin only or own bookings)
router.get(
  '/user/:userId',
  validationMiddleware.validateIdParam,
  validationMiddleware.paginationValidation,
  bookingController.getBookingsByUser
);

// Get bookings by field ID
router.get(
  '/field/:fieldId',
  validationMiddleware.validateIdParam,
  validationMiddleware.paginationValidation,
  bookingController.getBookingsByField
);

// Update payment status
router.patch(
  '/:id/payment',
  validationMiddleware.validateIdParam,
  bookingController.updatePaymentStatus
);

module.exports = router; 