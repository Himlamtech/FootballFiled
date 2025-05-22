const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TimeSlot = sequelize.define('TimeSlot', {
  timeSlotId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'timeSlotId'
  },
  fieldId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Fields',
      key: 'fieldId'
    },
    onDelete: 'CASCADE'
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  weekdayPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  weekendPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'TimeSlots',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['fieldId', 'startTime', 'endTime'],
      name: 'UQ_FieldTimeSlot'
    }
  ]
});

module.exports = TimeSlot;