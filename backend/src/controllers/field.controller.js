const { Field, Feedback, Booking, TimeSlot } = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get all fields with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllFields = async (req, res, next) => {
  try {
    const { status, size, page = 1, limit = 10 } = req.query;

    // Build filter conditions
    const where = {};
    if (status) where.status = status;
    if (size) where.size = size;

    // Pagination options
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get fields with pagination
    const { count, rows } = await Field.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['id', 'ASC']]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      fields: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error getting fields:', error);
    next(error);
  }
};

/**
 * Get field by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFieldById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get field by ID
    const field = await Field.findByPk(id);
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Get field rating
    const feedbacks = await Feedback.findAll({
      where: { field_id: id }
    });

    // Calculate average rating if there are feedbacks
    let rating = null;
    let ratingCount = 0;

    if (feedbacks.length > 0) {
      ratingCount = feedbacks.length;
    }

    res.status(200).json({
      ...field.toJSON(),
      rating,
      ratingCount
    });
  } catch (error) {
    logger.error('Error getting field by ID:', error);
    next(error);
  }
};

/**
 * Create a new field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createField = async (req, res, next) => {
  try {
    const fieldData = req.body;

    // Create field
    const field = await Field.create(fieldData);

    res.status(201).json(field);
  } catch (error) {
    logger.error('Error creating field:', error);
    next(error);
  }
};

/**
 * Update a field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fieldData = req.body;

    // Check if field exists
    const field = await Field.findByPk(id);
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Update field
    await field.update(fieldData);

    res.status(200).json(field);
  } catch (error) {
    logger.error('Error updating field:', error);
    next(error);
  }
};

/**
 * Delete a field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteField = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if field exists
    const field = await Field.findByPk(id);
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Delete field
    await field.destroy();

    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting field:', error);
    next(error);
  }
};

/**
 * Get time slots for a field on a specific date
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFieldTimeSlots = async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const { date } = req.query;

    if (!fieldId || !date) {
      throw new ApiError(400, 'Field ID and date are required');
    }

    // Check if field exists
    const field = await Field.findByPk(fieldId);
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Get all time slots
    const timeSlots = await TimeSlot.findAll({
      where: { is_active: true },
      order: [['start_time', 'ASC']]
    });

    // Get bookings for the field on the specified date
    const bookings = await Booking.findAll({
      where: {
        field_id: fieldId,
        booking_date: date,
        status: {
          [Op.notIn]: ['cancelled']
        }
      },
      include: [
        {
          model: TimeSlot,
          as: 'time_slot'
        }
      ]
    });

    // Mark time slots as booked if they have bookings
    const timeSlotsWithAvailability = timeSlots.map(slot => {
      const isBooked = bookings.some(booking => booking.time_slot_id === slot.id);
      return {
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_booked: isBooked
      };
    });

    res.status(200).json({
      fieldId: parseInt(fieldId),
      date,
      timeSlots: timeSlotsWithAvailability
    });
  } catch (error) {
    logger.error('Error getting field time slots:', error);
    next(error);
  }
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  getFieldTimeSlots
};