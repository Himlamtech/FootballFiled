const { Finance } = require('../models');
const financeService = require('../services/finance.service');
const Sequelize = require('sequelize');
const logger = require('../utils/logger');
const { Op } = Sequelize;

/**
 * Get finance summary (income, expenses, total)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFinanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, [Op.gte]: new Date(startDate) };
    }
    if (endDate) {
      dateFilter.createdAt = { ...dateFilter.createdAt, [Op.lte]: new Date(endDate) };
    }

    // Get all finance records within date range
    const financeRecords = await Finance.findAll({
      where: dateFilter,
      attributes: [
        'transaction_type',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount']
      ],
      group: ['transaction_type']
    });

    // Calculate income, expenses and total
    let income = 0;
    let expenses = 0;

    financeRecords.forEach(record => {
      const amount = parseFloat(record.dataValues.total_amount);
      if (amount > 0) {
        income += amount;
      } else {
        expenses += Math.abs(amount);
      }
    });

    const total = income - expenses;

    res.status(200).json({
      income,
      expenses,
      total
    });
  } catch (error) {
    logger.error('Error getting finance summary:', error);
    res.status(500).json({ message: 'Error getting finance summary', error: error.message });
  }
};

/**
 * Get all finance records with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllFinances = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, type, search } = req.query;
    const offset = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt[Op.gte] = new Date(startDate);
      if (endDate) filter.createdAt[Op.lte] = new Date(endDate);
    }

    // Transaction type filter
    if (type) {
      filter.transaction_type = type;
    }

    // Search by description only
    if (search) {
      filter[Op.or] = [
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get finance records with pagination
    const { count, rows } = await Finance.findAndCountAll({
      where: filter,
      order: [['transaction_date', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.status(200).json({
      data: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    logger.error('Error getting all finances:', error);
    res.status(500).json({ message: 'Error getting finances', error: error.message });
  }
};

/**
 * Get a finance record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getFinanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const finance = await Finance.findByPk(id);

    if (!finance) {
      return res.status(404).json({ message: 'Finance record not found' });
    }

    res.status(200).json(finance);
  } catch (error) {
    logger.error(`Error getting finance with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error getting finance record', error: error.message });
  }
};

/**
 * Create a new finance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createFinance = async (req, res) => {
  try {
    const { transaction_type, amount, description, payment_method, category, status } = req.body;

    if (!transaction_type || !amount || !description || !payment_method || !category) {
      return res.status(400).json({ message: 'Transaction type, amount, description, payment method, and category are required' });
    }

    // Handle expense or income based on transaction type
    let financeData = {
      transaction_type,
      amount: transaction_type === 'expense' ? (amount > 0 ? -amount : amount) : Math.abs(amount),
      description,
      payment_method,
      category,
      status: status || 'completed'
    };

    const finance = await Finance.create(financeData);

    res.status(201).json(finance);
  } catch (error) {
    logger.error('Error creating finance record:', error);
    res.status(500).json({ message: 'Error creating finance record', error: error.message });
  }
};

/**
 * Update a finance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateFinance = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_type, amount, description, payment_method, category, status } = req.body;

    const finance = await Finance.findByPk(id);

    if (!finance) {
      return res.status(404).json({ message: 'Finance record not found' });
    }

    // Update finance record
    const updatedData = {};
    if (transaction_type) updatedData.transaction_type = transaction_type;
    if (amount !== undefined) {
      updatedData.amount = transaction_type === 'expense' || finance.transaction_type === 'expense' ?
        (amount > 0 ? -amount : amount) : Math.abs(amount);
    }
    if (description) updatedData.description = description;
    if (payment_method) updatedData.payment_method = payment_method;
    if (category) updatedData.category = category;
    if (status) updatedData.status = status;

    await finance.update(updatedData);

    res.status(200).json(await Finance.findByPk(id));
  } catch (error) {
    logger.error(`Error updating finance with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating finance record', error: error.message });
  }
};

/**
 * Delete a finance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteFinance = async (req, res) => {
  try {
    const { id } = req.params;
    const finance = await Finance.findByPk(id);

    if (!finance) {
      return res.status(404).json({ message: 'Finance record not found' });
    }

    await finance.destroy();

    res.status(200).json({ message: 'Finance record deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting finance with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting finance record', error: error.message });
  }
};

// Export all controller functions directly
module.exports = {
  getFinanceSummary: exports.getFinanceSummary,
  getAllFinances: exports.getAllFinances,
  getFinanceById: exports.getFinanceById,
  createFinance: exports.createFinance,
  updateFinance: exports.updateFinance,
  deleteFinance: exports.deleteFinance
};
