/**
 * Wraps async controller functions to catch errors and pass them to Express error middleware
 * @param {Function} fn - Async controller function to wrap
 * @returns {Function} Express middleware function with error handling
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}; 