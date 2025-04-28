const authService = require('../services/auth.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const register = async (req, res, next) => {
  try {
    const userData = req.body;
    const result = await authService.register(userData);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.adminLogin(username, password);
    
    res.status(200).json(result);
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
  if (req.session) {
    req.session.destroy(() => {
      res.status(200).json({
        success: true,
        message: 'Admin logout successful'
      });
    });
  } else {
    res.status(200).json({
      success: true,
      message: 'Admin logout successful'
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCurrentUser = (req, res) => {
  // User is already attached to req by the auth middleware
  const user = req.user;
  
  // Don't send password in response
  const userResponse = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role
  };
  
  res.status(200).json(userResponse);
};

module.exports = {
  register,
  login,
  refreshToken,
  adminLogin,
  adminLogout,
  getCurrentUser
}; 