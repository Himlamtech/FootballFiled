const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const {
  bookingValidation,
  idValidation,
  fieldIdValidation,
  paginationValidation,
  paymentStatusValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/field/:fieldId', fieldIdValidation, paginationValidation, bookingController.getBookingsByField);

// Protected routes - require authentication
router.get('/', verifyToken, paginationValidation, bookingController.getAllBookings);
router.get('/:id', verifyToken, idValidation, bookingController.getBookingById);
router.post('/', verifyToken, bookingValidation, bookingController.createBooking);
router.put('/:id', verifyToken, idValidation, bookingValidation, bookingController.updateBooking);
router.delete('/:id', verifyToken, idValidation, bookingController.deleteBooking);

// User specific bookings
router.get('/user/:userId', verifyToken, idValidation, paginationValidation, isOwnerOrAdmin, bookingController.getBookingsByUser);

// Payment update
router.patch('/:id/payment', verifyToken, idValidation, paymentStatusValidation, bookingController.updatePaymentStatus);

module.exports = router;