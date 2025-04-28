const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const jwtUtils = require('../utils/jwt');
const authConfig = require('../config/auth.config');
const logger = require('../utils/logger');

const User = db.User;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} User data and tokens
 */
const register = async (userData) => {
  try {
    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email: userData.email } });
    if (existingEmail) {
      throw new ApiError(400, 'Email already in use');
    }
    
    // Check if username already exists
    const existingUsername = await User.findOne({ where: { username: userData.username } });
    if (existingUsername) {
      throw new ApiError(400, 'Username already taken');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, authConfig.SALT_ROUNDS);
    
    // Create new user
    const user = await User.create({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      role: userData.role || 'user'
    });
    
    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken(user);
    const refreshToken = jwtUtils.generateRefreshToken(user);
    
    // Return user data (without password) and tokens
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    };
    
    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User data and tokens
 */
const login = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate tokens
    const accessToken = jwtUtils.generateAccessToken(user);
    const refreshToken = jwtUtils.generateRefreshToken(user);
    
    // Return user data (without password) and tokens
    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };
    
    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Refresh access token
 * @param {String} refreshToken - Refresh token
 * @returns {Object} New access token
 */
const refreshToken = async (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = jwtUtils.verifyToken(refreshToken);
    if (!decoded) {
      throw new ApiError(401, 'Invalid refresh token');
    }
    
    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    
    // Generate new access token
    const accessToken = jwtUtils.generateAccessToken(user);
    
    return { accessToken };
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Admin login
 * @param {String} username - Admin username
 * @param {String} password - Admin password
 * @returns {Object} Authentication status
 */
const adminLogin = async (username, password) => {
  try {
    // Find admin user
    const admin = await User.findOne({ 
      where: { 
        username,
        role: 'admin'
      } 
    });
    
    if (!admin) {
      throw new ApiError(401, 'Invalid admin credentials');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid admin credentials');
    }
    
    // Return success response
    return {
      success: true,
      message: 'Admin login successful',
      isAuthenticated: true
    };
  } catch (error) {
    logger.error('Admin login error:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  adminLogin
}; 