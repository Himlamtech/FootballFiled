/**
 * Models and relationships for the Football Field Management System
 * This file defines all database models and their relationships
 * Optimized schema with 6 core tables: Admin, Fields, TimeSlots, Bookings, Opponents, Feedback
 */

const Admin = require('./Admin');
const Field = require('./Field');
const TimeSlot = require('./TimeSlot');
const Booking = require('./Booking');
const Feedback = require('./Feedback');
const Opponent = require('./Opponent');

// Define relationships

// Field <-> TimeSlot (one-to-many)
Field.hasMany(TimeSlot, { foreignKey: 'fieldId', as: 'timeSlots' });
TimeSlot.belongsTo(Field, { foreignKey: 'fieldId' });

// Field <-> Booking (one-to-many)
Field.hasMany(Booking, { foreignKey: 'fieldId', as: 'bookings' });
Booking.belongsTo(Field, { foreignKey: 'fieldId' });

// TimeSlot <-> Booking (one-to-many)
TimeSlot.hasMany(Booking, { foreignKey: 'timeSlotId', as: 'bookings' });
Booking.belongsTo(TimeSlot, { foreignKey: 'timeSlotId' });

// Admin <-> Feedback (one-to-many, optional)
Admin.hasMany(Feedback, { foreignKey: 'adminId', as: 'feedbacks' });
Feedback.belongsTo(Admin, { foreignKey: 'adminId' });

// Booking <-> Opponent (one-to-one)
Booking.hasOne(Opponent, { foreignKey: 'booking_id', sourceKey: 'bookingId' });
Opponent.belongsTo(Booking, { foreignKey: 'booking_id', targetKey: 'bookingId' });

module.exports = {
  Admin,
  Field,
  TimeSlot,
  Booking,
  Feedback,
  Opponent
};