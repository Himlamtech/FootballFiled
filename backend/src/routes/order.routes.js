const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const router = express.Router();

// Temporary handler for orders
router.post('/', async (req, res) => {
  try {
    // Log the order data
    console.log('Received order:', req.body);
    
    // Return a success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: Math.floor(Math.random() * 1000) + 1, // Generate a random order ID
      data: req.body
    });
  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message
    });
  }
});

// Admin routes
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    // Return a mock list of orders
    res.status(200).json({
      success: true,
      orders: [
        {
          id: 1,
          customer_name: 'Test Customer',
          customer_phone: '0123456789',
          customer_email: 'test@example.com',
          total_price: 150000,
          status: 'completed',
          created_at: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

module.exports = router;
