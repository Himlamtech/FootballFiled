const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FieldManagement = sequelize.define('FieldManagement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timeSlotId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TimeSlots',
      key: 'timeSlotId'
    },
    onDelete: 'CASCADE'
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lockReason: {
    type: DataTypes.STRING(255),
    allowNull: true
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
  tableName: 'FieldManagement',
  timestamps: true,
  indexes: [
    {
      fields: ['fieldId', 'date', 'timeSlotId'],
      unique: true
    },
    {
      fields: ['isLocked']
    }
  ]
});

module.exports = FieldManagement;
