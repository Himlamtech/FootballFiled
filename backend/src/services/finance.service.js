const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

const Finance = db.Finance;
const Booking = db.Booking;

/**
 * Get all finance records with pagination and filters
 * @param {Object} options - Query options (filters, pagination)
 * @returns {Object} Paginated list of finance records
 */
const getAllFinances = async (options = {}) => {
  try {
    const {
      transaction_type,
      category,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = options;

    // Build filter conditions
    const condition = {};
    if (transaction_type) condition.transaction_type = transaction_type;
    if (category) condition.category = category;
    if (status) condition.status = status;
    
    // Date range filter
    if (startDate || endDate) {
      condition.transaction_date = {};
      if (startDate) condition.transaction_date[Op.gte] = new Date(startDate);
      if (endDate) condition.transaction_date[Op.lte] = new Date(endDate);
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Query finances with pagination
    const { count, rows } = await Finance.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['transaction_date', 'DESC']],
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'customer_name', 'customer_phone', 'booking_date']
        }
      ]
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    return {
      totalItems: count,
      totalPages,
      currentPage: page,
      finances: rows
    };
  } catch (error) {
    logger.error('Error fetching finances:', error);
    throw error;
  }
};

/**
 * Get finance record by ID
 * @param {Number} id - Finance ID
 * @returns {Object} Finance details
 */
const getFinanceById = async (id) => {
  try {
    const finance = await Finance.findByPk(id, {
      include: [
        {
          model: Booking,
          as: 'booking',
          attributes: ['id', 'customer_name', 'customer_phone', 'booking_date']
        }
      ]
    });

    if (!finance) {
      throw new ApiError(404, 'Finance record not found');
    }

    return finance;
  } catch (error) {
    logger.error(`Error fetching finance ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new finance record
 * @param {Object} financeData - Finance data
 * @returns {Object} Created finance record
 */
const createFinance = async (financeData) => {
  try {
    // Create finance record
    const finance = await Finance.create(financeData);

    // Return finance with associations
    return getFinanceById(finance.id);
  } catch (error) {
    logger.error('Error creating finance record:', error);
    throw error;
  }
};

/**
 * Update a finance record
 * @param {Number} id - Finance ID
 * @param {Object} financeData - Finance data to update
 * @returns {Object} Updated finance record
 */
const updateFinance = async (id, financeData) => {
  try {
    // Find finance
    const finance = await Finance.findByPk(id);

    if (!finance) {
      throw new ApiError(404, 'Finance record not found');
    }

    // Update finance
    await finance.update(financeData);

    // Return updated finance with associations
    return getFinanceById(id);
  } catch (error) {
    logger.error(`Error updating finance ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a finance record
 * @param {Number} id - Finance ID
 * @returns {Boolean} Success status
 */
const deleteFinance = async (id) => {
  try {
    // Find finance
    const finance = await Finance.findByPk(id);

    if (!finance) {
      throw new ApiError(404, 'Finance record not found');
    }

    // Delete finance
    await finance.destroy();

    return true;
  } catch (error) {
    logger.error(`Error deleting finance ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get finance summary
 * @param {Object} options - Query options (filters)
 * @returns {Object} Finance summary
 */
const getFinanceSummary = async (options = {}) => {
  try {
    const {
      startDate,
      endDate,
      period = 'month' // 'day', 'week', 'month', 'year'
    } = options;

    // Build date range filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.transaction_date = {};
      if (startDate) dateFilter.transaction_date[Op.gte] = new Date(startDate);
      if (endDate) dateFilter.transaction_date[Op.lte] = new Date(endDate);
    }

    // Get total income
    const totalIncome = await Finance.sum('amount', {
      where: {
        ...dateFilter,
        transaction_type: 'income',
        status: 'completed'
      }
    }) || 0;

    // Get total expense
    const totalExpense = await Finance.sum('amount', {
      where: {
        ...dateFilter,
        transaction_type: 'expense',
        status: 'completed'
      }
    }) || 0;

    // Get income by category
    const incomeByCategory = await Finance.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
      ],
      where: {
        ...dateFilter,
        transaction_type: 'income',
        status: 'completed'
      },
      group: ['category'],
      raw: true
    });

    // Get expense by category
    const expenseByCategory = await Finance.findAll({
      attributes: [
        'category',
        [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
      ],
      where: {
        ...dateFilter,
        transaction_type: 'expense',
        status: 'completed'
      },
      group: ['category'],
      raw: true
    });

    // Get income by payment method
    const incomeByPaymentMethod = await Finance.findAll({
      attributes: [
        'payment_method',
        [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'total']
      ],
      where: {
        ...dateFilter,
        transaction_type: 'income',
        status: 'completed'
      },
      group: ['payment_method'],
      raw: true
    });

    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      incomeByCategory,
      expenseByCategory,
      incomeByPaymentMethod
    };
  } catch (error) {
    logger.error('Error getting finance summary:', error);
    throw error;
  }
};

/**
 * Create a finance record from a booking
 * @param {Object} booking - Booking object
 * @returns {Object} Created finance record
 */
const createFinanceFromBooking = async (booking) => {
  try {
    // Only create finance record if payment status is 'paid'
    if (booking.payment_status !== 'paid') {
      return null;
    }

    const financeData = {
      booking_id: booking.id,
      transaction_type: 'income',
      amount: booking.total_price,
      payment_method: booking.payment_method,
      category: 'booking',
      description: `Booking #${booking.id} - ${booking.customer_name}`,
      transaction_date: new Date(),
      status: 'completed'
    };

    return await createFinance(financeData);
  } catch (error) {
    logger.error(`Error creating finance from booking ID ${booking.id}:`, error);
    throw error;
  }
};

module.exports = {
  getAllFinances,
  getFinanceById,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceSummary,
  createFinanceFromBooking
};
