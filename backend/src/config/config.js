const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 5000;
const host = process.env.HOST || 'localhost';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const sqliteConfig = {
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../data/football_field_db.sqlite'),
  logging: console.log,
  sync: true,
  syncAlter: true,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

const mysqlConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'football_field_db',
  dialect: 'mysql',
  logging: env === 'development',
  sync: process.env.DB_SYNC === 'true' || true,
  syncAlter: process.env.DB_SYNC_ALTER === 'true' || true,
  pool: {
    max: 20,
    min: 0,
    acquire: 60000,
    idle: 10000
  }
};

// Use MySQL for both development and production
// const dbConfig = env === 'development' ? sqliteConfig : mysqlConfig;
const dbConfig = process.env.DB_DIALECT === 'sqlite' ? sqliteConfig : mysqlConfig;

const config = {
  env,
  port,
  host,
  corsOrigin,
  jwtSecret: process.env.JWT_SECRET || 'football_field_jwt_secret_key_2023',
  jwtAccessExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  jwtResetPasswordExpiration: process.env.JWT_RESET_PASSWORD_EXPIRATION || '10m',

  db: dbConfig,

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  },

  upload: {
    // Directory for file uploads, relative to project root
    directory: process.env.UPLOAD_DIR || 'uploads',
    // Maximum file size in bytes (default: 5MB)
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE, 10) || 5 * 1024 * 1024,
    // Allowed file types (comma-separated)
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'jpg,jpeg,png,gif').split(',')
  }
};

module.exports = config;