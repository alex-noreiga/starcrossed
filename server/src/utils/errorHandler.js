/**
 * Custom API Error class for handling errors with status codes
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // If it's an ApiError, send the appropriate status code and message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }
  
  // For validation errors (from express-validator)
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.array()
    });
  }
  
  // For unexpected errors, hide details in production
  const isDev = process.env.NODE_ENV === 'development';
  
  return res.status(500).json({
    error: isDev ? err.message : 'Internal Server Error',
    ...(isDev && { stack: err.stack })
  });
};

module.exports = {
  ApiError,
  errorHandler
};
