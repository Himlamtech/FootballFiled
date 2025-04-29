const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const config = require('../config/config');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Admin login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      config.jwtSecret,
      { expiresIn: config.jwtAccessExpiration }
    );

    // Return admin info and token
    res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin logout (session-based)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const adminLogout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin logout successful'
  });
};

/**
 * Get current admin profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getCurrentAdmin = async (req, res, next) => {
  try {
    // Admin is already attached to req by the auth middleware
    const adminId = req.user.id;

    // Find admin by id
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    // Return admin info
    res.status(200).json({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: 'admin'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminLogout,
  getCurrentAdmin
};