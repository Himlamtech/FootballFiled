const logger = require('./logger');
const serverConfig = require('../config/server.config');

/**
 * Custom Error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, additionalData = null, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.additionalData = additionalData;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Format error response for client
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = (err, req, res) => {
  const { statusCode, message, additionalData } = err;
  
  // Log error
  logger.error(
    `${statusCode || 500} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );

  // Add stack trace in development
  const response = {
    success: false,
    message: statusCode === 500 && serverConfig.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : message,
    ...(additionalData && { data: additionalData }),
    ...(serverConfig.NODE_ENV === 'development' && { stack: err.stack })
  };

  return response;
};

/**
 * Convert mongoose validation error into ApiError
 * @param {Error} err - Mongoose validation error
 * @returns {ApiError} Converted error
 */
const convertValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(', ')}`;
  return new ApiError(400, message);
};

module.exports = {
  ApiError,
  formatErrorResponse,
  convertValidationError
}; 