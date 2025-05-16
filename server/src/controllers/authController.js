const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'cosmic-secret-key';

/**
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      throw new ApiError(400, 'Email, password, and name are required');
    }
    
    // Create new user
    const user = await userModel.createUser({ email, password, name });
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }
    
    // Get user by email
    const user = await userModel.getUserByEmail(email);
    
    // Check if user exists
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Validate password
    const isPasswordValid = await userModel.validatePassword(user, password);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await userModel.getUserById(userId);
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.created_at
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserProfile
};
