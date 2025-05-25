const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const { bookingValidationRules, validate } = require('../middleware/validation.middleware');

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings with filters
 * @access  Private/Admin
 */
router.get(
  '/',
  authenticate,
  isAdmin,
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
 * @access  Public
 */
router.get(
  '/:id',
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
 * @route   PUT /api/bookings/:id
 * @desc    Update a booking
 * @access  Private/Admin
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  bookingController.updateBooking
);

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Delete a booking
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  bookingController.deleteBooking
);

module.exports = router;