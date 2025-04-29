const express = require('express');
const fieldController = require('../controllers/field.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', fieldController.getAllFields);
router.get('/:id', fieldController.getFieldById);
router.get('/:fieldId/time-slots', fieldController.getFieldTimeSlots);

// Admin routes
router.post('/', verifyToken, isAdmin, fieldController.createField);
router.put('/:id', verifyToken, isAdmin, fieldController.updateField);
router.delete('/:id', verifyToken, isAdmin, fieldController.deleteField);

module.exports = router;