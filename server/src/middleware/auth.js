const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'cosmic-secret-key';

/**
 * Middleware to authenticate token
 */
const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization token required');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new ApiError(401, 'Invalid or expired token');
      }
      
      // Set user info in request
      req.user = decoded;
      next();
    });
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
