/**
 * Database Update Script
 * 
 * This script updates the database schema by adding new columns to existing tables.
 * It's designed to be run when the database schema needs to be updated without
 * recreating the entire database.
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Himlam04@',
  database: process.env.DB_NAME || 'FootballField',
  multipleStatements: true
};

async function updateDatabase() {
  console.log('Starting database update...');
  console.log('Database configuration:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`Port: ${dbConfig.port}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);

  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    // Add new columns to Bookings table if they don't exist
    console.log('Updating Bookings table...');

    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Bookings'
    `, [dbConfig.database]);

    const columnNames = columns.map(col => col.COLUMN_NAME);

    // Add customerName column if it doesn't exist
    if (!columnNames.includes('customerName')) {
      console.log('Adding customerName column...');
      await connection.query(`
        ALTER TABLE Bookings
        ADD COLUMN customerName VARCHAR(100) NULL
      `);
    }

    // Add customerPhone column if it doesn't exist
    if (!columnNames.includes('customerPhone')) {
      console.log('Adding customerPhone column...');
      await connection.query(`
        ALTER TABLE Bookings
        ADD COLUMN customerPhone VARCHAR(20) NULL
      `);
    }

    // Add customerEmail column if it doesn't exist
    if (!columnNames.includes('customerEmail')) {
      console.log('Adding customerEmail column...');
      await connection.query(`
        ALTER TABLE Bookings
        ADD COLUMN customerEmail VARCHAR(100) NULL
      `);
    }

    // Add notes column if it doesn't exist
    if (!columnNames.includes('notes')) {
      console.log('Adding notes column...');
      await connection.query(`
        ALTER TABLE Bookings
        ADD COLUMN notes TEXT NULL
      `);
    }

    // Add paymentMethod column if it doesn't exist
    if (!columnNames.includes('paymentMethod')) {
      console.log('Adding paymentMethod column...');
      await connection.query(`
        ALTER TABLE Bookings
        ADD COLUMN paymentMethod VARCHAR(50) DEFAULT 'vietqr' NULL
      `);
    }

    console.log('Database update completed successfully!');

    // Close connection
    await connection.end();
    console.log('Connection closed');

    return true;
  } catch (error) {
    console.error('Error updating database:', error);
    return false;
  }
}

// Run the update function
updateDatabase()
  .then(success => {
    if (success) {
      console.log('Database update script completed successfully');
      process.exit(0);
    } else {
      console.error('Database update script failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
