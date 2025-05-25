const { Field, TimeSlot, Booking } = require('../models');
const { Op } = require('sequelize');
const { catchAsync, AppError } = require('../utils/error');

/**
 * Get field status with bookings and lock information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getFieldStatus = catchAsync(async (req, res) => {
  const { fieldId, date } = req.query;

  if (!fieldId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Field ID and date are required'
    });
  }

  console.log(`Getting field status for field ${fieldId} on ${date}`);

  // Get all time slots for the field
  const timeSlots = await TimeSlot.findAll({
    where: { fieldId: parseInt(fieldId) },
    order: [['startTime', 'ASC']]
  });

  // Get bookings for the specific date
  const bookings = await Booking.findAll({
    where: {
      fieldId: parseInt(fieldId),
      bookingDate: date
    },
    include: [
      {
        model: TimeSlot,
        attributes: ['timeSlotId', 'startTime', 'endTime']
      }
    ]
  });

  // Map time slots with booking and lock status
  const fieldStatus = timeSlots.map(timeSlot => {
    const booking = bookings.find(b => b.timeSlotId === timeSlot.timeSlotId);
    const isBooked = !!booking;
    const isLocked = !timeSlot.isActive; // Time slot is locked if isActive is false

    return {
      id: timeSlot.timeSlotId,
      timeSlotId: timeSlot.timeSlotId,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      isBooked: isBooked,
      isLocked: isLocked,
      lockReason: isLocked ? 'Locked by admin' : null,
      customer: isBooked ? {
        name: booking.customerName || '',
        phone: booking.customerPhone || '',
        email: booking.customerEmail || ''
      } : null
    };
  });

  res.status(200).json({
    success: true,
    fieldStatus: fieldStatus
  });
});

/**
 * Lock a specific time slot
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.lockTimeSlot = catchAsync(async (req, res) => {
  const { fieldId } = req.params;
  const { date, timeSlotId } = req.body;

  if (!date || !timeSlotId) {
    return res.status(400).json({
      success: false,
      message: 'Date and time slot ID are required'
    });
  }

  console.log(`Locking time slot ${timeSlotId} for field ${fieldId} on ${date}`);

  // Find the time slot
  const timeSlot = await TimeSlot.findOne({
    where: {
      timeSlotId: parseInt(timeSlotId),
      fieldId: parseInt(fieldId)
    }
  });

  if (!timeSlot) {
    return res.status(404).json({
      success: false,
      message: 'Time slot not found'
    });
  }

  // Check if there's already a booking for this time slot on this date
  const existingBooking = await Booking.findOne({
    where: {
      fieldId: parseInt(fieldId),
      timeSlotId: parseInt(timeSlotId),
      bookingDate: date
    }
  });

  if (existingBooking) {
    return res.status(400).json({
      success: false,
      message: 'Cannot lock time slot that already has a booking'
    });
  }

  // Lock the time slot by setting isActive to false
  await timeSlot.update({ isActive: false });

  res.status(200).json({
    success: true,
    message: 'Time slot locked successfully'
  });
});

/**
 * Unlock a specific time slot
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.unlockTimeSlot = catchAsync(async (req, res) => {
  const { fieldId } = req.params;
  const { date, timeSlotId } = req.body;

  if (!date || !timeSlotId) {
    return res.status(400).json({
      success: false,
      message: 'Date and time slot ID are required'
    });
  }

  console.log(`Unlocking time slot ${timeSlotId} for field ${fieldId} on ${date}`);

  // Find the time slot
  const timeSlot = await TimeSlot.findOne({
    where: {
      timeSlotId: parseInt(timeSlotId),
      fieldId: parseInt(fieldId)
    }
  });

  if (!timeSlot) {
    return res.status(404).json({
      success: false,
      message: 'Time slot not found'
    });
  }

  // Unlock the time slot by setting isActive to true
  await timeSlot.update({ isActive: true });

  res.status(200).json({
    success: true,
    message: 'Time slot unlocked successfully'
  });
});

/**
 * Lock all time slots for a field on a specific date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.lockAllTimeSlots = catchAsync(async (req, res) => {
  const { fieldId } = req.params;
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    });
  }

  console.log(`Locking all time slots for field ${fieldId} on ${date}`);

  // Get all time slots for the field
  const timeSlots = await TimeSlot.findAll({
    where: { fieldId: parseInt(fieldId) }
  });

  // Get existing bookings for this date
  const existingBookings = await Booking.findAll({
    where: {
      fieldId: parseInt(fieldId),
      bookingDate: date
    }
  });

  const bookedTimeSlotIds = existingBookings.map(booking => booking.timeSlotId);

  // Lock only time slots that don't have bookings
  const timeSlotsToLock = timeSlots.filter(ts => !bookedTimeSlotIds.includes(ts.timeSlotId));

  if (timeSlotsToLock.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'All time slots are already booked'
    });
  }

  // Lock the time slots by setting isActive to false
  await TimeSlot.update(
    { isActive: false },
    {
      where: {
        timeSlotId: {
          [Op.in]: timeSlotsToLock.map(ts => ts.timeSlotId)
        }
      }
    }
  );

  res.status(200).json({
    success: true,
    message: `Locked ${timeSlotsToLock.length} time slots successfully`
  });
});

/**
 * Unlock all time slots for a field on a specific date
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.unlockAllTimeSlots = catchAsync(async (req, res) => {
  const { fieldId } = req.params;
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Date is required'
    });
  }

  console.log(`Unlocking all time slots for field ${fieldId} on ${date}`);

  // Get all time slots for the field
  const timeSlots = await TimeSlot.findAll({
    where: { fieldId: parseInt(fieldId) }
  });

  // Unlock all time slots by setting isActive to true
  await TimeSlot.update(
    { isActive: true },
    {
      where: {
        fieldId: parseInt(fieldId)
      }
    }
  );

  res.status(200).json({
    success: true,
    message: `Unlocked ${timeSlots.length} time slots successfully`
  });
});
