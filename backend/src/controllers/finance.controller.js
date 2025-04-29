const financeService = require('../services/finance.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all finance records with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllFinances = async (req, res, next) => {
  try {
    const {
      transaction_type,
      category,
      status,
      startDate,
      endDate,
      page,
      limit
    } = req.query;

    const options = {
      transaction_type,
      category,
      status,
      startDate,
      endDate,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };

    const result = await financeService.getAllFinances(options);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get finance record by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFinanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const finance = await financeService.getFinanceById(id);

    res.status(200).json(finance);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new finance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createFinance = async (req, res, next) => {
  try {
    const financeData = req.body;
    const finance = await financeService.createFinance(financeData);

    res.status(201).json(finance);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a finance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateFinance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const financeData = req.body;

    const updatedFinance = await financeService.updateFinance(id, financeData);

    res.status(200).json(updatedFinance);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a finance record
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteFinance = async (req, res, next) => {
  try {
    const { id } = req.params;

    await financeService.deleteFinance(id);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get finance summary
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getFinanceSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, period } = req.query;

    const options = {
      startDate,
      endDate,
      period
    };

    const summary = await financeService.getFinanceSummary(options);

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFinances,
  getFinanceById,
  createFinance,
  updateFinance,
  deleteFinance,
  getFinanceSummary
};
