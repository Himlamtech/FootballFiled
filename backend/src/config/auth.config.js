module.exports = {
  // JWT secret key for signing tokens
  SECRET: process.env.JWT_SECRET || "football-field-secret-key",
  
  // JWT token expiration times
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || "2h", // 2 hours
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || "7d", // 7 days
  
  // Password hashing
  SALT_ROUNDS: 10,
  
  // User roles
  ROLES: ["user", "admin"],
  
  // Cookie options for refresh token
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
}; 