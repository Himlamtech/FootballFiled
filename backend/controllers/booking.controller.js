const {
  Booking,
  User,
  Field,
  TimeSlot,
  Payment
} = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

/**
 * Get all bookings with filters
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllBookings = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Filters
    const {
      userId,
      fieldId,
      status,
      paymentStatus,
      startDate,
      endDate,
      upcoming
    } = req.query;

    const filters = {};

    if (userId) {
      filters.userId = userId;
    }

    if (fieldId) {
      filters.fieldId = fieldId;
    }

    if (status) {
      filters.status = status;
    }

    if (paymentStatus) {
      filters.paymentStatus = paymentStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      filters.bookingDate = {};

      if (startDate) {
        filters.bookingDate[Op.gte] = new Date(startDate);
      }

      if (endDate) {
        filters.bookingDate[Op.lte] = new Date(endDate);
      }
    }

    // Upcoming bookings filter
    if (upcoming === 'true') {
      filters.bookingDate = {
        [Op.gte]: new Date()
      };
      filters.status = {
        [Op.in]: ['pending', 'confirmed']
      };
    }

    // Execute query
    const bookings = await Booking.findAndCountAll({
      where: filters,
      include: [
        {
          model: User,
          attributes: ['userId', 'name', 'phoneNumber']
        },
        {
          model: Field,
          attributes: ['fieldId', 'name', 'size']
        },
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        }
      ],
      order: [['bookingDate', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      bookings: bookings.rows,
      totalCount: bookings.count,
      currentPage: page,
      totalPages: Math.ceil(bookings.count / limit)
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

/**
 * Get booking by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: User,
          attributes: ['userId', 'name', 'phoneNumber']
        },
        {
          model: Field,
          attributes: ['fieldId', 'name', 'size', 'pricePerHour']
        },
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Error fetching booking details', error: error.message });
  }
};

/**
 * Create new booking
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    console.log('Booking request body:', req.body);

    // Handle both camelCase and snake_case parameters
    const fieldId = req.body.fieldId || req.body.field_id;
    const timeSlotId = req.body.timeSlotId || req.body.time_slot_id;
    const bookingDate = req.body.bookingDate || req.body.booking_date || req.body.date;
    const totalPrice = req.body.totalPrice || req.body.total_price || req.body.price;
    const customerName = req.body.customerName || req.body.customer_name;
    const customerPhone = req.body.customerPhone || req.body.customer_phone || req.body.phone;
    const customerEmail = req.body.customerEmail || req.body.customer_email || req.body.email;
    const notes = req.body.notes || req.body.note;
    const paymentMethod = req.body.paymentMethod || req.body.payment_method || 'vietqr';
    const paymentStatus = req.body.paymentStatus || req.body.payment_status || 'pending';

    // Use default user ID if not authenticated
    const userId = req.user ? req.user.id : 1; // Default to admin user (ID 1)

    console.log('Processed booking parameters:', {
      fieldId, timeSlotId, bookingDate, totalPrice, customerName, customerPhone, customerEmail
    });

    if (!fieldId || !bookingDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fieldId and bookingDate are required'
      });
    }

    // Check if the time slot is available
    const existingBooking = await Booking.findOne({
      where: {
        fieldId,
        timeSlotId,
        bookingDate,
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      },
      transaction
    });

    if (existingBooking) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Get price info from field
    const field = await Field.findByPk(fieldId, { transaction });
    if (!field) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Field not found'
      });
    }

    // Get time slot info
    const timeSlot = await TimeSlot.findByPk(timeSlotId, { transaction });
    if (!timeSlot) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    // Calculate price if not provided
    let calculatedPrice = totalPrice;
    if (!calculatedPrice) {
      calculatedPrice = field.pricePerHour;
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      fieldId,
      timeSlotId,
      bookingDate,
      totalPrice: calculatedPrice,
      status: 'pending',
      paymentStatus: paymentStatus,
      customerName,
      customerPhone,
      customerEmail,
      notes
    }, { transaction });

    await transaction.commit();

    // Return with related data
    const newBooking = await Booking.findByPk(booking.bookingId, {
      include: [
        {
          model: Field,
          attributes: ['name', 'size']
        },
        {
          model: TimeSlot,
          attributes: ['startTime', 'endTime']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating booking',
      error: error.message
    });
  }
};

/**
 * Get bookings by field ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getBookingsByField = async (req, res) => {
  try {
    const fieldId = req.params.id;
    const { date } = req.query;

    if (!fieldId) {
      return res.status(400).json({ message: 'Field ID is required' });
    }

    const filters = { fieldId };

    // Add date filter if provided
    if (date) {
      filters.bookingDate = date;
    }

    // Get bookings for the field
    const bookings = await Booking.findAll({
      where: filters,
      include: [
        {
          model: User,
          attributes: ['userId', 'name', 'phoneNumber']
        },
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        }
      ],
      order: [['bookingDate', 'ASC'], ['createdAt', 'ASC']]
    });

    res.status(200).json({
      bookings: bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Get bookings by field error:', error);
    res.status(500).json({
      message: 'Error fetching bookings for field',
      error: error.message
    });
  }
};

/**
 * Update booking status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized
    const isAdmin = req.user.role === 'admin';
    const isStaff = req.user.role === 'staff';
    const isOwner = req.user.id === booking.userId;

    if (!isAdmin && !isStaff && !isOwner) {
      return res.status(403).json({ message: 'Unauthorized to update this booking' });
    }

    // If user is not admin/staff, they can only cancel their own bookings
    if (!isAdmin && !isStaff && status !== 'cancelled') {
      return res.status(403).json({
        message: 'As a user, you can only cancel your bookings'
      });
    }

    // Update booking status
    booking.status = status;

    // If cancelling a booking that was paid, mark it for refund
    if (status === 'cancelled' && booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    res.status(200).json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Error updating booking', error: error.message });
  }
};

/**
 * Get available time slots for a field on a specific date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { fieldId, date } = req.query;

    if (!fieldId || !date) {
      return res.status(400).json({ message: 'Field ID and date are required' });
    }

    // Get all time slots for the field
    const timeSlots = await TimeSlot.findAll({
      where: {
        fieldId,
        isActive: true
      },
      attributes: ['timeSlotId', 'startTime', 'endTime']
    });

    // Get booked time slots for the field on the given date
    const bookedTimeSlots = await Booking.findAll({
      where: {
        fieldId,
        bookingDate: date,
        status: {
          [Op.in]: ['pending', 'confirmed']
        }
      },
      attributes: ['timeSlotId']
    });

    const bookedTimeSlotIds = bookedTimeSlots.map(booking => booking.timeSlotId);

    // Filter out booked time slots
    const availableTimeSlots = timeSlots.map(slot => {
      const isBooked = bookedTimeSlotIds.includes(slot.timeSlotId);
      return {
        timeSlotId: slot.timeSlotId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: !isBooked
      };
    });

    res.status(200).json(availableTimeSlots);
  } catch (error) {
    console.error('Get available time slots error:', error);
    res.status(500).json({
      message: 'Error fetching available time slots',
      error: error.message
    });
  }
};