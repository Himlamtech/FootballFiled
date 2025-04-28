const db = require('../models');
const { ApiError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

const Product = db.Product;
const BookingProduct = db.BookingProduct;
const { Op } = db.Sequelize;

/**
 * Get all products with pagination and filters
 * @param {Object} options - Query options (filters, pagination)
 * @returns {Object} Paginated list of products
 */
const getAllProducts = async (options = {}) => {
  try {
    const { 
      category, 
      name, 
      page = 1, 
      limit = 10 
    } = options;
    
    // Build filter conditions
    const condition = {};
    if (category) condition.category = category;
    if (name) condition.name = { [Op.like]: `%${name}%` };
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Query products with pagination
    const { count, rows } = await Product.findAndCountAll({
      where: condition,
      limit,
      offset,
      order: [['category', 'ASC'], ['name', 'ASC']],
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    return {
      totalItems: count,
      totalPages,
      currentPage: page,
      products: rows
    };
  } catch (error) {
    logger.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get product by ID
 * @param {Number} id - Product ID
 * @returns {Object} Product details
 */
const getProductById = async (id) => {
  try {
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    return product;
  } catch (error) {
    logger.error(`Error fetching product ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 * @param {Object} productData - Product data
 * @returns {Object} Created product
 */
const createProduct = async (productData) => {
  try {
    // Create product
    const product = await Product.create(productData);
    
    return product;
  } catch (error) {
    logger.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update a product
 * @param {Number} id - Product ID
 * @param {Object} productData - Product data to update
 * @returns {Object} Updated product
 */
const updateProduct = async (id, productData) => {
  try {
    // Find product
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    // Update product
    await product.update(productData);
    
    return product;
  } catch (error) {
    logger.error(`Error updating product ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 * @param {Number} id - Product ID
 * @returns {Boolean} Success status
 */
const deleteProduct = async (id) => {
  try {
    // Check if product exists
    const product = await Product.findByPk(id);
    
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    
    // Check if product is used in any bookings
    const bookingProducts = await BookingProduct.count({
      where: { productId: id }
    });
    
    if (bookingProducts > 0) {
      throw new ApiError(400, 'Cannot delete product that is used in bookings');
    }
    
    // Delete product
    await product.destroy();
    
    return true;
  } catch (error) {
    logger.error(`Error deleting product ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get products by category
 * @param {String} category - Product category
 * @returns {Array} List of products in the category
 */
const getProductsByCategory = async (category) => {
  try {
    const products = await Product.findAll({
      where: { category },
      order: [['name', 'ASC']]
    });
    
    return products;
  } catch (error) {
    logger.error(`Error fetching products in category ${category}:`, error);
    throw error;
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