const { Feedback, Field } = require('../models');
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
    const { field_id, page = 1, limit = 10 } = req.query;

    // Build filter conditions
    const where = {};
    if (field_id) where.field_id = field_id;

    // Pagination options
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get feedback with pagination
    const { count, rows } = await Feedback.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Field,
          as: 'field'
        }
      ]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      feedbacks: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error getting feedback:', error);
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

    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Field,
          as: 'field'
        }
      ]
    });

    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }

    res.status(200).json(feedback);
  } catch (error) {
    logger.error('Error getting feedback by ID:', error);
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
    const { name, email, content, field_id, rating = 5, phone, comment } = req.body;

    // Create feedback with required rating field
    const feedback = await Feedback.create({
      name,
      email,
      phone,
      rating, // Add default rating of 5 if not provided
      comment: comment || content, // Use comment if provided, otherwise use content
      field_id,
      status: 'pending'
    });

    res.status(201).json(feedback);
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

    // Check if feedback exists
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }

    // Update feedback
    await feedback.update({ status });

    res.status(200).json(feedback);
  } catch (error) {
    logger.error('Error updating feedback:', error);
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

    // Check if feedback exists
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }

    // Delete feedback
    await feedback.destroy();

    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting feedback:', error);
    next(error);
  }
};

/**
 * Get feedback by field ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFeedbackByField = async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Pagination options
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Get feedback with pagination
    const { count, rows } = await Feedback.findAndCountAll({
      where: { field_id: fieldId },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      feedbacks: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error getting feedback by field ID:', error);
    next(error);
  }
};

module.exports = {
  getAllFeedback,
  getFeedbackById,
  getFeedbackByField,
  createFeedback,
  updateFeedback,
  deleteFeedback
};