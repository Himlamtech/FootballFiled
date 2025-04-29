const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const config = require('./config/config');
const errorHandler = require('./middleware/error.middleware');
const { setHeaders, setSecureCookies } = require('./middleware/headers.middleware');
const logger = require('./utils/logger');

// Import routes
const routes = require('./routes');

// Initialize express app
const app = express();

// Set up request logging
if (config.env !== 'test') {
  app.use(
    morgan('dev', {
      stream: { write: (message) => logger.info(message.trim()) },
      skip: (req) => req.path === '/health' || req.path === '/favicon.ico',
    })
  );
}

// Set up security, CORS, and other middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());
app.use(setHeaders);
app.use(setSecureCookies);

// Serve static files if in production
if (config.env === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Football Field Management API',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/fields',
      '/api/bookings',
      '/api/products',
      '/api/feedbacks',
      '/api/timeslots'
    ]
  });
});

// Set up API routes
app.use('/api', routes);

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