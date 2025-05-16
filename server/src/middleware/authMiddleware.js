const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');
const userModel = require('../models/userModel');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'cosmic-secret-key';

/**
 * Authenticate user by JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await userModel.getUserById(decoded.id);
    
    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }
    
    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional authentication
 * If token is provided, authenticate user, but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without authentication
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await userModel.getUserById(decoded.id);
    
    if (user) {
      // Attach user to request object
      req.user = {
        id: user.id,
        email: user.email
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth
};
