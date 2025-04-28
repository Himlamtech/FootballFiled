const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', validationMiddleware.paginationValidation, feedbackController.getAllFeedback);
router.get('/:id', validationMiddleware.validateIdParam, feedbackController.getFeedbackById);
router.get('/booking/:bookingId', validationMiddleware.validateIdParam, feedbackController.getFeedbackByBooking);
router.get('/field/:fieldId/rating', validationMiddleware.validateIdParam, feedbackController.getFieldRating);

// Protected routes (require authentication)
router.post(
  '/',
  authMiddleware.verifyToken,
  validationMiddleware.feedbackValidation,
  feedbackController.createFeedback
);

router.put(
  '/:id',
  authMiddleware.verifyToken,
  validationMiddleware.validateIdParam,
  feedbackController.updateFeedback
);

router.delete(
  '/:id',
  authMiddleware.verifyToken,
  validationMiddleware.validateIdParam,
  feedbackController.deleteFeedback
);

module.exports = router; 