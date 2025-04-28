const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const fieldService = require('./field.service');

const Booking = db.Booking;
const User = db.User;
const Field = db.Field;
const Product = db.Product;
const BookingProduct = db.BookingProduct;
const { Op } = db.Sequelize;

/**
 * Get all bookings with pagination and filters
 * @param {Object} options - Query options (filters, pagination, user role)
 * @returns {Object} Paginated list of bookings
 */
const getAllBookings = async (options = {}) => {
  try {
    const {
      userId,
      fieldId,
      status,
      date,
      page = 1,
      limit = 10,
      userRole,
      currentUserId
    } = options;

    // Build filter conditions
    const condition = {};

    // Handle different user roles
    if (userRole === 'admin') {
      // Admin can see all bookings or filter by userId
      if (userId) {
        condition.user_id = userId;
      }
    } else if (userRole === 'public') {
      // Public access - only show basic booking info for the field
      // No need to filter by userId as we're only showing public info
      if (fieldId) {
        condition.field_id = fieldId;
      }
    } else {
      // Regular user - only show their own bookings
      condition.user_id = currentUserId;
    }

    if (fieldId) condition.field_id = fieldId;
    if (status) condition.status = status;
    if (date) condition.booking_date = date;

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Query bookings with pagination and includes
    const { count, rows } = await Booking.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['booking_date', 'DESC'], ['start_time', 'ASC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Field,
          as: 'field',
          attributes: ['id', 'name', 'location', 'hourlyRate']
        },
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price']
          }
        }
      ]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return {
      totalItems: count,
      totalPages,
      currentPage: page,
      bookings: rows
    };
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    throw error;
  }
};

/**
 * Get booking by ID
 * @param {Number} id - Booking ID
 * @param {String} userRole - User role (to check permissions)
 * @param {Number} userId - Current user ID
 * @returns {Object} Booking details
 */
const getBookingById = async (id, userRole, userId) => {
  try {
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Field,
          as: 'field',
          attributes: ['id', 'name', 'location', 'hourlyRate']
        },
        {
          model: Product,
          as: 'products',
          through: {
            attributes: ['quantity', 'price']
          }
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Check if user has permission to view this booking
    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to view this booking');
    }

    return booking;
  } catch (error) {
    logger.error(`Error fetching booking ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @param {Number} userId - User ID creating the booking
 * @returns {Object} Created booking
 */
const createBooking = async (bookingData, userId) => {
  const transaction = await db.sequelize.transaction();

  try {
    const { field_id, booking_date, start_time, end_time, products } = bookingData;
    const fieldId = field_id;
    const bookingDate = booking_date;
    const startTime = start_time;
    const endTime = end_time;

    console.log('Booking data:', { fieldId, bookingDate, startTime, endTime, products });

    // Check field availability
    const isAvailable = await fieldService.checkFieldAvailability(
      fieldId,
      bookingDate,
      startTime,
      endTime
    );

    if (!isAvailable) {
      throw new ApiError(400, 'Field is not available for the selected time slot');
    }

    // Get field details to calculate price
    const field = await Field.findByPk(fieldId);
    if (!field) {
      throw new ApiError(404, 'Field not found');
    }

    // Calculate booking duration in hours
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const durationHours = (end - start) / (1000 * 60 * 60);

    // Calculate field cost
    let totalPrice = field.hourlyRate * durationHours;

    // Create booking
    const booking = await Booking.create({
      userId,
      fieldId,
      bookingDate,
      startTime,
      endTime,
      status: 'pending',
      totalPrice,
      paymentStatus: 'pending'
    }, { transaction });

    // Add products if any
    if (products && products.length > 0) {
      let productTotal = 0;

      // Validate and add each product
      for (const item of products) {
        const product = await Product.findByPk(item.id);
        if (!product) {
          throw new ApiError(404, `Product ID ${item.id} not found`);
        }

        const quantity = item.quantity || 1;
        const itemPrice = product.price * quantity;
        productTotal += itemPrice;

        // Add to BookingProduct junction table
        await BookingProduct.create({
          bookingId: booking.id,
          productId: product.id,
          quantity,
          price: product.price
        }, { transaction });
      }

      // Update total price with products
      totalPrice += productTotal;
      await booking.update({ totalPrice }, { transaction });
    }

    // Update field status if needed
    await field.update({ status: 'booked' }, { transaction });

    await transaction.commit();

    // Return booking with associations
    return getBookingById(booking.id, 'user', userId);
  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Update a booking
 * @param {Number} id - Booking ID
 * @param {Object} bookingData - Booking data to update
 * @param {String} userRole - User role
 * @param {Number} userId - Current user ID
 * @returns {Object} Updated booking
 */
const updateBooking = async (id, bookingData, userRole, userId) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Find booking
    const booking = await Booking.findByPk(id);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Check if user has permission to update this booking
    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to update this booking');
    }

    // If changing date/time, check availability
    if (bookingData.bookingDate || bookingData.startTime || bookingData.endTime) {
      const isAvailable = await fieldService.checkFieldAvailability(
        booking.fieldId,
        bookingData.bookingDate || booking.bookingDate,
        bookingData.startTime || booking.startTime,
        bookingData.endTime || booking.endTime
      );

      if (!isAvailable) {
        throw new ApiError(400, 'Field is not available for the selected time slot');
      }
    }

    // Update booking
    await booking.update(bookingData, { transaction });

    // If status changed to cancelled, update field status
    if (bookingData.status === 'cancelled' && booking.status !== 'cancelled') {
      const field = await Field.findByPk(booking.fieldId);
      await field.update({ status: 'available' }, { transaction });
    }

    await transaction.commit();

    // Return updated booking with associations
    return getBookingById(id, userRole, userId);
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error updating booking ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a booking
 * @param {Number} id - Booking ID
 * @param {String} userRole - User role
 * @param {Number} userId - Current user ID
 * @returns {Boolean} Success status
 */
const deleteBooking = async (id, userRole, userId) => {
  const transaction = await db.sequelize.transaction();

  try {
    // Find booking
    const booking = await Booking.findByPk(id);

    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }

    // Check if user has permission to delete this booking
    if (userRole !== 'admin' && booking.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this booking');
    }

    // Only allow deleting pending bookings
    if (booking.status !== 'pending') {
      throw new ApiError(400, 'Only pending bookings can be deleted');
    }

    // Update field status
    const field = await Field.findByPk(booking.fieldId);
    await field.update({ status: 'available' }, { transaction });

    // Delete booking products
    await BookingProduct.destroy({
      where: { bookingId: id },
      transaction
    });

    // Delete booking
    await booking.destroy({ transaction });

    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error deleting booking ID ${id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking
};