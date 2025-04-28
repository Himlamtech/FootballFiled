const express = require('express');
const opponentController = require('../controllers/opponent.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all opponent requests (with pagination and filtering)
router.get(
  '/',
  validate('pagination'),
  opponentController.getAllOpponents
);

// Get a specific opponent request by ID
router.get(
  '/:id',
  validate('paramId'),
  opponentController.getOpponentById
);

// Create a new opponent request
router.post(
  '/',
  validate('opponentCreate'),
  opponentController.createOpponent
);

// Update an opponent request
router.put(
  '/:id',
  validate('paramId'),
  validate('opponentUpdate'),
  opponentController.updateOpponent
);

// Delete an opponent request
router.delete(
  '/:id',
  validate('paramId'),
  opponentController.deleteOpponent
);

// Match two teams for a friendly match
router.post(
  '/match',
  validate('opponentMatch'),
  opponentController.matchOpponents
);

// Find available opponents
router.get(
  '/available',
  validate('opponentFind'),
  opponentController.findAvailableOpponents
);

// Get opponent request by booking ID
router.get(
  '/booking/:bookingId',
  validate('paramId'),
  opponentController.getOpponentByBooking
);

module.exports = router; 