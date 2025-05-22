const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'userId'
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
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'admin',
    validate: {
      isIn: [['admin']]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Users',
  timestamps: false
});

// Password validation method
User.prototype.validatePassword = function(password) {
  console.log('Comparing passwords:');
  console.log('Input password:', password);
  console.log('Stored password hash:', this.password.substring(0, 10) + '...');

  try {
    // For admin user with unhashed password (for testing only)
    if (this.email === 'admin' && this.password === 'admin') {
      console.log('Admin with direct password match');
      return password === this.password;
    }

    // For hashed passwords (production use)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      const result = bcrypt.compareSync(password, this.password);
      console.log('Bcrypt comparison result:', result);
      return result;
    } else {
      // Fallback for plain text passwords
      const result = password === this.password;
      console.log('Direct comparison result:', result);
      return result;
    }
  } catch (error) {
    console.error('Error validating password:', error);
    return false;
  }
};

module.exports = User;