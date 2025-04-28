const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

async function initDatabase() {
  try {
    logger.info('Initializing database...');

    if (config.db.dialect === 'sqlite') {
      // Ensure the data directory exists
      const dataDir = path.dirname(config.db.storage);
      if (!fs.existsSync(dataDir)) {
        logger.info(`Creating data directory: ${dataDir}`);
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Check if database file exists
      if (!fs.existsSync(config.db.storage)) {
        logger.info(`SQLite database file will be created at: ${config.db.storage}`);
      } else {
        logger.info(`SQLite database file already exists at: ${config.db.storage}`);
      }
    } else if (config.db.dialect === 'mysql') {
      // For MySQL, we would connect and create database if not exists
      // Implementation left for future use
      logger.info('MySQL database initialization is not implemented in this script.');
    }
    
    logger.info('Database initialization completed');
    return true;
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
}

// If script is run directly, execute the function
if (require.main === module) {
  initDatabase()
    .then(() => {
      logger.info('Database initialization successful');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase; 