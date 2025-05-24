const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'read', 'responded'),
    defaultValue: 'new'
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Admin',
      key: 'adminId'
    }
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  }
}, {
  timestamps: true,
  tableName: 'Feedback',
  indexes: [
    {
      fields: ['status'],
      name: 'idx_feedback_status'
    },
    {
      fields: ['priority'],
      name: 'idx_feedback_priority'
    },
    {
      fields: ['adminId'],
      name: 'idx_feedback_admin'
    }
  ]
});

module.exports = Feedback;