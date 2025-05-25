const { TimeSlot, Booking } = require('../models');
const { Op } = require('sequelize');
const { catchAsync, AppError } = require('../utils/error');

// Get all time slots
exports.getAllTimeSlots = catchAsync(async (req, res) => {
  const timeSlots = await TimeSlot.findAll({
    where: { isActive: true }
  });

  res.status(200).json({
    success: true,
    count: timeSlots.length,
    data: timeSlots
  });
});

// Get time slots with availability for a specific field and date
exports.getAvailableTimeSlots = catchAsync(async (req, res) => {
  const fieldId = req.query.fieldId || req.query.field_id;
  const date = req.query.date;

  if (!fieldId || !date) {
    return res.status(400).json({
      success: false,
      message: 'Please provide fieldId and date'
    });
  }

  // Get all time slots for the field (including locked ones for display)
  const timeSlots = await TimeSlot.findAll({
    where: { fieldId: fieldId },
    order: [['startTime', 'ASC']]
  });

  // Get bookings for the specified field and date
  const bookings = await Booking.findAll({
    where: {
      fieldId: fieldId,
      bookingDate: date,
      status: 'Đã đặt'
    }
  });

  // Mark time slots as booked if they already have a booking
  const bookedTimeSlotIds = bookings.map(booking => booking.timeSlotId);

  // Prepare response with availability info
  const timeSlotsWithAvailability = timeSlots.map(timeSlot => {
    const booking = bookings.find(b => b.timeSlotId === timeSlot.timeSlotId);
    const isBooked = !!booking;
    const isLocked = !timeSlot.isActive; // Time slot is locked if isActive is false
    const lockReason = isLocked ? 'Locked by admin' : null;

    // Determine if it's a weekend to set the correct price
    const bookingDate = new Date(date);
    const isWeekend = bookingDate.getDay() === 0 || bookingDate.getDay() === 6;

    return {
      id: timeSlot.timeSlotId,
      start_time: timeSlot.startTime,
      end_time: timeSlot.endTime,
      price: isWeekend ? timeSlot.weekendPrice : timeSlot.weekdayPrice,
      available: !isBooked && !isLocked,
      isBooked: isBooked,
      isLocked: isLocked,
      lockReason: lockReason,
      customer: isBooked ? {
        name: booking.customerName || '',
        phone: booking.customerPhone || ''
      } : null
    };
  });

  res.status(200).json(timeSlotsWithAvailability);
});

// Create a new time slot (admin only) - UNUSED as we're using fixed time slots
// exports.createTimeSlot = catchAsync(async (req, res) => {
//   const { startTime, endTime, weekdayPrice, weekendPrice, fieldId } = req.body;
//
//   const timeSlot = await TimeSlot.create({
//     startTime,
//     endTime,
//     weekdayPrice,
//     weekendPrice,
//     fieldId,
//     isActive: true
//   });
//
//   res.status(201).json({
//     success: true,
//     data: timeSlot
//   });
// });

// Update time slot (admin only)
exports.updateTimeSlot = catchAsync(async (req, res, next) => {
  const { startTime, endTime, weekdayPrice, weekendPrice, isActive } = req.body;

  const timeSlot = await TimeSlot.findByPk(req.params.id);

  if (!timeSlot) {
    return next(new AppError('Time slot not found', 404));
  }

  // Update fields
  if (startTime) timeSlot.startTime = startTime;
  if (endTime) timeSlot.endTime = endTime;
  if (weekdayPrice !== undefined) timeSlot.weekdayPrice = weekdayPrice;
  if (weekendPrice !== undefined) timeSlot.weekendPrice = weekendPrice;
  if (isActive !== undefined) timeSlot.isActive = isActive;

  await timeSlot.save();

  res.status(200).json({
    success: true,
    data: timeSlot
  });
});

// Delete time slot (admin only) - UNUSED as we're using fixed time slots
// exports.deleteTimeSlot = catchAsync(async (req, res, next) => {
//   const timeSlot = await TimeSlot.findByPk(req.params.id);
//
//   if (!timeSlot) {
//     return next(new AppError('Time slot not found', 404));
//   }
//
//   await timeSlot.destroy();
//
//   res.status(200).json({
//     success: true,
//     message: 'Time slot deleted successfully'
//   });
// });