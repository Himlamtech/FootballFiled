const { formatErrorResponse, ApiError } = require('../utils/errorHandler');
const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 */
const errorMiddleware = (err, req, res, next) => {
  // Default to 500 server error
  err.statusCode = err.statusCode || 500;
  
  // Format error response based on environment
  const errorResponse = formatErrorResponse(err, req, res);
  
  // Log error details
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  // Send error response
  return res.status(err.statusCode).json(errorResponse);
};

/**
 * Convert Sequelize errors to ApiError
 */
const convertSequelizeErrors = (err, req, res, next) => {
  // Handle Sequelize validation errors
  if (err instanceof Sequelize.ValidationError) {
    const messages = err.errors.map(e => e.message).join(', ');
    const validationError = new ApiError(400, `Validation error: ${messages}`);
    return next(validationError);
  }
  
  // Handle Sequelize unique constraint errors
  if (err instanceof Sequelize.UniqueConstraintError) {
    const fields = Object.keys(err.fields).join(', ');
    const uniqueError = new ApiError(400, `Duplicate value for ${fields}`);
    return next(uniqueError);
  }
  
  // Handle Sequelize foreign key constraint errors
  if (err instanceof Sequelize.ForeignKeyConstraintError) {
    const foreignKeyError = new ApiError(400, `Invalid reference: ${err.fields || 'Unknown field'}`);
    return next(foreignKeyError);
  }
  
  // Handle other Sequelize errors
  if (err instanceof Sequelize.DatabaseError) {
    const databaseError = new ApiError(500, 'Database error occurred');
    return next(databaseError);
  }
  
  // Pass error to next error handler
  return next(err);
};

/**
 * Handle 404 errors for routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = [convertSequelizeErrors, errorMiddleware, notFoundHandler]; 