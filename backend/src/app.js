const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const fieldRoutes = require('./routes/field.routes');
const bookingRoutes = require('./routes/booking.routes');
const productRoutes = require('./routes/product.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const opponentRoutes = require('./routes/opponent.routes');

// Initialize express app
const app = express();

// Set up request logging
if (config.env !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) },
      skip: (req) => req.path === '/health' || req.path === '/favicon.ico',
    })
  );
}

// Set up security, CORS, and other middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// Serve static files if in production
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Set up API routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/opponents', opponentRoutes);

// Serve frontend in production
if (config.env === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested resource was not found' });
});

module.exports = app; 