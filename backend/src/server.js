const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');
const { sequelize } = require('./models');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

// Start server
const server = app.listen(config.port, async () => {
  logger.info(`Server running on port ${config.port} in ${config.env} mode`);
  
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync database models in development mode
    if (config.env === 'development' && config.db.sync) {
      await sequelize.sync({ alter: config.db.syncAlter });
      logger.info('Database synced successfully');
    }
  } catch (err) {
    logger.error('Unable to connect to the database:', err);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

module.exports = server; 