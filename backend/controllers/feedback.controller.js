const { Feedback, User } = require('../models');

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
          model: User,
          attributes: ['userId', 'name', 'email'],
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
          model: User,
          attributes: ['userId', 'name', 'email'],
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
    
    // Update fields
    if (status) feedback.status = status;
    if (response) feedback.response = response;
    
    await feedback.save();
    
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
