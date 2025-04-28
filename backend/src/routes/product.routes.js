const express = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// Public routes
router.get('/', validationMiddleware.paginationValidation, productController.getAllProducts);
router.get('/:id', validationMiddleware.validateIdParam, productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);

// Admin only routes
router.post(
  '/',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validationMiddleware.productValidation,
  productController.createProduct
);

router.put(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validationMiddleware.validateIdParam,
  validationMiddleware.productValidation,
  productController.updateProduct
);

router.delete(
  '/:id',
  authMiddleware.verifyToken,
  authMiddleware.isAdmin,
  validationMiddleware.validateIdParam,
  productController.deleteProduct
);

module.exports = router; 