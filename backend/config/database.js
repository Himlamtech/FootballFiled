const { Sequelize } = require('sequelize');
// Note: dotenv is already configured in server.js

// Log database connection parameters for debugging
console.log('Database connection parameters:');
console.log(`DB_NAME: ${process.env.DB_NAME || 'FootballField'}`);
console.log(`DB_USER: ${process.env.DB_USER || 'root'}`);
console.log(`DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
console.log(`DB_PORT: ${process.env.DB_PORT || 3306}`);
// Don't log the actual password for security reasons
console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '[PROVIDED]' : '[DEFAULT]'}`);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'FootballField',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Himlam04@',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

// Test connection function
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };