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
const { execSync } = require('child_process');

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

// Execute npm script
function runNpmScript(script) {
  try {
    logger.info(`Running npm script: ${script}`);
    execSync(`npm run ${script}`, { stdio: 'inherit' });
    logger.info(`Successfully completed: ${script}`);
    return true;
  } catch (error) {
    logger.error(`Error running npm script ${script}:`, error.message);
    return false;
  }
}

// Setup SQLite database
async function setupSQLiteDatabase() {
  try {
    await executeCommand('npm run setup-sqlite');
    logger.info('SQLite database setup completed successfully');
    return true;
  } catch (error) {
    logger.error('Error setting up SQLite database:', error);
    throw error;
  }
}

// Setup MySQL database
async function setupMySQLDatabase() {
  try {
    await executeCommand('npm run setup-mysql-db');
    logger.info('MySQL database setup completed successfully');
    return true;
  } catch (error) {
    logger.error('Error setting up MySQL database:', error);
    throw error;
  }
}

// Switch to SQLite configuration
function switchToSQLite(shouldSetupDb = false) {
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
  
  if (shouldSetupDb) {
    setupSQLiteDatabase();
  }
}

// Switch to MySQL configuration
function switchToMySQL(options = {}, shouldSetupDb = false) {
  const env = loadEnvFile();
  
  // Get MySQL configuration from user if not already set
  const dbHost = options.host || env.DB_HOST || 'localhost';
  const dbPort = options.port || env.DB_PORT || '3306';
  const dbUsername = options.username || env.DB_USERNAME || 'root';
  const dbPassword = options.password || env.DB_PASSWORD || '';
  const dbName = options.database || env.DB_DATABASE || 'football_field_db';
  
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
  
  if (shouldSetupDb) {
    setupMySQLDatabase();
  }
}

// Interactive CLI for database switching
function promptDatabaseChoice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== Database Configuration Utility ===\n');
  console.log('This utility will help you configure and set up the database for the Football Field Management System.');
  console.log('You can choose between SQLite (for development) and MySQL (for production or more robust development).\n');

  rl.question('Choose database type:\n1. SQLite (recommended for development)\n2. MySQL\n\nEnter your choice (1 or 2): ', async (answer) => {
    if (answer === '1') {
      // Switch to SQLite
      switchToSQLite();
      
      rl.question('\nDo you want to generate sample data for SQLite? (y/n): ', async (generateData) => {
        if (generateData.toLowerCase() === 'y') {
          console.log('\nGenerating sample data for SQLite...');
          try {
            await setupSQLiteDatabase();
            console.log('\n✅ SQLite database setup completed successfully!');
            console.log('You can now run the application with: npm run dev');
          } catch (error) {
            console.error('\n❌ Error setting up SQLite database');
          }
        } else {
          console.log('\n✅ SQLite configuration saved. To generate sample data later, run:');
          console.log('npm run setup-sqlite');
        }
        rl.close();
        process.exit(0);
      });
    } else if (answer === '2') {
      console.log('\n=== MySQL Configuration ===\n');
      
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
                
                // Switch to MySQL with the provided configuration
                switchToMySQL(dbHost, dbPort, dbUsername, dbPassword, dbDatabase);
                
                rl.question('\nDo you want to setup MySQL database and generate sample data? (y/n): ', async (setupDb) => {
                  if (setupDb.toLowerCase() === 'y') {
                    console.log('\nSetting up MySQL database and generating sample data...');
                    try {
                      await setupMySQLDatabase();
                      console.log('\n✅ MySQL database setup completed successfully!');
                      console.log('You can now run the application with: npm run dev');
                    } catch (error) {
                      console.error('\n❌ Error setting up MySQL database');
                      console.log('Make sure MySQL is running and the credentials are correct.');
                      console.log('You can try setting up the database manually by running:');
                      console.log('npm run setup-mysql-db');
                    }
                  } else {
                    console.log('\n✅ MySQL configuration saved. To set up the database later, run:');
                    console.log('npm run setup-mysql-db');
                  }
                  rl.close();
                  process.exit(0);
                });
              });
            });
          });
        });
      });
    } else {
      console.error('\n❌ Invalid choice. Please run the script again and select 1 or 2.');
      rl.close();
      process.exit(1);
    }
  });
}

// Execute based on command line arguments
if (require.main === module) {
  const arg = process.argv[2];
  const shouldSetupDb = process.argv.includes('--setup');
  
  if (arg === 'sqlite') {
    switchToSQLite(shouldSetupDb);
    if (!shouldSetupDb) {
      console.log("\nTo generate sample data, run:");
      console.log("npm run setup-sqlite");
    }
  } else if (arg === 'mysql') {
    // Check for MySQL options
    const options = {};
    process.argv.forEach(arg => {
      if (arg.startsWith('--host=')) options.host = arg.split('=')[1];
      if (arg.startsWith('--port=')) options.port = arg.split('=')[1];
      if (arg.startsWith('--username=')) options.username = arg.split('=')[1];
      if (arg.startsWith('--password=')) options.password = arg.split('=')[1];
      if (arg.startsWith('--database=')) options.database = arg.split('=')[1];
    });
    
    switchToMySQL(options, shouldSetupDb);
    if (!shouldSetupDb) {
      console.log("\nTo set up the MySQL database, run:");
      console.log("npm run setup-mysql-db");
    }
  } else {
    promptDatabaseChoice();
  }
}

module.exports = {
  switchToSQLite,
  switchToMySQL,
  setupSQLiteDatabase,
  setupMySQLDatabase
}; 