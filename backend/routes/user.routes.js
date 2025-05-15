const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get(
  '/',
  authenticate,
  isAdmin,
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (own profile or admin)
 */
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (own profile or admin)
 */
router.put(
  '/:id',
  authenticate,
  userController.updateProfile
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Update user active status
 * @access  Private/Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  isAdmin,
  userController.updateUserStatus
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Private/Admin
 */
router.patch(
  '/:id/role',
  authenticate,
  isAdmin,
  userController.updateUserRole
);

/**
 * @route   GET /api/users/:id/bookings
 * @desc    Get user's bookings
 * @access  Private (own bookings or admin)
 */
router.get(
  '/:id/bookings',
  authenticate,
  userController.getUserBookings
);

/**
 * @route   GET /api/users/:id/orders
 * @desc    Get user's orders
 * @access  Private (own orders or admin)
 */
router.get(
  '/:id/orders',
  authenticate,
  userController.getUserOrders
);

/**
 * @route   GET /api/users/:id/notifications
 * @desc    Get user's notifications
 * @access  Private (own notifications only)
 */
router.get(
  '/:id/notifications',
  authenticate,
  userController.getUserNotifications
);

/**
 * @route   PATCH /api/users/notifications/:notificationId
 * @desc    Mark notification as read
 * @access  Private (own notifications only)
 */
router.patch(
  '/notifications/:notificationId',
  authenticate,
  userController.markNotificationAsRead
);

module.exports = router; 