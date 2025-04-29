const express = require('express');
const feedbackController = require('../controllers/feedback.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', feedbackController.getAllFeedback);
router.get('/:id', feedbackController.getFeedbackById);
router.get('/field/:fieldId', feedbackController.getFeedbackByField);
router.post('/', feedbackController.createFeedback);

// Admin routes
router.put('/:id', verifyToken, isAdmin, feedbackController.updateFeedback);
router.delete('/:id', verifyToken, isAdmin, feedbackController.deleteFeedback);

module.exports = router;