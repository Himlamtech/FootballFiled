const { body, validationResult } = require('express-validator');

/**
 * Validation Middleware
 *
 * This file contains middleware functions for validating request data.
 * It uses express-validator to validate and sanitize input data.
 */

/**
 * Middleware to validate request data
 * Used after validation rules to check for errors
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
exports.registerValidationRules = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Name must be between 3 and 100 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('Password must be between 6 and 50 characters'),

  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('Phone number can only contain numbers, +, -, spaces, and parentheses')
];

/**
 * Validation rules for user login
 */
exports.loginValidationRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for booking creation
 */
exports.bookingValidationRules = [
  body('fieldId')
    .isInt({ min: 1 })
    .withMessage('Valid field ID is required'),

  body('timeSlotId')
    .isInt({ min: 1 })
    .withMessage('Valid time slot ID is required'),

  body('bookingDate')
    .isDate()
    .withMessage('Valid booking date is required in YYYY-MM-DD format'),

  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),

  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required'),

  body('customerEmail')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
];

/**
 * Validation rules for review creation
 */
exports.reviewValidationRules = [
  body('fieldId')
    .isInt({ min: 1 })
    .withMessage('Valid field ID is required'),

  body('bookingId')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters')
];

/**
 * Validation rules for feedback submission
 */
exports.feedbackValidationRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
];

/**
 * Validation rules for opponent creation
 */
exports.opponentValidationRules = [
  body('booking_id')
    .isInt()
    .withMessage('Booking ID must be an integer'),

  body('team_name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required'),

  body('contact_phone')
    .notEmpty()
    .withMessage('Contact phone is required'),

  body('contact_email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
];