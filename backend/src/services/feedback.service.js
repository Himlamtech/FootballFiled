const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const Feedback = db.Feedback;
const Booking = db.Booking;
const User = db.User;
const Field = db.Field;

/**
 * Get all feedback with pagination and filters
 * @param {Object} options - Query options (filters, pagination)
 * @returns {Object} Paginated list of feedback
 */
const getAllFeedback = async (options = {}) => {
  try {
    const { 
      rating, 
      fieldId, 
      userId,
      page = 1, 
      limit = 10 
    } = options;
    
    // Build filter conditions for bookings to join
    const bookingCondition = {};
    if (fieldId) bookingCondition.fieldId = fieldId;
    if (userId) bookingCondition.userId = userId;
    
    // Build filter conditions for feedback
    const feedbackCondition = {};
    if (rating) feedbackCondition.rating = rating;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Query feedback with pagination and includes
    const { count, rows } = await Feedback.findAndCountAll({
      where: feedbackCondition,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Booking,
          as: 'booking',
          where: bookingCondition,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            },
            {
              model: Field,
              as: 'field',
              attributes: ['id', 'name', 'location']
            }
          ]
        }
      ]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return {
      totalItems: count,
      totalPages,
      currentPage: page,
      feedback: rows
    };
  } catch (error) {
    logger.error('Error fetching feedback:', error);
    throw error;
  }
};

/**
 * Get feedback by ID
 * @param {Number} id - Feedback ID
 * @returns {Object} Feedback details
 */
const getFeedbackById = async (id) => {
  try {
    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            },
            {
              model: Field,
              as: 'field',
              attributes: ['id', 'name', 'location']
            }
          ]
        }
      ]
    });
    
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }
    
    return feedback;
  } catch (error) {
    logger.error(`Error fetching feedback ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new feedback
 * @param {Object} feedbackData - Feedback data
 * @param {Number} userId - User ID creating the feedback
 * @returns {Object} Created feedback
 */
const createFeedback = async (feedbackData, userId) => {
  try {
    const { bookingId, rating, comment } = feedbackData;
    
    // Check if booking exists and belongs to user
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    
    if (booking.userId !== userId) {
      throw new ApiError(403, 'You can only provide feedback for your own bookings');
    }
    
    // Check if feedback already exists for this booking
    const existingFeedback = await Feedback.findOne({
      where: { bookingId }
    });
    
    if (existingFeedback) {
      throw new ApiError(400, 'Feedback already exists for this booking');
    }
    
    // Create feedback
    const feedback = await Feedback.create({
      bookingId,
      rating,
      comment
    });
    
    // Return feedback with associations
    return getFeedbackById(feedback.id);
  } catch (error) {
    logger.error('Error creating feedback:', error);
    throw error;
  }
};

/**
 * Update a feedback
 * @param {Number} id - Feedback ID
 * @param {Object} feedbackData - Feedback data to update
 * @param {Number} userId - Current user ID
 * @returns {Object} Updated feedback
 */
const updateFeedback = async (id, feedbackData, userId) => {
  try {
    // Find feedback
    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        }
      ]
    });
    
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }
    
    // Check if user owns the feedback
    if (feedback.booking.userId !== userId) {
      throw new ApiError(403, 'You can only update your own feedback');
    }
    
    // Update feedback
    await feedback.update(feedbackData);
    
    // Return updated feedback with associations
    return getFeedbackById(id);
  } catch (error) {
    logger.error(`Error updating feedback ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a feedback
 * @param {Number} id - Feedback ID
 * @param {Number} userId - Current user ID
 * @param {String} userRole - User role
 * @returns {Boolean} Success status
 */
const deleteFeedback = async (id, userId, userRole) => {
  try {
    // Find feedback
    const feedback = await Feedback.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        }
      ]
    });
    
    if (!feedback) {
      throw new ApiError(404, 'Feedback not found');
    }
    
    // Check permissions (admin can delete any feedback, users only their own)
    if (userRole !== 'admin' && feedback.booking.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own feedback');
    }
    
    // Delete feedback
    await feedback.destroy();
    
    return true;
  } catch (error) {
    logger.error(`Error deleting feedback ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get average rating for a field
 * @param {Number} fieldId - Field ID
 * @returns {Object} Average rating and count
 */
const getFieldRating = async (fieldId) => {
  try {
    const result = await Feedback.findAll({
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('rating')), 'averageRating'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: [],
          where: { fieldId }
        }
      ],
      raw: true
    });
    
    return {
      fieldId,
      averageRating: parseFloat(result[0].averageRating) || 0,
      count: parseInt(result[0].count) || 0
    };
  } catch (error) {
    logger.error(`Error getting rating for field ${fieldId}:`, error);
    throw error;
  }
};

module.exports = {
  getAllFeedback,
  getFeedbackById,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFieldRating
}; 