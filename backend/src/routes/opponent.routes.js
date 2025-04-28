const express = require('express');
const opponentController = require('../controllers/opponent.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', validationMiddleware.paginationValidation, opponentController.getAllOpponents);
router.get('/available', opponentController.findAvailableOpponents);
router.get('/:id', validationMiddleware.validateIdParam, opponentController.getOpponentById);
router.get('/booking/:bookingId', validationMiddleware.validateIdParam, opponentController.getOpponentByBooking);

// Protected routes (require authentication)
router.post(
  '/',
  authMiddleware.verifyToken,
  validationMiddleware.opponentValidation,
  opponentController.createOpponent
);

router.put(
  '/:id',
  authMiddleware.verifyToken,
  validationMiddleware.validateIdParam,
  opponentController.updateOpponent
);

router.delete(
  '/:id',
  authMiddleware.verifyToken,
  validationMiddleware.validateIdParam,
  opponentController.deleteOpponent
);

// Match opponents (admin only)
router.post(
  '/match',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  opponentController.matchOpponents
);

module.exports = router; 