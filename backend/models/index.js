/**
 * Models and relationships for the Football Field Management System
 * This file defines all database models and their relationships
 */

const User = require('./User');
const Field = require('./Field');
const TimeSlot = require('./TimeSlot');
const Booking = require('./Booking');
const Review = require('./Review');
const Notification = require('./Notification');
const Feedback = require('./Feedback');
const Opponent = require('./Opponent');
const FieldManagement = require('./FieldManagement');

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

// User <-> Review (one-to-many)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId' });

// Field <-> Review (one-to-many)
Field.hasMany(Review, { foreignKey: 'fieldId', as: 'reviews' });
Review.belongsTo(Field, { foreignKey: 'fieldId' });

// Booking <-> Review (one-to-one)
Booking.hasOne(Review, { foreignKey: 'bookingId', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'bookingId' });

// User <-> Notification (one-to-many)
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// User <-> Feedback (one-to-many, optional)
User.hasMany(Feedback, { foreignKey: 'user_id', as: 'feedbacks' });
Feedback.belongsTo(User, { foreignKey: 'user_id' });

// Booking <-> Opponent (one-to-one)
Booking.hasOne(Opponent, { foreignKey: 'booking_id', sourceKey: 'bookingId' });
Opponent.belongsTo(Booking, { foreignKey: 'booking_id', targetKey: 'bookingId' });

// Field <-> FieldManagement (one-to-many)
Field.hasMany(FieldManagement, { foreignKey: 'fieldId', as: 'managements' });
FieldManagement.belongsTo(Field, { foreignKey: 'fieldId' });

// TimeSlot <-> FieldManagement (one-to-many)
TimeSlot.hasMany(FieldManagement, { foreignKey: 'timeSlotId', as: 'managements' });
FieldManagement.belongsTo(TimeSlot, { foreignKey: 'timeSlotId' });

module.exports = {
  User,
  Field,
  TimeSlot,
  Booking,
  Review,
  Notification,
  Feedback,
  Opponent,
  FieldManagement
};