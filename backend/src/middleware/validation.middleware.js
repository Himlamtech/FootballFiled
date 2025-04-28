const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../utils/errorHandler');

/**
 * Middleware to check for validation errors
 */
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new ApiError(400, errorMessages));
  }
  next();
};

// Registration validation
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
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  validateResults
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateResults
];

// Field validation
const fieldValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Field name is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('field_type')
    .trim()
    .notEmpty()
    .withMessage('Field type is required')
    .isIn(['5v5', '7v7', '11v11'])
    .withMessage('Field type must be 5v5, 7v7, or 11v11'),
  body('price_per_hour')
    .isNumeric()
    .withMessage('Price per hour must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price per hour must be greater than 0'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  validateResults
];

// Booking validation
const bookingValidation = [
  body('field_id')
    .isInt({ min: 1 })
    .withMessage('Valid field ID is required'),
  body('booking_date')
    .isDate()
    .withMessage('Booking date must be a valid date'),
  body('start_time')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time must be in format HH:MM:SS'),
  body('end_time')
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
  validateResults
];

// Feedback validation
const feedbackValidation = [
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isString()
    .withMessage('Comment must be a string'),
  validateResults
];

// Product validation
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
    .isIn(['equipment', 'drinks', 'food', 'service'])
    .withMessage('Category must be equipment, drinks, food, or service'),
  validateResults
];

// Opponent validation
const opponentValidation = [
  body('booking_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid booking ID is required'),
  body('team_name')
    .trim()
    .notEmpty()
    .withMessage('Team name is required'),
  body('players_count')
    .isInt({ min: 1 })
    .withMessage('Players count must be at least 1'),
  body('contact_email')
    .optional()
    .isEmail()
    .withMessage('Valid contact email is required'),
  body('contact_phone')
    .optional()
    .matches(/^\+?[0-9\s-()]+$/)
    .withMessage('Contact phone must be a valid phone number'),
  validateResults
];

const opponentMatchValidation = [
  body('opponent_id1')
    .isInt({ min: 1 })
    .withMessage('First opponent ID is required'),
  body('opponent_id2')
    .isInt({ min: 1 })
    .withMessage('Second opponent ID is required'),
  validateResults
];

// ID parameter validation
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  validateResults
];

// Field ID parameter validation
const fieldIdValidation = [
  param('fieldId')
    .isInt({ min: 1 })
    .withMessage('Field ID must be a positive integer'),
  validateResults
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateResults
];

const paymentStatusValidation = [
  body('status')
    .isIn(['pending', 'paid', 'cancelled', 'refunded'])
    .withMessage('Payment status must be pending, paid, cancelled, or refunded'),
  body('payment_method')
    .optional()
    .isIn(['cash', 'credit_card', 'bank_transfer', 'e_wallet'])
    .withMessage('Payment method must be valid'),
  validateResults
];

// Availability validation
const availabilityValidation = [
  query('fieldId')
    .isInt({ min: 1 })
    .withMessage('Field ID is required and must be a positive integer'),
  query('date')
    .isISO8601()
    .withMessage('Date is required and must be a valid ISO8601 date'),
  query('startTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Start time is required and must be in format HH:MM:SS'),
  query('endTime')
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('End time is required and must be in format HH:MM:SS'),
  validateResults
];

module.exports = {
  registerValidation,
  loginValidation,
  fieldValidation,
  bookingValidation,
  feedbackValidation,
  productValidation,
  opponentValidation,
  opponentMatchValidation,
  idValidation,
  fieldIdValidation,
  paginationValidation,
  paymentStatusValidation,
  availabilityValidation
};