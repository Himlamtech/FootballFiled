const { Booking, Field, TimeSlot, Product, BookingProduct } = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const financeService = require('../services/finance.service');

/**
 * Get all bookings with filters and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { fieldId, status, date, page = 1, limit = 10 } = req.query;

    // Build filter conditions
    const where = {};
    if (fieldId) where.field_id = fieldId;
    if (status) where.status = status;
    if (date) where.booking_date = date;

    // Pagination options
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with pagination
    const { count, rows } = await Booking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['booking_date', 'DESC'], ['created_at', 'DESC']],
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        },
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      bookings: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error getting bookings:', error);
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

    // Get booking by ID
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        },
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found', null, true);
    }

    res.status(200).json(booking);
  } catch (error) {
    logger.error('Error getting booking by ID:', error);
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
    const {
      field_id,
      time_slot_id,
      booking_date,
      customer_name,
      customer_phone,
      customer_email,
      products,
      payment_method,
      notes
    } = req.body;

    // Check if field exists
    const field = await Field.findByPk(field_id);
    if (!field) {
      throw new ApiError(404, 'Field not found', null, true);
    }

    // Check if time slot exists
    const timeSlot = await TimeSlot.findByPk(time_slot_id);
    if (!timeSlot) {
      throw new ApiError(404, 'Time slot not found', null, true);
    }

    // Check if the time slot is already booked for this field on this date
    const existingBooking = await Booking.findOne({
      where: {
        field_id,
        time_slot_id,
        booking_date,
        status: {
          [Op.notIn]: ['cancelled']
        }
      }
    });

    if (existingBooking) {
      // Find alternative time slots for the same field on the same date
      const availableTimeSlots = await TimeSlot.findAll({
        where: {
          id: {
            [Op.ne]: time_slot_id
          }
        },
        raw: true
      });
      
      // Check which slots are not booked
      const bookedSlots = await Booking.findAll({
        where: {
          field_id,
          booking_date,
          status: {
            [Op.notIn]: ['cancelled']
          }
        },
        attributes: ['time_slot_id'],
        raw: true
      });
      
      const bookedSlotIds = bookedSlots.map(slot => slot.time_slot_id);
      const alternativeSlots = availableTimeSlots.filter(slot => !bookedSlotIds.includes(slot.id));
      
      throw new ApiError(400, 'This time slot is already booked for this field on this date', {
        availableAlternatives: alternativeSlots
      }, true);
    }

    // Calculate total price
    let totalPrice = field.price_per_hour;

    // Check if booking is on weekend
    const bookingDate = new Date(booking_date);
    const dayOfWeek = bookingDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 is Sunday, 6 is Saturday
      totalPrice = field.price_per_hour_weekend;
    }

    // Add product prices if any
    let productItems = [];
    if (products && products.length > 0) {
      // Validate products
      for (const item of products) {
        const product = await Product.findByPk(item.product_id);
        if (!product) {
          throw new ApiError(404, `Product with ID ${item.product_id} not found`, null, true);
        }

        if (item.quantity <= 0) {
          throw new ApiError(400, 'Product quantity must be greater than 0', null, true);
        }

        if (product.stock_quantity < item.quantity) {
          throw new ApiError(400, `Not enough stock for product ${product.name}`, null, true);
        }

        totalPrice += product.price * item.quantity;

        productItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        });
      }
    }

    // Create booking
    const booking = await Booking.create({
      field_id,
      time_slot_id,
      booking_date,
      customer_name,
      customer_phone,
      customer_email,
      status: 'pending',
      total_price: totalPrice,
      payment_status: 'pending',
      payment_method: payment_method || 'cash',
      notes
    });

    // Add products to booking if any
    if (productItems.length > 0) {
      for (const item of productItems) {
        await BookingProduct.create({
          booking_id: booking.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        });

        // Update product stock
        const product = await Product.findByPk(item.product_id);
        await product.update({
          stock_quantity: product.stock_quantity - item.quantity
        });
      }
    }

    // Get booking with related data
    const bookingWithRelations = await Booking.findByPk(booking.id, {
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        },
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    res.status(201).json(bookingWithRelations);
  } catch (error) {
    logger.error('Error creating booking:', error);
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

    // Check if booking exists
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found', null, true);
    }

    // If changing time slot or date, check if new slot is available
    if ((bookingData.time_slot_id && bookingData.time_slot_id !== booking.time_slot_id) ||
        (bookingData.booking_date && bookingData.booking_date !== booking.booking_date)) {

      const existingBooking = await Booking.findOne({
        where: {
          field_id: bookingData.field_id || booking.field_id,
          time_slot_id: bookingData.time_slot_id || booking.time_slot_id,
          booking_date: bookingData.booking_date || booking.booking_date,
          status: {
            [Op.notIn]: ['cancelled']
          },
          id: {
            [Op.ne]: id
          }
        }
      });

      if (existingBooking) {
        throw new ApiError(400, 'This time slot is already booked for this field on this date', null, true);
      }
    }

    // Update booking
    await booking.update(bookingData);

    // Get updated booking with related data
    const updatedBooking = await Booking.findByPk(id, {
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        },
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    logger.error('Error updating booking:', error);
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

    // Check if booking exists
    const booking = await Booking.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    if (!booking) {
      throw new ApiError(404, 'Booking not found', null, true);
    }

    // Return products to stock
    for (const product of booking.products) {
      await Product.increment(
        { stock_quantity: product.BookingProduct.quantity },
        { where: { id: product.id } }
      );
    }

    // Delete booking
    await booking.destroy();

    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting booking:', error);
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
    const { date, status, page = 1, limit = 10 } = req.query;

    // Build filter conditions
    const where = { field_id: fieldId };
    if (date) where.booking_date = date;
    if (status) where.status = status;

    // Pagination options
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with pagination
    const { count, rows } = await Booking.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['booking_date', 'DESC'], ['created_at', 'DESC']],
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        }
      ]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      bookings: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error getting bookings by field:', error);
    next(error);
  }
};

/**
 * Update booking status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new ApiError(400, 'Status is required', null, true);
    }

    // Check if booking exists
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', null, true);
    }

    // Update booking status
    await booking.update({ status });

    // Get updated booking with related data
    const updatedBooking = await Booking.findByPk(id, {
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        },
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    logger.error('Error updating booking status:', error);
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
    const { payment_status, payment_method } = req.body;

    if (!payment_status) {
      throw new ApiError(400, 'Payment status is required', null, true);
    }

    // Check if booking exists
    const booking = await Booking.findByPk(id);
    if (!booking) {
      throw new ApiError(404, 'Booking not found', null, true);
    }

    // Update booking payment status
    const updateData = { payment_status };
    if (payment_method) {
      updateData.payment_method = payment_method;
    }

    await booking.update(updateData);

    // Get updated booking with related data
    const updatedBooking = await Booking.findByPk(id, {
      include: [
        {
          model: Field,
          as: 'field'
        },
        {
          model: TimeSlot,
          as: 'time_slot'
        },
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ]
    });

    // Create finance record if payment status is 'paid'
    if (payment_status === 'paid') {
      try {
        await financeService.createFinanceFromBooking(updatedBooking);
        logger.info(`Created finance record for booking ID ${id}`);
      } catch (financeError) {
        logger.error(`Error creating finance record for booking ID ${id}:`, financeError);
        // Don't fail the booking update if finance record creation fails
      }
    }

    res.status(200).json(updatedBooking);
  } catch (error) {
    logger.error('Error updating booking payment status:', error);
    next(error);
  }
};

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingsByField,
  updateBookingStatus,
  updatePaymentStatus
};