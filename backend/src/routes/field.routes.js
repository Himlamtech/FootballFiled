const express = require('express');
const fieldController = require('../controllers/field.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { 
  fieldValidation, 
  idValidation,
  availabilityValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', fieldController.getAllFields);
router.get('/availability', availabilityValidation, fieldController.checkFieldAvailability);
router.get('/:id', idValidation, fieldController.getFieldById);

// Admin only routes
router.post('/', verifyToken, isAdmin, fieldValidation, fieldController.createField);
router.put('/:id', verifyToken, isAdmin, idValidation, fieldValidation, fieldController.updateField);
router.delete('/:id', verifyToken, isAdmin, idValidation, fieldController.deleteField);

module.exports = router; 