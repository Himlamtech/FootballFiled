const fieldService = require('../services/field.service');
const feedbackService = require('../services/feedback.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all fields with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllFields = async (req, res, next) => {
  try {
    const { status, size, page, limit } = req.query;
    
    const options = {
      status,
      size,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };
    
    const result = await fieldService.getAllFields(options);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get field by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFieldById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const field = await fieldService.getFieldById(id);
    
    // Get field rating
    const ratingData = await feedbackService.getFieldRating(id);
    
    // Combine field and rating data
    const fieldWithRating = {
      ...field.toJSON(),
      rating: ratingData.averageRating,
      ratingCount: ratingData.count
    };
    
    res.status(200).json(fieldWithRating);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createField = async (req, res, next) => {
  try {
    const fieldData = req.body;
    const field = await fieldService.createField(fieldData);
    
    res.status(201).json(field);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateField = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fieldData = req.body;
    
    const updatedField = await fieldService.updateField(id, fieldData);
    
    res.status(200).json(updatedField);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a field
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteField = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await fieldService.deleteField(id);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Check field availability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { fieldId, date, startTime, endTime } = req.query;
    
    if (!fieldId || !date || !startTime || !endTime) {
      throw new ApiError(400, 'Field ID, date, start time, and end time are required');
    }
    
    const isAvailable = await fieldService.checkFieldAvailability(
      fieldId,
      date,
      startTime,
      endTime
    );
    
    res.status(200).json({
      fieldId: parseInt(fieldId, 10),
      date,
      startTime,
      endTime,
      isAvailable
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  checkAvailability
}; 