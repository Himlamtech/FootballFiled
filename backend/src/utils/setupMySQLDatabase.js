const mysql = require('mysql2/promise');
const logger = require('./logger');
const generateMySQLData = require('./generateMySQLData');
const config = require('../config/config');

async function setupMySQLDatabase() {
  let connection;
  try {
    logger.info('Setting up MySQL database...');
    
    // Create connection without database
    connection = await mysql.createConnection({
      host: config.db.host || 'localhost',
      port: config.db.port || 3306,
      user: config.db.username || 'root',
      password: config.db.password || ''
    });
    
    logger.info('Connected to MySQL server');
    
    // Create database if not exists
    const dbName = config.db.database || 'football_field_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logger.info(`Database ${dbName} created or verified`);
    
    // Close connection
    await connection.end();
    
    // Generate data
    await generateMySQLData();
    
    logger.info('MySQL database setup completed successfully');
    return true;
  } catch (error) {
    logger.error('Error setting up MySQL database:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        logger.error('Error closing MySQL connection:', err);
      }
    }
  }
}

// If script is run directly, execute the function
if (require.main === module) {
  setupMySQLDatabase()
    .then(() => {
      logger.info('MySQL database setup completed, exiting.');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('MySQL database setup failed:', error);
      process.exit(1);
    });
}

module.exports = setupMySQLDatabase; 