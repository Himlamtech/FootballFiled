const express = require('express');
const router = express.Router();
const financeController = require('../controllers/finance.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
// Remove validation middleware for now as it might not exist

/**
 * @route GET /api/finances/summary
 * @desc Get finance summary (income, expenses, profit)
 * @access Private (Admin only)
 */
router.get('/summary',
  verifyToken,
  isAdmin,
  financeController.getFinanceSummary
);

/**
 * @route GET /api/finances
 * @desc Get all finance records with pagination and filtering
 * @access Private (Admin only)
 */
router.get('/',
  verifyToken,
  isAdmin,
  financeController.getAllFinances
);

/**
 * @route GET /api/finances/:id
 * @desc Get a finance record by ID
 * @access Private (Admin only)
 */
router.get('/:id',
  verifyToken,
  isAdmin,
  financeController.getFinanceById
);

/**
 * @route POST /api/finances
 * @desc Create a new finance record
 * @access Private (Admin only)
 */
router.post('/',
  verifyToken,
  isAdmin,
  financeController.createFinance
);

/**
 * @route PUT /api/finances/:id
 * @desc Update a finance record
 * @access Private (Admin only)
 */
router.put('/:id',
  verifyToken,
  isAdmin,
  financeController.updateFinance
);

/**
 * @route DELETE /api/finances/:id
 * @desc Delete a finance record
 * @access Private (Admin only)
 */
router.delete('/:id',
  verifyToken,
  isAdmin,
  financeController.deleteFinance
);

module.exports = router;
