const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');
const { Op } = require('sequelize');

/**
 * Get current user information
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'name', 'email', 'phoneNumber', 'role']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Error getting user information', error: error.message });
  }
};

/**
 * Update user password
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Error updating password', error: error.message });
  }
};

/**
 * Admin login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user by email
    const user = await User.findOne({
      where: {
        email,
        role: 'admin'
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been disabled' });
    }

    // Check password - using plaintext comparison for admin as per requirements
    const isPasswordValid = password === user.password;
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin', error: error.message });
  }
};

/**
 * Admin login
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user by email
    const user = await User.findOne({
      where: {
        email,
        role: 'admin'
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Your account has been disabled' });
    }

    // Check password - using plaintext comparison for admin as per requirements
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Error logging in as admin', error: error.message });
  }
};