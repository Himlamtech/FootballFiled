const productService = require('../services/product.service');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Get all products with pagination and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getAllProducts = async (req, res, next) => {
  try {
    const { category, name, page, limit } = req.query;
    
    const options = {
      category,
      name,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10
    };
    
    const result = await productService.getAllProducts(options);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id);
    
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const createProduct = async (req, res, next) => {
  try {
    const productData = req.body;
    const product = await productService.createProduct(productData);
    
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    
    const updatedProduct = await productService.updateProduct(id, productData);
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await productService.deleteProduct(id);
    
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    
    if (!category) {
      throw new ApiError(400, 'Category is required');
    }
    
    const products = await productService.getProductsByCategory(category);
    
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
}; 