const { Feedback } = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all feedback with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build filter conditions
    const where = {};
    if (status) where.status = status;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Query feedback with pagination
    const { count, rows } = await Feedback.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['created_at', 'DESC']]
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      feedbacks: rows,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: parseInt(limit, 10)
      }
    });
  } catch (error) {
    logger.error('Error getting all feedback:', error);
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
    
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }
    
    res.status(200).json(feedback);
  } catch (error) {
    logger.error(`Error getting feedback with ID ${req.params.id}:`, error);
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
    const { name, email, content, date } = req.body;
    
    // Create feedback
    const feedback = await Feedback.create({
      name,
      email,
      content,
      date: date || new Date().toISOString().split('T')[0],
      status: 'new'
    });
    
    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    logger.error('Error creating feedback:', error);
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
    const { status } = req.body;
    
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }
    
    // Update feedback
    await feedback.update({ status });
    
    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      feedback
    });
  } catch (error) {
    logger.error(`Error updating feedback with ID ${req.params.id}:`, error);
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
    
    const feedback = await Feedback.findByPk(id);
    
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }
    
    // Delete feedback
    await feedback.destroy();
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting feedback with ID ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback
};
