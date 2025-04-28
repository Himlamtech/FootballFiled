const express = require('express');
const opponentController = require('../controllers/opponent.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { 
  opponentValidation, 
  idParamValidation, 
  paginationValidation,
  bookingIdValidation,
  matchValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Apply verifyToken middleware to all routes
router.use(verifyToken);

// Routes for getting opponent requests
router.get('/', paginationValidation, opponentController.getAllOpponents);
router.get('/:id', idParamValidation, opponentController.getOpponentById);
router.get('/booking/:bookingId', bookingIdValidation, opponentController.getOpponentByBooking);
router.get('/available', opponentController.findAvailableOpponents);

// Routes for creating and managing opponent requests
router.post('/', opponentValidation, opponentController.createOpponent);
router.put('/:id', idParamValidation, opponentValidation, opponentController.updateOpponent);
router.delete('/:id', idParamValidation, opponentController.deleteOpponent);

// Route for matching opponents
router.post('/match', matchValidation, opponentController.matchOpponents);

module.exports = router; 