const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'bookingId'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userId'
    }
  },
  fieldId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Fields',
      key: 'fieldId'
    }
  },
  timeSlotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TimeSlots',
      key: 'timeSlotId'
    }
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'confirmed', 'cancelled', 'completed']]
    }
  },
  paymentStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'unpaid',
    validate: {
      isIn: [['unpaid', 'paid', 'refunded']]
    }
  },
  customerName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  customerEmail: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'vietqr'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Bookings',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['fieldId', 'timeSlotId', 'bookingDate'],
      name: 'UQ_Booking'
    }
  ]
});

module.exports = Booking;