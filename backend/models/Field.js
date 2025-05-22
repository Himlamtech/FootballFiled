const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Field = sequelize.define('Field', {
  fieldId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'fieldId'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  size: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['5v5', '7v7', '11v11']]
    }
  },
  imageUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Fields',
  timestamps: false
});

module.exports = Field; 