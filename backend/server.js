require('dotenv').config();
const app = require('./src/app');
const db = require('./src/models');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 9002;

// Sync database models with the database
db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => {
    logger.info('Database synchronized successfully');
    
    // Start the Express server
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to sync database:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  process.exit(1);
}); 