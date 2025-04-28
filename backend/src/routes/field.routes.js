const express = require('express');
const fieldController = require('../controllers/field.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', fieldController.getAllFields);
router.get('/availability', fieldController.checkAvailability);
router.get('/:id', validationMiddleware.validateIdParam, fieldController.getFieldById);

// Admin only routes
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validationMiddleware.fieldValidation,
  fieldController.createField
);

router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validationMiddleware.validateIdParam,
  validationMiddleware.fieldValidation,
  fieldController.updateField
);

router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validationMiddleware.validateIdParam,
  fieldController.deleteField
);

module.exports = router; 