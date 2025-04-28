const bookingService = require('../services/booking.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all bookings with filters and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { userId, fieldId, status, date, page, limit } = req.query;

    const options = {
      userId,
      fieldId,
      status,
      date,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      userRole: req.user.role,
      currentUserId: req.user.id
    };

    const result = await bookingService.getAllBookings(options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingById(id, req.user.role, req.user.id);

    res.status(200).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createBooking = async (req, res, next) => {
  try {
    const bookingData = req.body;
    const userId = req.user.id;

    const booking = await bookingService.createBooking(bookingData, userId);

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookingData = req.body;

    const updatedBooking = await bookingService.updateBooking(
      id,
      bookingData,
      req.user.role,
      req.user.id
    );

    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    await bookingService.deleteBooking(id, req.user.role, req.user.id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBookingsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, limit, status } = req.query;

    // Check if user has permission to view these bookings
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId, 10)) {
      throw new ApiError(403, 'You do not have permission to view these bookings');
    }

    const options = {
      userId,
      status,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      userRole: req.user.role,
      currentUserId: req.user.id
    };

    const result = await bookingService.getAllBookings(options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings by field ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getBookingsByField = async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const { page, limit, date, status } = req.query;

    // For public access, we only show basic booking info
    const options = {
      fieldId,
      status,
      date,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      userRole: 'public', // Public role for unauthenticated requests
      currentUserId: null
    };

    // If user is authenticated, use their role and ID
    if (req.user) {
      options.userRole = req.user.role;
      options.currentUserId = req.user.id;
    }

    const result = await bookingService.getAllBookings(options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking payment status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;

    if (!paymentStatus) {
      throw new ApiError(400, 'Payment status is required');
    }

    const bookingData = {
      paymentStatus,
      paymentMethod
    };

    const updatedBooking = await bookingService.updateBooking(
      id,
      bookingData,
      req.user.role,
      req.user.id
    );

    res.status(200).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsByUser,
  getBookingsByField,
  updatePaymentStatus
};