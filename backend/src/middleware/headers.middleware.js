/**
 * Middleware to set proper HTTP headers for all responses
 */
const setHeaders = (req, res, next) => {
  // Set proper content-type header
  res.setHeader('Content-Type', 'application/json');
  
  // Set proper cache-control header
  res.setHeader('Cache-Control', 'private, max-age=300');
  
  // Remove deprecated Pragma header
  res.removeHeader('Pragma');
  
  // Remove unneeded security headers
  res.removeHeader('X-XSS-Protection');
  res.removeHeader('Content-Security-Policy');
  
  // Continue to the next middleware
  next();
};

/**
 * Middleware to set secure cookie options
 */
const setSecureCookies = (req, res, next) => {
  // Get the original cookie setter
  const originalSetCookie = res.cookie;
  
  // Override the cookie setter to add secure flag
  res.cookie = function(name, value, options) {
    // Add secure flag to all cookies
    const secureOptions = {
      ...options,
      secure: true,
      sameSite: 'strict'
    };
    
    // Call the original cookie setter with secure options
    return originalSetCookie.call(this, name, value, secureOptions);
  };
  
  // Continue to the next middleware
  next();
};

module.exports = {
  setHeaders,
  setSecureCookies
};
