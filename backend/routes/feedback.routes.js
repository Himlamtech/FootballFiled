const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

/**
 * @route   GET /api/feedback
 * @desc    Get all feedback
 * @access  Private/Admin
 */
router.get(
  '/',
  authenticate,
  isAdmin,
  feedbackController.getAllFeedback
);

/**
 * @route   GET /api/feedback/:id
 * @desc    Get feedback by ID
 * @access  Private/Admin
 */
router.get(
  '/:id',
  authenticate,
  isAdmin,
  feedbackController.getFeedbackById
);

/**
 * @route   POST /api/feedback
 * @desc    Create a new feedback
 * @access  Public
 */
router.post(
  '/',
  feedbackController.createFeedback
);

/**
 * @route   PATCH /api/feedback/:id/status
 * @desc    Update feedback status
 * @access  Private/Admin
 */
router.patch(
  '/:id/status',
  authenticate,
  isAdmin,
  feedbackController.updateFeedbackStatus
);

/**
 * @route   DELETE /api/feedback/:id
 * @desc    Delete feedback
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  feedbackController.deleteFeedback
);

module.exports = router;