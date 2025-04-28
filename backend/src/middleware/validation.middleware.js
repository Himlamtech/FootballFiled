const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../utils/errorHandler');

/**
 * Middleware to check for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

/**
 * User registration validation rules
 */
const registerValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long'),
  validate
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

/**
 * Field creation validation rules
 */
const fieldValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Field name is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('size')
    .trim()
    .notEmpty()
    .withMessage('Field size is required'),
  body('hourlyRate')
    .isNumeric()
    .withMessage('Hourly rate must be a number')
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be greater than 0'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  validate
];

/**
 * Booking creation validation rules
 */
const bookingValidation = [
  body('fieldId')
    .isInt({ min: 1 })
    .withMessage('Valid field ID is required'),
  body('bookingDate')
    .isDate()
    .withMessage('Booking date must be a valid date'),
  body('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time must be in format HH:MM:SS'),
  body('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('End time must be in format HH:MM:SS'),
  body('products')
    .optional()
    .isArray()
    .withMessage('Products must be an array'),
  body('products.*.id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product ID must be a valid integer'),
  body('products.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product quantity must be at least 1'),
  validate
];

/**
 * Feedback validation rules
 */
const feedbackValidation = [
  body('bookingId')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string'),
  validate
];

/**
 * Product validation rules
 */
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be greater than 0'),
  body('category')
    .isIn(['equipment', 'refreshment', 'service'])
    .withMessage('Category must be equipment, refreshment, or service'),
  validate
];

/**
 * Opponent validation rules
 */
const opponentValidation = [
  body('bookingId')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('teamName')
    .trim()
    .notEmpty()
    .withMessage('Team name is required'),
  body('contactEmail')
    .isEmail()
    .withMessage('Valid contact email is required'),
  body('contactPhone')
    .optional()
    .matches(/^\+?[0-9\s-()]+$/)
    .withMessage('Contact phone must be a valid phone number'),
  validate
];

/**
 * ID parameter validation
 */
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  validate
];

/**
 * Pagination query validation
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  fieldValidation,
  bookingValidation,
  feedbackValidation,
  productValidation,
  opponentValidation,
  validateIdParam,
  paginationValidation
}; 