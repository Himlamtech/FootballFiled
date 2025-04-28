const express = require('express');
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { 
  productValidation, 
  idParamValidation, 
  paginationValidation,
  categoryValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', paginationValidation, productController.getAllProducts);
router.get('/:id', idParamValidation, productController.getProductById);
router.get('/category/:category', categoryValidation, productController.getProductsByCategory);

// Admin only routes
router.post('/', verifyToken, isAdmin, productValidation, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, idParamValidation, productValidation, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, idParamValidation, productController.deleteProduct);

module.exports = router; 