const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  notificationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'notificationId'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userId'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'info',
    validate: {
      isIn: [['info', 'warning', 'success', 'error']]
    }
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  relatedType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Notifications',
  timestamps: false,
  indexes: [
    {
      fields: ['userId'],
      name: 'idx_notification_user'
    },
    {
      fields: ['isRead'],
      name: 'idx_notification_read'
    },
    {
      fields: ['type'],
      name: 'idx_notification_type'
    }
  ]
});

module.exports = Notification;