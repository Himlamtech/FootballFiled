const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, isStaffOrAdmin } = require('../middleware/auth.middleware');
const { bookingValidationRules, validate } = require('../middleware/validation.middleware');

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with filters
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  bookingController.getAllBookings
);

/**
 * @route   GET /api/bookings/timeslots
 * @desc    Get available time slots for a field on a specific date
 * @access  Public
 */
router.get(
  '/timeslots',
  bookingController.getAvailableTimeSlots
);

/**
 * @route   GET /api/bookings/field/:id
 * @desc    Get bookings for a specific field
 * @access  Public
 */
router.get(
  '/field/:id',
  bookingController.getBookingsByField
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  bookingController.getBookingById
);

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Public (temporarily made public to fix frontend issues)
 */
router.post(
  '/',
  bookingValidationRules,
  validate,
  bookingController.createBooking
);

/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status
 * @access  Private
 */
router.patch(
  '/:id/status',
  authenticate,
  bookingController.updateBookingStatus
);

module.exports = router;