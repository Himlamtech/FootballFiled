const express = require('express');
const authRoutes = require('./auth.routes');
const fieldRoutes = require('./field.routes');
const bookingRoutes = require('./booking.routes');
const productRoutes = require('./product.routes');
const feedbackRoutes = require('./feedback.routes');
const opponentRoutes = require('./opponent.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// API routes
router.use('/auth', authRoutes);
router.use('/fields', fieldRoutes);
router.use('/bookings', bookingRoutes);
router.use('/products', productRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/opponents', opponentRoutes);

module.exports = router; 