const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');
const db = require('../models');
const authConfig = require('../config/auth.config');

const User = db.User;

/**
 * Verify JWT token middleware
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'No token provided'));
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, authConfig.SECRET);
    
    // Find user with token's ID
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return next(new ApiError(401, 'Invalid token - user not found'));
    }
    
    // Add user to request object
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Token expired'));
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(401, 'Invalid token'));
    }
    
    return next(new ApiError(500, 'Authentication error'));
  }
};

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized - Please authenticate'));
  }
  
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden - Admin access required'));
  }
  
  next();
};

/**
 * Check if user is the owner of the resource or an admin
 */
const isOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Unauthorized - Please authenticate'));
  }
  
  // If admin, always allow
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Check if user is the owner (this would be customized based on the resource)
  // Example for booking: req.params.id is booking ID and we check if user is the owner
  const resourceId = req.params.userId || req.params.id;
  
  if (req.user.id !== parseInt(resourceId, 10)) {
    return next(new ApiError(403, 'Forbidden - Access denied'));
  }
  
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isOwnerOrAdmin
}; 