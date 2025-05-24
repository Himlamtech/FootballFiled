const {
  Booking,
  Field,
  TimeSlot
} = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { sendBookingConfirmation } = require('../utils/emailService');

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

    if (!fieldId || !timeSlotId || !bookingDate) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: fieldId, timeSlotId, and bookingDate are required'
      });
    }

    // Check if the time slot is already booked
    const existingBooking = await Booking.findOne({
      where: {
        fieldId,
        timeSlotId,
        bookingDate,
        status: 'Đã đặt'
      },
      transaction
    });

    if (existingBooking) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please select another time slot.'
      });
    }

    // Check if the time slot is locked (using isActive column)
    const timeSlot = await TimeSlot.findByPk(timeSlotId, { transaction });
    if (!timeSlot) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Time slot not found'
      });
    }

    if (!timeSlot.isActive) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'This time slot is locked by admin and not available for booking.'
      });
    }

    // Calculate price if not provided (using the timeSlot we already fetched)
    let calculatedPrice = totalPrice;
    if (!calculatedPrice) {
      // Determine if it's a weekend to set the correct price
      const bookingDateObj = new Date(bookingDate);
      const isWeekend = bookingDateObj.getDay() === 0 || bookingDateObj.getDay() === 6;
      calculatedPrice = isWeekend ? Number(timeSlot.weekendPrice) : Number(timeSlot.weekdayPrice);
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

    // Send booking confirmation email if email is provided
    if (customerEmail) {
      try {
        // Attempt to send email but don't wait for it to complete
        // This way, the booking response is sent immediately
        sendBookingConfirmation(
          newBooking,
          newBooking.Field,
          newBooking.TimeSlot
        )
        .then(() => {
          console.log(`Booking confirmation email sent to ${customerEmail}`);
        })
        .catch(emailError => {
          console.error('Failed to send booking confirmation email:', emailError);
          // Don't fail the booking creation if email sending fails
        });
      } catch (emailError) {
        console.error('Error initiating email sending:', emailError);
        // Don't fail the booking creation if email sending fails
      }
    }

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

    // Determine if it's a weekend to set the correct price
    const bookingDate = new Date(date);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;

    // Get booked time slots for the field on the given date
    const bookedTimeSlots = await Booking.findAll({
      where: {
        fieldId,
        bookingDate: date,
        status: 'Đã đặt'
      },
      attributes: ['timeSlotId']
    });

    const bookedTimeSlotIds = bookedTimeSlots.map(booking => booking.timeSlotId);

    // Note: Time slot locking is now handled by the isActive column in TimeSlots table
    const lockedTimeSlotIds = [];

    // Get all time slots with pricing information (including locked ones for display)
    const timeSlotsWithPricing = await TimeSlot.findAll({
      where: {
        fieldId
      },
      attributes: ['timeSlotId', 'startTime', 'endTime', 'weekdayPrice', 'weekendPrice', 'isActive']
    });

    // Filter out booked and locked time slots and format for frontend
    const availableTimeSlots = timeSlotsWithPricing.map(slot => {
      const isBooked = bookedTimeSlotIds.includes(slot.timeSlotId);
      const isLocked = !slot.isActive; // Time slot is locked if isActive is false
      const price = isWeekend ? Number(slot.weekendPrice) : Number(slot.weekdayPrice);

      return {
        id: slot.timeSlotId,
        start_time: slot.startTime,
        end_time: slot.endTime,
        price: price,
        available: !isBooked && !isLocked,
        isLocked: isLocked,
        isBooked: isBooked
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

/**
 * Update booking
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const updateData = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update the booking
    await booking.update(updateData);

    // Fetch updated booking with related data
    const updatedBooking = await Booking.findByPk(bookingId, {
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

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating booking',
      error: error.message
    });
  }
};

/**
 * Delete booking
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    await booking.destroy();

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting booking',
      error: error.message
    });
  }
};