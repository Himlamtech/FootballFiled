const opponentService = require('../services/opponent.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all opponent requests with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllOpponents = async (req, res, next) => {
  try {
    const { status, fieldId, date, page, limit } = req.query;

    const options = {
      status,
      fieldId,
      date,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };

    const result = await opponentService.getAllOpponents(options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get opponent request by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOpponentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opponent = await opponentService.getOpponentById(id);

    res.status(200).json(opponent);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new opponent request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createOpponent = async (req, res, next) => {
  try {
    const opponentData = req.body;

    // For public API, we don't require authentication
    const opponent = await opponentService.createOpponent(opponentData);

    res.status(201).json(opponent);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an opponent request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateOpponent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const opponentData = req.body;

    const updatedOpponent = await opponentService.updateOpponent(id, opponentData);

    res.status(200).json(updatedOpponent);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an opponent request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteOpponent = async (req, res, next) => {
  try {
    const { id } = req.params;

    await opponentService.deleteOpponent(id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Match two teams for a friendly match
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const matchOpponents = async (req, res, next) => {
  try {
    const { opponentId1, opponentId2 } = req.body;

    if (!opponentId1 || !opponentId2) {
      throw new ApiError(400, 'Both opponent IDs are required');
    }

    const match = await opponentService.matchOpponents(opponentId1, opponentId2);

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

/**
 * Find available opponents for matching
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const findAvailableOpponents = async (req, res, next) => {
  try {
    const { date, fieldSize, teamName } = req.query;

    const criteria = {
      date,
      fieldSize,
      teamName
    };

    const opponents = await opponentService.findAvailableOpponents(criteria);

    res.status(200).json({
      count: opponents.length,
      opponents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get opponent request for a specific booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getOpponentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    // Use the getAllOpponents service with a filter for the specific booking
    const options = {
      bookingCondition: { id: bookingId }
    };

    const result = await opponentService.getAllOpponents(options);

    // Return the first opponent or null
    const opponent = result.opponents.length > 0 ? result.opponents[0] : null;

    res.status(200).json(opponent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOpponents,
  getOpponentById,
  createOpponent,
  updateOpponent,
  deleteOpponent,
  matchOpponents,
  findAvailableOpponents,
  getOpponentByBooking
};