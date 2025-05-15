/**
 * Football Field Management System - Database Initialization Script
 * 
 * This script initializes the database only once by checking if it already exists
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Himlam04@',
  multipleStatements: true
};

// Script paths
const CREATE_DB_SCRIPT = path.join(__dirname, 'create-database.sql');
const SEED_DATA_SCRIPT = path.join(__dirname, 'seed-data.sql');
const DB_FLAG_FILE = path.join(__dirname, '.db_initialized');

/**
 * Execute an SQL file
 * @param {mysql.Connection} connection - MySQL connection
 * @param {string} filePath - Path to SQL file
 * @param {string} description - Description of the operation
 * @returns {Promise<boolean>} - Success status
 */
async function executeSqlFile(connection, filePath, description) {
  try {
    console.log(`${colors.blue}${colors.bright}Executing ${description}...${colors.reset}`);
    
    // Read SQL file
    const sqlScript = fs.readFileSync(filePath, 'utf8');
    
    // Execute SQL script
    await connection.query(sqlScript);
    
    console.log(`${colors.green}✓ ${description} executed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Error executing ${description}:${colors.reset}`, error);
    return false;
  }
}

/**
 * Check if database has already been initialized
 * @returns {boolean} - True if database has been initialized
 */
function isDatabaseInitialized() {
  return fs.existsSync(DB_FLAG_FILE);
}

/**
 * Mark database as initialized
 */
function markDatabaseInitialized() {
  fs.writeFileSync(DB_FLAG_FILE, new Date().toISOString());
}

/**
 * Initialize the database
 */
async function initializeDatabase() {
  console.log(`\n${colors.cyan}${colors.bright}========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  Football Field Database Initialization${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}========================================${colors.reset}\n`);

  // Check if database has already been initialized
  if (isDatabaseInitialized()) {
    console.log(`${colors.yellow}Database has already been initialized.${colors.reset}`);
    console.log(`${colors.yellow}If you want to reinitialize the database, delete the file:${colors.reset}`);
    console.log(`${colors.yellow}${DB_FLAG_FILE}${colors.reset}`);
    console.log(`${colors.yellow}and run this script again.${colors.reset}\n`);
    return true;
  }

  // Check if SQL files exist
  if (!fs.existsSync(CREATE_DB_SCRIPT)) {
    console.error(`${colors.red}${colors.bright}Error: Database creation script not found:${colors.reset}`);
    console.error(`${colors.red}${CREATE_DB_SCRIPT}${colors.reset}\n`);
    return false;
  }

  if (!fs.existsSync(SEED_DATA_SCRIPT)) {
    console.error(`${colors.red}${colors.bright}Error: Seed data script not found:${colors.reset}`);
    console.error(`${colors.red}${SEED_DATA_SCRIPT}${colors.reset}\n`);
    return false;
  }

  console.log(`${colors.yellow}Database configuration:${colors.reset}`);
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: FootballField\n`);

  let connection;
  
  try {
    // Create connection
    console.log(`${colors.blue}Connecting to MySQL server...${colors.reset}`);
    connection = await mysql.createConnection(dbConfig);
    console.log(`${colors.green}✓ Connected to MySQL server${colors.reset}\n`);

    // Execute create-database.sql
    const schemaCreated = await executeSqlFile(
      connection, 
      CREATE_DB_SCRIPT, 
      'database schema creation'
    );
    
    if (!schemaCreated) {
      throw new Error('Failed to create database schema');
    }
    
    console.log(''); // Empty line for better readability
    
    // Execute seed-data.sql
    const dataSeeded = await executeSqlFile(
      connection, 
      SEED_DATA_SCRIPT, 
      'sample data insertion'
    );
    
    if (!dataSeeded) {
      throw new Error('Failed to seed database with sample data');
    }

    // Mark database as initialized
    markDatabaseInitialized();

    console.log(`\n${colors.green}${colors.bright}✓ Database initialization completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Database initialization failed:${colors.reset}`, error.message);
    return false;
  } finally {
    // Close connection if it was established
    if (connection) {
      console.log(`\n${colors.blue}Closing database connection...${colors.reset}`);
      await connection.end();
      console.log(`${colors.green}✓ Connection closed${colors.reset}`);
    }
  }
}

// Run the initialization
initializeDatabase()
  .then(success => {
    if (success) {
      console.log(`\n${colors.green}${colors.bright}Database setup completed successfully!${colors.reset}`);
      console.log(`${colors.cyan}You can now start the backend server.${colors.reset}\n`);
      process.exit(0);
    } else {
      console.error(`\n${colors.red}${colors.bright}Database setup failed!${colors.reset}`);
      console.log(`${colors.yellow}Please check the error messages above and try again.${colors.reset}\n`);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error(`\n${colors.red}${colors.bright}Unexpected error:${colors.reset}`, err);
    process.exit(1);
  });
