const { verifyToken } = require('../utils/jwt');
const { Admin } = require('../models');
const { AppError } = require('../utils/error');

/**
 * Authentication Middleware
 *
 * This file contains middleware functions for authentication and authorization.
 */

/**
 * Middleware to authenticate JWT token
 * Chỉ dùng cho admin
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Find admin
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found' });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({ message: 'Your account has been disabled' });
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Chỉ admin mới được truy cập' });
  }
};

/**
 * Middleware xác thực sử dụng AppError (chỉ cho admin)
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Get token from request headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    // 2) Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return next(new AppError('Invalid token or token expired', 401));
    }

    // 3) Check if admin still exists
    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return next(new AppError('The admin belonging to this token no longer exists.', 401));
    }

    // 4) Grant access to protected route
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};