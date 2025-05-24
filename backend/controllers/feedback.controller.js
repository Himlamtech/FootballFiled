const { Feedback, Admin } = require('../models');
const { sendFeedbackNotification, sendFeedbackResponse } = require('../utils/emailService');

/**
 * Get all feedback
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const { status } = req.query;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Get all feedback
    const feedback = await Feedback.findAll({
      where: filter,
      include: [
        {
          model: Admin,
          attributes: ['adminId', 'username', 'name', 'email'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

/**
 * Get feedback by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getFeedbackById = async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const feedback = await Feedback.findByPk(feedbackId, {
      include: [
        {
          model: Admin,
          attributes: ['adminId', 'username', 'name', 'email'],
          required: false
        }
      ]
    });

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

/**
 * Create new feedback
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.createFeedback = async (req, res) => {
  try {
    const { name, email, content } = req.body;

    // Create feedback
    const feedback = await Feedback.create({
      name,
      email,
      content,
      status: 'new',
      user_id: req.user ? req.user.id : null
    });

    // Send email notification to admin
    try {
      await sendFeedbackNotification({
        id: feedback.id,
        name,
        email,
        content,
        createdAt: feedback.createdAt
      });
      console.log('Feedback notification email sent to admin');
    } catch (emailError) {
      console.error('Failed to send feedback notification email:', emailError);
      // Don't fail the feedback creation if email sending fails
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

/**
 * Update feedback status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const { status, response } = req.body;

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Store original status to check if it changed
    const originalStatus = feedback.status;
    const hadResponse = !!feedback.response;

    // Update fields
    if (status) feedback.status = status;
    if (response) feedback.response = response;

    await feedback.save();

    // Send email response to user if response was added or updated
    if (feedback.email && response && (status === 'responded' || (!hadResponse && feedback.response))) {
      try {
        await sendFeedbackResponse({
          id: feedback.id,
          name: feedback.name,
          email: feedback.email,
          content: feedback.content,
          response: feedback.response,
          createdAt: feedback.createdAt,
          updatedAt: feedback.updatedAt
        });
        console.log(`Feedback response email sent to ${feedback.email}`);
      } catch (emailError) {
        console.error('Failed to send feedback response email:', emailError);
        // Don't fail the feedback update if email sending fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

/**
 * Delete feedback
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.destroy();

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feedback',
      error: error.message
    });
  }
};
