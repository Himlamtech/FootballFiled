const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const Opponent = db.Opponent;
const Booking = db.Booking;
const User = db.User;
const Field = db.Field;
const { Op } = db.Sequelize;

/**
 * Get all opponent requests with pagination and filters
 * @param {Object} options - Query options (filters, pagination)
 * @returns {Object} Paginated list of opponent requests
 */
const getAllOpponents = async (options = {}) => {
  try {
    const { 
      status, 
      fieldId,
      date,
      page = 1, 
      limit = 10 
    } = options;
    
    // Build filter conditions for bookings to join
    const bookingCondition = {};
    if (fieldId) bookingCondition.fieldId = fieldId;
    if (date) bookingCondition.bookingDate = date;
    
    // Build filter conditions for opponents
    const opponentCondition = {};
    if (status) opponentCondition.status = status;
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Query opponents with pagination and includes
    const { count, rows } = await Opponent.findAndCountAll({
      where: opponentCondition,
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
              attributes: ['id', 'name', 'location', 'size']
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
      opponents: rows
    };
  } catch (error) {
    logger.error('Error fetching opponent requests:', error);
    throw error;
  }
};

/**
 * Get opponent request by ID
 * @param {Number} id - Opponent request ID
 * @returns {Object} Opponent request details
 */
const getOpponentById = async (id) => {
  try {
    const opponent = await Opponent.findByPk(id, {
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
              attributes: ['id', 'name', 'location', 'size']
            }
          ]
        }
      ]
    });
    
    if (!opponent) {
      throw new ApiError(404, 'Opponent request not found');
    }
    
    return opponent;
  } catch (error) {
    logger.error(`Error fetching opponent request ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new opponent request
 * @param {Object} opponentData - Opponent request data
 * @param {Number} userId - User ID creating the request
 * @returns {Object} Created opponent request
 */
const createOpponent = async (opponentData, userId) => {
  try {
    const { bookingId, teamName, contactEmail, contactPhone, description } = opponentData;
    
    // Check if booking exists and belongs to user
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      throw new ApiError(404, 'Booking not found');
    }
    
    if (booking.userId !== userId) {
      throw new ApiError(403, 'You can only create opponent requests for your own bookings');
    }
    
    // Check if opponent request already exists for this booking
    const existingOpponent = await Opponent.findOne({
      where: { bookingId }
    });
    
    if (existingOpponent) {
      throw new ApiError(400, 'Opponent request already exists for this booking');
    }
    
    // Create opponent request
    const opponent = await Opponent.create({
      bookingId,
      teamName,
      contactEmail,
      contactPhone,
      description,
      status: 'searching'
    });
    
    // Return opponent with associations
    return getOpponentById(opponent.id);
  } catch (error) {
    logger.error('Error creating opponent request:', error);
    throw error;
  }
};

/**
 * Update an opponent request
 * @param {Number} id - Opponent request ID
 * @param {Object} opponentData - Opponent request data to update
 * @param {Number} userId - Current user ID
 * @param {String} userRole - User role
 * @returns {Object} Updated opponent request
 */
const updateOpponent = async (id, opponentData, userId, userRole) => {
  try {
    // Find opponent
    const opponent = await Opponent.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        }
      ]
    });
    
    if (!opponent) {
      throw new ApiError(404, 'Opponent request not found');
    }
    
    // Check permissions (admin can update any request, users only their own)
    if (userRole !== 'admin' && opponent.booking.userId !== userId) {
      throw new ApiError(403, 'You can only update your own opponent requests');
    }
    
    // Update opponent
    await opponent.update(opponentData);
    
    // Return updated opponent with associations
    return getOpponentById(id);
  } catch (error) {
    logger.error(`Error updating opponent request ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an opponent request
 * @param {Number} id - Opponent request ID
 * @param {Number} userId - Current user ID
 * @param {String} userRole - User role
 * @returns {Boolean} Success status
 */
const deleteOpponent = async (id, userId, userRole) => {
  try {
    // Find opponent
    const opponent = await Opponent.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking'
        }
      ]
    });
    
    if (!opponent) {
      throw new ApiError(404, 'Opponent request not found');
    }
    
    // Check permissions (admin can delete any request, users only their own)
    if (userRole !== 'admin' && opponent.booking.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own opponent requests');
    }
    
    // Delete opponent
    await opponent.destroy();
    
    return true;
  } catch (error) {
    logger.error(`Error deleting opponent request ID ${id}:`, error);
    throw error;
  }
};

/**
 * Match two teams for a friendly match
 * @param {Number} opponentId1 - First opponent request ID
 * @param {Number} opponentId2 - Second opponent request ID
 * @returns {Object} Matched opponents
 */
const matchOpponents = async (opponentId1, opponentId2) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    // Find both opponent requests
    const opponent1 = await Opponent.findByPk(opponentId1, {
      include: [{ model: Booking, as: 'booking' }],
      transaction
    });
    
    const opponent2 = await Opponent.findByPk(opponentId2, {
      include: [{ model: Booking, as: 'booking' }],
      transaction
    });
    
    if (!opponent1 || !opponent2) {
      throw new ApiError(404, 'One or both opponent requests not found');
    }
    
    // Check if both requests are in 'searching' status
    if (opponent1.status !== 'searching' || opponent2.status !== 'searching') {
      throw new ApiError(400, 'One or both opponent requests are not available for matching');
    }
    
    // Update both to 'matched' status
    await opponent1.update({ status: 'matched' }, { transaction });
    await opponent2.update({ status: 'matched' }, { transaction });
    
    await transaction.commit();
    
    return {
      match: {
        id: Date.now(),
        team1: {
          opponentId: opponent1.id,
          teamName: opponent1.teamName,
          bookingDate: opponent1.booking.bookingDate,
          startTime: opponent1.booking.startTime,
          fieldId: opponent1.booking.fieldId
        },
        team2: {
          opponentId: opponent2.id,
          teamName: opponent2.teamName,
          bookingDate: opponent2.booking.bookingDate,
          startTime: opponent2.booking.startTime,
          fieldId: opponent2.booking.fieldId
        },
        matchedAt: new Date()
      }
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Error matching opponents (${opponentId1}, ${opponentId2}):`, error);
    throw error;
  }
};

/**
 * Find available opponents for matching
 * @param {Object} criteria - Search criteria
 * @returns {Array} List of available opponents
 */
const findAvailableOpponents = async (criteria = {}) => {
  try {
    const { 
      date, 
      fieldSize, 
      teamName 
    } = criteria;
    
    // Build query conditions
    const bookingCondition = {};
    const opponentCondition = { status: 'searching' };
    
    if (date) bookingCondition.bookingDate = date;
    if (teamName) opponentCondition.teamName = { [Op.like]: `%${teamName}%` };
    
    const opponents = await Opponent.findAll({
      where: opponentCondition,
      include: [
        {
          model: Booking,
          as: 'booking',
          where: bookingCondition,
          include: [
            {
              model: Field,
              as: 'field',
              attributes: ['id', 'name', 'location', 'size'],
              where: fieldSize ? { size: fieldSize } : {}
            },
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return opponents;
  } catch (error) {
    logger.error('Error finding available opponents:', error);
    throw error;
  }
};

module.exports = {
  getAllOpponents,
  getOpponentById,
  createOpponent,
  updateOpponent,
  deleteOpponent,
  matchOpponents,
  findAvailableOpponents
}; 