const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  adminId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'adminId'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  tableName: 'Admin',
  timestamps: true,
  indexes: [
    {
      fields: ['username'],
      name: 'idx_admin_username'
    },
    {
      fields: ['email'],
      name: 'idx_admin_email'
    }
  ]
});

// Password validation method for plaintext authentication
Admin.prototype.validatePassword = function(password) {
  console.log('Comparing passwords:');
  console.log('Input password:', password);
  console.log('Stored password:', this.password);

  try {
    // Direct plaintext comparison as per requirements
    const result = password === this.password;
    console.log('Direct comparison result:', result);
    return result;
  } catch (error) {
    console.error('Error validating password:', error);
    return false;
  }
};

module.exports = Admin;
