const { TimeSlot } = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all time slots
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllTimeSlots = async (req, res, next) => {
  try {
    const timeSlots = await TimeSlot.findAll({
      order: [['start_time', 'ASC']]
    });
    
    res.status(200).json(timeSlots);
  } catch (error) {
    logger.error('Error getting time slots:', error);
    next(error);
  }
};

/**
 * Get time slot by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getTimeSlotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const timeSlot = await TimeSlot.findByPk(id);
    if (!timeSlot) {
      throw new ApiError(404, 'Time slot not found');
    }
    
    res.status(200).json(timeSlot);
  } catch (error) {
    logger.error('Error getting time slot by ID:', error);
    next(error);
  }
};

/**
 * Create a new time slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createTimeSlot = async (req, res, next) => {
  try {
    const { start_time, end_time, is_active } = req.body;
    
    const timeSlot = await TimeSlot.create({
      start_time,
      end_time,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json(timeSlot);
  } catch (error) {
    logger.error('Error creating time slot:', error);
    next(error);
  }
};

/**
 * Update a time slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_time, end_time, is_active } = req.body;
    
    const timeSlot = await TimeSlot.findByPk(id);
    if (!timeSlot) {
      throw new ApiError(404, 'Time slot not found');
    }
    
    await timeSlot.update({
      start_time: start_time || timeSlot.start_time,
      end_time: end_time || timeSlot.end_time,
      is_active: is_active !== undefined ? is_active : timeSlot.is_active
    });
    
    res.status(200).json(timeSlot);
  } catch (error) {
    logger.error('Error updating time slot:', error);
    next(error);
  }
};

/**
 * Delete a time slot
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const timeSlot = await TimeSlot.findByPk(id);
    if (!timeSlot) {
      throw new ApiError(404, 'Time slot not found');
    }
    
    await timeSlot.destroy();
    
    res.status(204).end();
  } catch (error) {
    logger.error('Error deleting time slot:', error);
    next(error);
  }
};

module.exports = {
  getAllTimeSlots,
  getTimeSlotById,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot
};
