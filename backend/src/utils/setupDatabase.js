const initDatabase = require('./initDatabase');
const generateData = require('./generateData');
const logger = require('./logger');

async function setupDatabase() {
  try {
    logger.info('Starting database setup...');
    
    // Step 1: Initialize database (create if not exists)
    await initDatabase();
    
    // Step 2: Generate sample data
    await generateData();
    
    logger.info('Database setup completed successfully');
    return true;
  } catch (error) {
    logger.error('Error setting up database:', error);
    throw error;
  }
}

// If script is run directly, execute the function
if (require.main === module) {
  setupDatabase()
    .then(() => {
      logger.info('Database setup completed, exiting.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupDatabase; 