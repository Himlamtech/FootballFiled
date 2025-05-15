const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transaction_type: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'type',
    validate: {
      isIn: [['booking', 'product_sale', 'expense', 'other']]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'VND'
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
    validate: {
      isIn: [['pending', 'completed', 'cancelled', 'refunded']]
    }
  },
  description: {
    type: DataTypes.TEXT,
  },
  reference_id: {
    type: DataTypes.STRING,
    field: 'reference'
  },
  reference_name: {
    type: DataTypes.STRING
  },
  bookingId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Bookings',
      key: 'bookingId'
    }
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Orders',
      key: 'orderId'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userId'
    }
  },
  paymentMethod: {
    type: DataTypes.STRING,
    defaultValue: 'cash',
    validate: {
      isIn: [['cash', 'credit_card', 'bank_transfer', 'other']]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    field: 'createdAt'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['type', 'status'] },
    { fields: ['bookingId'] },
    { fields: ['orderId'] }
  ]
});

module.exports = Transaction;