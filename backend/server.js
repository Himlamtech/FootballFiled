const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database configuration
const { sequelize, testConnection } = require('./config/database');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [process.env.CORS_ORIGIN || 'http://localhost:9001', 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:9004'],
  credentials: true
}));
app.use(morgan('dev'));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Define Routes
// Authentication routes
app.use('/api/auth', require('./routes/auth.routes'));

// User management routes
// app.use('/api/users', require('./routes/user.routes'));

// Field management routes
app.use('/api/fields', require('./routes/field.routes'));
app.use('/api/timeslots', require('./routes/timeslots.routes'));
app.use('/api/field-management', require('./routes/fieldManagement.routes'));

// Booking management routes
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/opponents', require('./routes/opponents.routes'));

// Feedback routes
app.use('/api/feedback', require('./routes/feedback.routes'));

// Admin dashboard routes
app.use('/api/dashboard', require('./routes/dashboard.routes'));

// Test route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Set port
const PORT = process.env.PORT || 9002;

// Database connection and server start
testConnection()
  .then(connected => {
    if (connected) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } else {
      console.error('Database connection failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

module.exports = app;