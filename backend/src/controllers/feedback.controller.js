const feedbackService = require('../services/feedback.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all feedback with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const { rating, fieldId, userId, page, limit } = req.query;
    
    const options = {
      rating: rating ? parseInt(rating, 10) : null,
      fieldId,
      userId,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };
    
    const result = await feedbackService.getAllFeedback(options);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackService.getFeedbackById(id);
    
    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createFeedback = async (req, res, next) => {
  try {
    const feedbackData = req.body;
    const userId = req.user.id;
    
    const feedback = await feedbackService.createFeedback(feedbackData, userId);
    
    res.status(201).json(feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedbackData = req.body;
    const userId = req.user.id;
    
    const updatedFeedback = await feedbackService.updateFeedback(id, feedbackData, userId);
    
    res.status(200).json(updatedFeedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a feedback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    await feedbackService.deleteFeedback(id, userId, userRole);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback for a specific booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFeedbackByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    
    // Use the getAllFeedback service with bookingId filter
    const options = {
      bookingId
    };
    
    const result = await feedbackService.getAllFeedback(options);
    
    // Return the first feedback or null if not found
    const feedback = result.feedback.length > 0 ? result.feedback[0] : null;
    
    res.status(200).json(feedback);
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings for a field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFieldRating = async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    
    const rating = await feedbackService.getFieldRating(fieldId);
    
    res.status(200).json(rating);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackByBooking,
  getFieldRating
}; 