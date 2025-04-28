const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const logger = require('./logger');

/**
 * Generate JWT access token
 * @param {Object} user - User data to encode in token
 * @returns {String} Access token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    authConfig.SECRET,
    {
      expiresIn: authConfig.ACCESS_TOKEN_EXPIRY
    }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User data to encode in token
 * @returns {String} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    authConfig.SECRET,
    {
      expiresIn: authConfig.REFRESH_TOKEN_EXPIRY
    }
  );
};

/**
 * Verify JWT token
 * @param {String} token - Token to verify
 * @returns {Object} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, authConfig.SECRET);
    return decoded;
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
}; 