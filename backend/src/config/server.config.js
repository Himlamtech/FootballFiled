module.exports = {
  PORT: process.env.PORT || 9002,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_VERSION: 'v1',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:9001',
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  FILE_UPLOAD_SIZE_LIMIT: 5 * 1024 * 1024, // 5MB,
  LOGGING_LEVEL: process.env.LOGGING_LEVEL || 'info'
}; 