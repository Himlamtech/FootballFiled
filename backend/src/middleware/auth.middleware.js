const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');
const db = require('../models');
const authConfig = require('../config/auth.config');
const logger = require('../config/logger');

const User = db.User;

/**
 * Verify JWT token middleware
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new ApiError(401, 'No token provided'));
  }

  try {
    const decoded = jwt.verify(token, authConfig.SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Token verification failed', error);
    next(new ApiError(401, 'Invalid token'));
  }
};

/**
 * Check if user is an admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated'));
  }

  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required'));
  }

  next();
};

/**
 * Verify user is either the owner of the resource or an admin
 * Requires the request to have a resourceId parameter (usually as req.params.id)
 * and a modelClass to determine ownership
 */
const isOwnerOrAdmin = (modelClass, idParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    try {
      // If user is admin, allow access immediately
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceId = req.params[idParam];
      if (!resourceId) {
        return next(new ApiError(400, `No ${idParam} provided`));
      }

      // Find the resource
      const resource = await modelClass.findByPk(resourceId);
      if (!resource) {
        return next(new ApiError(404, 'Resource not found'));
      }

      // Check if the user is the owner
      if (resource[userIdField] !== req.user.id) {
        return next(new ApiError(403, 'Access denied: you are not the owner of this resource'));
      }

      next();
    } catch (error) {
      logger.error('Error checking ownership', error);
      next(new ApiError(500, 'Error checking resource ownership'));
    }
  };
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin
}; 