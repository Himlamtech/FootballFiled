const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { Finance } = require('../models'); // Import Finance model
const router = express.Router();

// Process orders and create finance entries
router.post('/', async (req, res) => {
  try {
    // Log the order data
    console.log('Received order:', req.body);
    
    // Create order
    const orderData = req.body;
    
    // Generate a random order ID
    const orderId = Math.floor(Math.random() * 1000) + 1;
    
    // Create a finance entry for this order
    try {
      const { total_amount, customer_name, items } = orderData;
      const productNames = items.map(item => item.product_name).join(', ');
      
      // Create finance record
      await Finance.create({
        transaction_type: 'product_sale',
        amount: total_amount,
        description: `Bán sản phẩm: ${productNames}`,
        reference_id: `ORDER-${orderId}`,
        reference_name: customer_name || 'Khách hàng',
        status: 'completed',
        created_at: new Date()
      });
      
      console.log('Finance record created for order');
    } catch (financeError) {
      console.error('Error creating finance record:', financeError);
      // Continue with order creation even if finance record fails
    }
    
    // Return a success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId,
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