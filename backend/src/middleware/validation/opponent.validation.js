const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation for pagination parameters
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
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation for ID parameter
 */
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation for booking ID parameter
 */
const bookingIdValidation = [
  param('bookingId')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation for opponent request data
 */
const opponentValidation = [
  body('bookingId')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
  body('teamName')
    .isString()
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ max: 100 })
    .withMessage('Team name cannot exceed 100 characters'),
  body('contactEmail')
    .isEmail()
    .withMessage('Valid contact email is required'),
  body('contactPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid contact phone number is required'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validation for matching opponents
 */
const matchValidation = [
  body('opponentId1')
    .isInt({ min: 1 })
    .withMessage('First opponent ID must be a positive integer'),
  body('opponentId2')
    .isInt({ min: 1 })
    .withMessage('Second opponent ID must be a positive integer')
    .custom((value, { req }) => {
      if (value === req.body.opponentId1) {
        throw new Error('Cannot match an opponent with itself');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  paginationValidation,
  idParamValidation,
  bookingIdValidation,
  opponentValidation,
  matchValidation
}; 