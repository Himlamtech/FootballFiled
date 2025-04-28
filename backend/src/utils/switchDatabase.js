/**
 * Database Switcher Utility
 * 
 * This script helps switch between SQLite and MySQL configurations
 * by updating the .env file with appropriate settings.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');
const logger = require('./logger');

// Path to .env file
const envPath = path.join(__dirname, '../../.env');

// Default content for .env file
const defaultEnvContent = `# Environment
NODE_ENV=development
PORT=5000
HOST=localhost
CORS_ORIGIN=http://localhost:3000

# Database - Common
DB_SYNC=true
DB_SYNC_ALTER=true

# Database - SQLite Configuration (Default)
DB_DIALECT=sqlite
DB_STORAGE=data/football_field_db.sqlite

# JWT settings
JWT_SECRET=football_field_jwt_secret_key_2023
JWT_ACCESS_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d
JWT_RESET_PASSWORD_EXPIRATION=10m

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# File uploads
UPLOAD_DIR=uploads
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif`;

// Format .env file content with categories and comments
function formatEnvContent(envVars) {
  const categories = {
    environment: ['NODE_ENV', 'PORT', 'HOST', 'CORS_ORIGIN'],
    database: [
      'DB_DIALECT', 'DB_STORAGE', 'DB_HOST', 'DB_PORT', 
      'DB_USERNAME', 'DB_PASSWORD', 'DB_DATABASE', 
      'DB_SYNC', 'DB_SYNC_ALTER'
    ],
    jwt: ['JWT_SECRET', 'JWT_ACCESS_EXPIRATION', 'JWT_REFRESH_EXPIRATION', 'JWT_RESET_PASSWORD_EXPIRATION'],
    logging: ['LOG_LEVEL', 'LOG_FORMAT'],
    uploads: ['UPLOAD_DIR', 'UPLOAD_MAX_SIZE', 'UPLOAD_ALLOWED_TYPES']
  };
  
  let content = '';
  
  // Environment section
  content += '# Environment\n';
  for (const key of categories.environment) {
    if (envVars[key]) {
      content += `${key}=${envVars[key]}\n`;
    }
  }
  content += '\n';
  
  // Database section
  content += '# Database\n';
  for (const key of categories.database) {
    if (envVars[key]) {
      content += `${key}=${envVars[key]}\n`;
    }
  }
  content += '\n';
  
  // JWT section
  content += '# JWT settings\n';
  for (const key of categories.jwt) {
    if (envVars[key]) {
      content += `${key}=${envVars[key]}\n`;
    }
  }
  content += '\n';
  
  // Logging section
  content += '# Logging\n';
  for (const key of categories.logging) {
    if (envVars[key]) {
      content += `${key}=${envVars[key]}\n`;
    }
  }
  content += '\n';
  
  // Uploads section
  content += '# File uploads\n';
  for (const key of categories.uploads) {
    if (envVars[key]) {
      content += `${key}=${envVars[key]}\n`;
    }
  }
  
  // Add any other variables not in predefined categories
  const definedKeys = Object.values(categories).flat();
  const otherKeys = Object.keys(envVars).filter(key => !definedKeys.includes(key));
  
  if (otherKeys.length > 0) {
    content += '\n# Other\n';
    for (const key of otherKeys) {
      content += `${key}=${envVars[key]}\n`;
    }
  }
  
  return content;
}

// Load current .env file
function loadEnvFile() {
  try {
    if (fs.existsSync(envPath)) {
      return dotenv.parse(fs.readFileSync(envPath));
    }
    // Create default .env file if it doesn't exist
    fs.writeFileSync(envPath, defaultEnvContent);
    logger.info('Created default .env file');
    return dotenv.parse(defaultEnvContent);
  } catch (error) {
    logger.error('Error loading .env file:', error);
    return {};
  }
}

// Save updated environment variables to .env file
function saveEnvFile(envVars) {
  try {
    const content = formatEnvContent(envVars);
    fs.writeFileSync(envPath, content);
    logger.info('.env file updated successfully');
  } catch (error) {
    logger.error('Error saving .env file:', error);
    throw error;
  }
}

// Switch to SQLite configuration
function switchToSQLite() {
  const env = loadEnvFile();
  
  // Update environment variables for SQLite
  const updatedEnv = {
    ...env,
    NODE_ENV: 'development',
    DB_DIALECT: 'sqlite',
    DB_STORAGE: path.join(__dirname, '../../data/football_field_db.sqlite').replace(/\\/g, '/'),
    DB_SYNC: 'true',
    DB_SYNC_ALTER: 'true'
  };
  
  // Remove MySQL specific variables to use defaults from config
  delete updatedEnv.DB_HOST;
  delete updatedEnv.DB_PORT;
  delete updatedEnv.DB_USERNAME;
  delete updatedEnv.DB_PASSWORD;
  delete updatedEnv.DB_DATABASE;
  
  saveEnvFile(updatedEnv);
  logger.info('Switched to SQLite configuration');
}

// Switch to MySQL configuration
function switchToMySQL() {
  const env = loadEnvFile();
  
  // Get MySQL configuration from user if not already set
  let dbHost = env.DB_HOST || 'localhost';
  let dbPort = env.DB_PORT || '3306';
  let dbUsername = env.DB_USERNAME || 'root';
  let dbPassword = env.DB_PASSWORD || '';
  let dbName = env.DB_DATABASE || 'football_field_db';
  
  // Update environment variables for MySQL
  const updatedEnv = {
    ...env,
    NODE_ENV: 'development', // Keep in development mode but use MySQL
    DB_DIALECT: 'mysql',
    DB_HOST: dbHost,
    DB_PORT: dbPort,
    DB_USERNAME: dbUsername,
    DB_PASSWORD: dbPassword,
    DB_DATABASE: dbName,
    DB_SYNC: 'true',
    DB_SYNC_ALTER: 'true'
  };
  
  // Remove SQLite specific variables
  delete updatedEnv.DB_STORAGE;
  
  saveEnvFile(updatedEnv);
  logger.info('Switched to MySQL configuration');
}

// Interactive CLI for database switching
function promptDatabaseChoice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Choose database (1 for SQLite, 2 for MySQL): ', (answer) => {
    if (answer === '1') {
      switchToSQLite();
      rl.question('Do you want to generate sample data for SQLite? (y/n): ', (generateData) => {
        if (generateData.toLowerCase() === 'y') {
          logger.info('Please run "npm run setup-sqlite" to generate sample data');
        }
        rl.close();
      });
    } else if (answer === '2') {
      rl.question('Enter MySQL host (default: localhost): ', (host) => {
        const dbHost = host || 'localhost';
        
        rl.question('Enter MySQL port (default: 3306): ', (port) => {
          const dbPort = port || '3306';
          
          rl.question('Enter MySQL username (default: root): ', (username) => {
            const dbUsername = username || 'root';
            
            rl.question('Enter MySQL password (default: ""): ', (password) => {
              const dbPassword = password || '';
              
              rl.question('Enter MySQL database name (default: football_field_db): ', (dbName) => {
                const dbDatabase = dbName || 'football_field_db';
                
                // Update env variables for MySQL
                const env = loadEnvFile();
                const updatedEnv = {
                  ...env,
                  NODE_ENV: 'development',
                  DB_DIALECT: 'mysql',
                  DB_HOST: dbHost,
                  DB_PORT: dbPort,
                  DB_USERNAME: dbUsername,
                  DB_PASSWORD: dbPassword,
                  DB_DATABASE: dbDatabase,
                  DB_SYNC: 'true',
                  DB_SYNC_ALTER: 'true'
                };
                
                // Remove SQLite specific variables
                delete updatedEnv.DB_STORAGE;
                
                saveEnvFile(updatedEnv);
                logger.info('Switched to MySQL configuration');
                
                rl.question('Do you want to setup MySQL database and generate sample data? (y/n): ', (setupDb) => {
                  if (setupDb.toLowerCase() === 'y') {
                    logger.info('Please run "npm run setup-mysql-db" to create database and generate sample data');
                  }
                  rl.close();
                });
              });
            });
          });
        });
      });
    } else {
      logger.error('Invalid choice. Please run the script again and select 1 or 2.');
      rl.close();
    }
  });
}

// Execute based on command line arguments
if (require.main === module) {
  const arg = process.argv[2];
  
  if (arg === 'sqlite') {
    switchToSQLite();
  } else if (arg === 'mysql') {
    switchToMySQL();
  } else {
    promptDatabaseChoice();
  }
}

module.exports = {
  switchToSQLite,
  switchToMySQL
}; 