const express = require('express');
const authRoutes = require('./auth.routes');
const fieldRoutes = require('./field.routes');
const bookingRoutes = require('./booking.routes');
const productRoutes = require('./product.routes');
const feedbackRoutes = require('./feedback.routes');
const timeSlotRoutes = require('./timeslot.routes');
const dashboardRoutes = require('./dashboard.routes');
const opponentRoutes = require('./opponent.routes');
const orderRoutes = require('./order.routes');
const financeRoutes = require('./finance.routes');

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
router.use('/feedbacks', feedbackRoutes);
router.use('/timeslots', timeSlotRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/opponents', opponentRoutes);
router.use('/orders', orderRoutes);
router.use('/finances', financeRoutes);

module.exports = router;