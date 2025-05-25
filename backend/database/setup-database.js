/**
 * Football Field Management System - Enhanced Database Setup Script
 * 
 * This script provides comprehensive database management:
 * - Initialize database (create + seed)
 * - Reset database (drop + recreate + seed)
 * - Seed data only
 * - Check database status
 * 
 * Usage:
 * node setup-database.js [command]
 * 
 * Commands:
 * - init: Initialize database (default)
 * - reset: Reset database completely
 * - seed: Seed data only
 * - status: Check database status
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
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
 * Print colored header
 */
function printHeader(title) {
  console.log(`\n${colors.cyan}${colors.bright}========================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}  ${title}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}========================================${colors.reset}\n`);
}

/**
 * Print database configuration
 */
function printDbConfig() {
  console.log(`${colors.yellow}Database Configuration:${colors.reset}`);
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Password: ${dbConfig.password ? '[PROVIDED]' : '[NOT SET]'}`);
  console.log(`Database: FootballField\n`);
}

/**
 * Execute an SQL file
 */
async function executeSqlFile(connection, filePath, description) {
  try {
    console.log(`${colors.blue}${colors.bright}Executing ${description}...${colors.reset}`);
    
    const sqlScript = fs.readFileSync(filePath, 'utf8');
    await connection.query(sqlScript);
    
    console.log(`${colors.green}✓ ${description} executed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}✗ Error executing ${description}:${colors.reset}`, error.message);
    return false;
  }
}

/**
 * Check if database exists
 */
async function checkDatabaseExists(connection) {
  try {
    const [rows] = await connection.query("SHOW DATABASES LIKE 'FootballField'");
    return rows.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Check if tables exist and have data
 */
async function checkDatabaseStatus(connection) {
  try {
    await connection.query('USE FootballField');
    
    const tables = ['Admin', 'Fields', 'TimeSlots', 'Bookings', 'Opponents', 'Feedback'];
    const status = {};
    
    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        status[table] = rows[0].count;
      } catch (error) {
        status[table] = 'NOT_EXISTS';
      }
    }
    
    return status;
  } catch (error) {
    return null;
  }
}

/**
 * Mark database as initialized
 */
function markDatabaseInitialized() {
  const timestamp = new Date().toISOString();
  fs.writeFileSync(DB_FLAG_FILE, `Database initialized at: ${timestamp}`);
}

/**
 * Remove initialization flag
 */
function removeInitializationFlag() {
  if (fs.existsSync(DB_FLAG_FILE)) {
    fs.unlinkSync(DB_FLAG_FILE);
  }
}

/**
 * Check if database has been initialized
 */
function isDatabaseInitialized() {
  return fs.existsSync(DB_FLAG_FILE);
}

/**
 * Initialize database
 */
async function initializeDatabase(force = false) {
  printHeader('Football Field Database Initialization');
  
  if (!force && isDatabaseInitialized()) {
    console.log(`${colors.yellow}Database has already been initialized.${colors.reset}`);
    console.log(`${colors.yellow}Use 'reset' command to reinitialize or 'status' to check current state.${colors.reset}\n`);
    return true;
  }
  
  if (!fs.existsSync(CREATE_DB_SCRIPT) || !fs.existsSync(SEED_DATA_SCRIPT)) {
    console.error(`${colors.red}${colors.bright}Error: Required SQL files not found!${colors.reset}\n`);
    return false;
  }
  
  printDbConfig();
  
  let connection;
  try {
    console.log(`${colors.blue}Connecting to MySQL server...${colors.reset}`);
    connection = await mysql.createConnection(dbConfig);
    console.log(`${colors.green}✓ Connected to MySQL server${colors.reset}\n`);
    
    // Execute schema creation
    const schemaCreated = await executeSqlFile(connection, CREATE_DB_SCRIPT, 'database schema creation');
    if (!schemaCreated) throw new Error('Failed to create database schema');
    
    console.log('');
    
    // Execute data seeding
    const dataSeeded = await executeSqlFile(connection, SEED_DATA_SCRIPT, 'sample data insertion');
    if (!dataSeeded) throw new Error('Failed to seed database with sample data');
    
    markDatabaseInitialized();
    
    console.log(`\n${colors.green}${colors.bright}✓ Database initialization completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Database initialization failed:${colors.reset}`, error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log(`\n${colors.blue}Connection closed${colors.reset}`);
    }
  }
}

/**
 * Reset database completely
 */
async function resetDatabase() {
  printHeader('Football Field Database Reset');
  
  console.log(`${colors.magenta}${colors.bright}WARNING: This will completely destroy and recreate the database!${colors.reset}`);
  console.log(`${colors.magenta}All existing data will be lost!${colors.reset}\n`);
  
  removeInitializationFlag();
  return await initializeDatabase(true);
}

/**
 * Seed data only
 */
async function seedDataOnly() {
  printHeader('Football Field Database - Seed Data Only');
  
  if (!fs.existsSync(SEED_DATA_SCRIPT)) {
    console.error(`${colors.red}${colors.bright}Error: Seed data script not found!${colors.reset}\n`);
    return false;
  }
  
  printDbConfig();
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`${colors.green}✓ Connected to MySQL server${colors.reset}\n`);
    
    const dbExists = await checkDatabaseExists(connection);
    if (!dbExists) {
      console.error(`${colors.red}Database 'FootballField' does not exist. Run 'init' command first.${colors.reset}\n`);
      return false;
    }
    
    const dataSeeded = await executeSqlFile(connection, SEED_DATA_SCRIPT, 'sample data insertion');
    if (!dataSeeded) throw new Error('Failed to seed database');
    
    console.log(`\n${colors.green}${colors.bright}✓ Data seeding completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Data seeding failed:${colors.reset}`, error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Check database status
 */
async function checkStatus() {
  printHeader('Football Field Database Status');
  
  printDbConfig();
  
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`${colors.green}✓ Connected to MySQL server${colors.reset}\n`);
    
    const dbExists = await checkDatabaseExists(connection);
    console.log(`Database exists: ${dbExists ? colors.green + '✓ YES' + colors.reset : colors.red + '✗ NO' + colors.reset}`);
    
    if (dbExists) {
      const status = await checkDatabaseStatus(connection);
      if (status) {
        console.log(`\n${colors.yellow}Table Status:${colors.reset}`);
        Object.entries(status).forEach(([table, count]) => {
          const statusText = count === 'NOT_EXISTS' 
            ? `${colors.red}NOT EXISTS${colors.reset}`
            : `${colors.green}${count} records${colors.reset}`;
          console.log(`  ${table}: ${statusText}`);
        });
      }
    }
    
    const isInitialized = isDatabaseInitialized();
    console.log(`\nInitialization flag: ${isInitialized ? colors.green + '✓ SET' + colors.reset : colors.yellow + '✗ NOT SET' + colors.reset}`);
    
    if (isInitialized) {
      const flagContent = fs.readFileSync(DB_FLAG_FILE, 'utf8');
      console.log(`${colors.dim}${flagContent}${colors.reset}`);
    }
    
    return true;
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}✗ Status check failed:${colors.reset}`, error.message);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2] || 'init';
  
  let success = false;
  
  switch (command.toLowerCase()) {
    case 'init':
      success = await initializeDatabase();
      break;
    case 'reset':
      success = await resetDatabase();
      break;
    case 'seed':
      success = await seedDataOnly();
      break;
    case 'status':
      success = await checkStatus();
      break;
    default:
      console.log(`${colors.red}Unknown command: ${command}${colors.reset}`);
      console.log(`${colors.yellow}Available commands: init, reset, seed, status${colors.reset}\n`);
      process.exit(1);
  }
  
  if (success) {
    console.log(`\n${colors.green}${colors.bright}Operation completed successfully!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}${colors.bright}Operation failed!${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the script
main().catch(err => {
  console.error(`\n${colors.red}${colors.bright}Unexpected error:${colors.reset}`, err);
  process.exit(1);
});
