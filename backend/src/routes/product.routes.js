const express = require('express');
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { 
  productValidation, 
  idValidation, 
  paginationValidation
} = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', paginationValidation, productController.getAllProducts);
router.get('/:id', idValidation, productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);

// Admin only routes
router.post('/', verifyToken, isAdmin, productValidation, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, idValidation, productValidation, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, idValidation, productController.deleteProduct);

module.exports = router; 