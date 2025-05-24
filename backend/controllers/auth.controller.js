const bcrypt = require('bcryptjs');
const { Admin } = require('../models');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');

/**
 * Get current admin information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const admin = await Admin.findByPk(adminId, {
      attributes: ['adminId', 'username', 'name', 'email', 'phoneNumber']
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json({
      user: {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ message: 'Error getting admin information', error: error.message });
  }
};

// Removed updatePassword function as it's not needed

// First adminLogin implementation removed (duplicate)

/**
 * Admin login - supports both email and username
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Support both email and username login
    const loginField = email || username;
    if (!loginField || !password) {
      return res.status(400).json({ message: 'Email/username and password are required' });
    }

    // Find admin by email or username
    const admin = await Admin.findOne({
      where: {
        [Op.or]: [
          { email: loginField },
          { username: loginField }
        ]
      }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if account is active
    if (!admin.isActive) {
      return res.status(401).json({ message: 'Your account has been disabled' });
    }

    // Check password - using plaintext comparison as per requirements
    if (!admin.validatePassword(password)) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token with admin data
    const tokenData = {
      id: admin.adminId,
      username: admin.username,
      email: admin.email,
      role: 'admin'
    };
    const token = generateToken(tokenData);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin', error: error.message });
  }
};