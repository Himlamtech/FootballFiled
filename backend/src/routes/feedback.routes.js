const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { 
  feedbackValidation, 
  idParamValidation, 
  paginationValidation,
  bookingIdValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', paginationValidation, feedbackController.getAllFeedback);
router.get('/:id', idParamValidation, feedbackController.getFeedbackById);
router.get('/booking/:bookingId', bookingIdValidation, feedbackController.getFeedbackByBooking);
router.get('/field/:fieldId/rating', idParamValidation, feedbackController.getFieldRating);

// Protected routes (require authentication)
router.post('/', verifyToken, feedbackValidation, feedbackController.createFeedback);
router.put('/:id', verifyToken, idParamValidation, feedbackValidation, feedbackController.updateFeedback);
router.delete('/:id', verifyToken, idParamValidation, feedbackController.deleteFeedback);

module.exports = router; 