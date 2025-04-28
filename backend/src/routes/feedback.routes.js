const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken, isOwnerOrAdmin } = require('../middleware/auth.middleware');
const { 
  feedbackValidation, 
  idValidation, 
  paginationValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', paginationValidation, feedbackController.getAllFeedback);
router.get('/:id', idValidation, feedbackController.getFeedbackById);
router.get('/booking/:bookingId', feedbackController.getFeedbackByBooking);
router.get('/field/:fieldId/rating', idValidation, feedbackController.getFieldRating);

// Protected routes (require authentication)
router.post('/', verifyToken, feedbackValidation, feedbackController.createFeedback);
router.put('/:id', verifyToken, idValidation, feedbackValidation, feedbackController.updateFeedback);
router.delete('/:id', verifyToken, idValidation, feedbackController.deleteFeedback);

module.exports = router; 