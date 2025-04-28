const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const Field = db.Field;
const Booking = db.Booking;
const { Op } = db.Sequelize;

/**
 * Get all fields with pagination and filters
 * @param {Object} options - Query options (filters, pagination)
 * @returns {Object} Paginated list of fields
 */
const getAllFields = async (options = {}) => {
  try {
    const {
      status,
      size,
      page = 1,
      limit = 10
    } = options;

    // Build filter conditions
    const condition = {};
    if (status) condition.status = status;
    if (size) condition.size = size;

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Query fields with pagination
    const { count, rows } = await Field.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return {
      totalItems: count,
      totalPages,
      currentPage: page,
      fields: rows
    };
  } catch (error) {
    logger.error('Error fetching fields:', error);
    throw error;
  }
};

/**
 * Get field by ID
 * @param {Number} id - Field ID
 * @returns {Object} Field details
 */
const getFieldById = async (id) => {
  try {
    const field = await Field.findByPk(id);

    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    return field;
  } catch (error) {
    logger.error(`Error fetching field ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new field
 * @param {Object} fieldData - Field data
 * @returns {Object} Created field
 */
const createField = async (fieldData) => {
  try {
    // Create field
    const field = await Field.create(fieldData);

    return field;
  } catch (error) {
    logger.error('Error creating field:', error);
    throw error;
  }
};

/**
 * Update a field
 * @param {Number} id - Field ID
 * @param {Object} fieldData - Field data to update
 * @returns {Object} Updated field
 */
const updateField = async (id, fieldData) => {
  try {
    // Find field
    const field = await Field.findByPk(id);

    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Update field
    await field.update(fieldData);

    return field;
  } catch (error) {
    logger.error(`Error updating field ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a field
 * @param {Number} id - Field ID
 * @returns {Boolean} Success status
 */
const deleteField = async (id) => {
  try {
    // Check if field exists
    const field = await Field.findByPk(id);

    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Check if field has associated bookings
    const bookings = await Booking.count({ where: { fieldId: id } });

    if (bookings > 0) {
      throw new ApiError(400, 'Cannot delete field with existing bookings');
    }

    // Delete field
    await field.destroy();

    return true;
  } catch (error) {
    logger.error(`Error deleting field ID ${id}:`, error);
    throw error;
  }
};

/**
 * Check field availability for a given date and time
 * @param {Number} fieldId - Field ID
 * @param {String} date - Booking date (YYYY-MM-DD)
 * @param {String} startTime - Start time (HH:MM:SS)
 * @param {String} endTime - End time (HH:MM:SS)
 * @returns {Boolean} Availability status
 */
const checkFieldAvailability = async (fieldId, date, startTime, endTime) => {
  try {
    // Find field
    const field = await Field.findByPk(fieldId);

    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Log field details for debugging
    console.log('Field found:', field.toJSON());

    // Check if field is available
    if (field.status !== 'available') {
      return false;
    }

    // Find bookings that overlap with the requested time slot
    const overlappingBookings = await Booking.count({
      where: {
        fieldId,
        bookingDate: date,
        status: { [Op.notIn]: ['cancelled'] },
        [Op.or]: [
          // Case 1: New booking starts during an existing booking
          {
            startTime: { [Op.lte]: startTime },
            endTime: { [Op.gt]: startTime }
          },
          // Case 2: New booking ends during an existing booking
          {
            startTime: { [Op.lt]: endTime },
            endTime: { [Op.gte]: endTime }
          },
          // Case 3: New booking completely contains an existing booking
          {
            startTime: { [Op.gte]: startTime },
            endTime: { [Op.lte]: endTime }
          }
        ]
      }
    });

    return overlappingBookings === 0;
  } catch (error) {
    logger.error(`Error checking field availability (fieldId: ${fieldId}, date: ${date}):`, error);
    throw error;
  }
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  checkFieldAvailability
};