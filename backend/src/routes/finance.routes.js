const express = require('express');
const financeController = require('../controllers/finance.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// All finance routes require admin access
router.use(verifyToken, isAdmin);

// Get finance summary
router.get('/summary', financeController.getFinanceSummary);

// CRUD operations
router.get('/', financeController.getAllFinances);
router.get('/:id', financeController.getFinanceById);
router.post('/', financeController.createFinance);
router.put('/:id', financeController.updateFinance);
router.delete('/:id', financeController.deleteFinance);

module.exports = router;
