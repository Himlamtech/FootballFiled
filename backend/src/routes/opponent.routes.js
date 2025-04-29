const express = require('express');
const opponentController = require('../controllers/opponent.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const {
  opponentValidation,
  idParamValidation,
  paginationValidation,
  bookingIdValidation,
  matchValidation
} = require('../middleware/validation/opponent.validation');
const { Opponent } = require('../models');

const router = express.Router();

// Public routes (no authentication required)
router.get('/available', opponentController.findAvailableOpponents);
router.post('/', opponentValidation, opponentController.createOpponent);

// Protected routes (authentication required)
router.use(verifyToken);

// Routes for getting opponent requests
router.get('/booking/:bookingId', bookingIdValidation, opponentController.getOpponentByBooking);
router.get('/', paginationValidation, opponentController.getAllOpponents);
router.get('/:id', idParamValidation, opponentController.getOpponentById);
router.put('/:id', idParamValidation, isOwnerOrAdmin(Opponent), opponentValidation, opponentController.updateOpponent);
router.delete('/:id', idParamValidation, isOwnerOrAdmin(Opponent), opponentController.deleteOpponent);

// Route for matching opponents
router.post('/match', matchValidation, opponentController.matchOpponents);

module.exports = router;