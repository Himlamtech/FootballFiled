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
          model: Field,
          attributes: ['fieldId', 'name', 'size']
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

    // Calculate price if not provided
    let calculatedPrice = totalPrice;
    if (!calculatedPrice) {
      const timeSlot = await TimeSlot.findByPk(timeSlotId, { transaction });
      if (!timeSlot) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: 'Time slot not found'
        });
      }
      calculatedPrice = timeSlot.price;
    }

    // Create booking
    const booking = await Booking.create({
      fieldId,
      timeSlotId,
      bookingDate,
      totalPrice: calculatedPrice,
      status: 'Đã đặt',
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
    if (date) {
      filters.bookingDate = date;
    }

    // Get bookings for the field
    const bookings = await Booking.findAll({
      where: filters,
      include: [
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime', 'weekdayPrice', 'weekendPrice']
        },
        {
          model: Field,
          attributes: ['fieldId', 'name', 'size']
        }
      ],
      order: [['bookingDate', 'ASC'], ['createdAt', 'ASC']]
    });

    // Map bookings to frontend-friendly format
    const mapped = bookings.map(b => ({
      id: b.bookingId,
      customerName: b.customerName || '',
      customerPhone: b.customerPhone || '',
      fieldId: b.fieldId,
      fieldName: b.Field ? b.Field.name : '',
      timeSlotId: b.timeSlotId,
      timeSlot: b.TimeSlot ? `${b.TimeSlot.startTime?.substring(0,5)} - ${b.TimeSlot.endTime?.substring(0,5)}` : '',
      price: Number(b.totalPrice),
      status: b.status,
      bookingDate: b.bookingDate,
    }));

    res.status(200).json({
      bookings: mapped,
      count: mapped.length
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

/**
 * Get all bookings (admin)
 * @param {Object} req
 * @param {Object} res
 */
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Field,
          attributes: ['fieldId', 'name', 'size']
        },
        {
          model: TimeSlot,
          attributes: ['timeSlotId', 'startTime', 'endTime']
        }
      ],
      order: [['bookingDate', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({ bookings, count: bookings.length });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
  }
};