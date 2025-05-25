const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Generate a JWT token for an admin
 * @param {Object} admin - Admin object with id and role properties
 * @returns {String} JWT token
 */
const generateToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id || admin.adminId,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role || 'admin'
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
};

/**
 * Verify a JWT token
 * @param {String} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};