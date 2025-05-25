const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Opponent = sequelize.define('Opponent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Bookings',
      key: 'bookingId'
    },
    onDelete: 'CASCADE'
  },
  team_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  skill_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: true,
    defaultValue: 'intermediate'
  },
  player_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 5,
    validate: {
      min: 1,
      max: 22
    }
  },
  status: {
    type: DataTypes.ENUM('searching', 'matched', 'cancelled'),
    defaultValue: 'searching'
  },
  expireDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  timestamps: true,
  tableName: 'Opponents',
  freezeTableName: true,
  indexes: [
    {
      fields: ['status'],
      name: 'idx_opponent_status'
    },
    {
      fields: ['skill_level'],
      name: 'idx_opponent_skill'
    },
    {
      fields: ['expireDate'],
      name: 'idx_opponent_expire'
    },
    {
      fields: ['booking_id'],
      name: 'idx_opponent_booking'
    }
  ]
});

module.exports = Opponent;