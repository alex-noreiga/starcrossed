const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/errorHandler');
const emailService = require('../services/email/emailService');
const socialAuthService = require('../services/auth/socialAuthService');

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
    
    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.verification_token);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false
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
        name: user.name,
        emailVerified: user.email_verified
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
    
    // Get user's connected social logins
    const socialLogins = await userModel.getUserSocialLogins(userId);
    
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio || '',
      profileImage: user.profile_image || '',
      emailVerified: user.email_verified,
      createdAt: user.created_at,
      socialLogins
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify email with token
 */
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      throw new ApiError(400, 'Verification token is required');
    }
    
    const result = await userModel.verifyEmail(token);
    
    res.status(200).json({
      message: 'Email verified successfully',
      emailVerified: true
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset
 */
const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }
    
    const result = await userModel.createPasswordResetToken(email);
    
    // If a valid email was provided, send the reset email
    if (result.resetToken) {
      await emailService.sendPasswordResetEmail(result.email, result.resetToken);
    }
    
    // For security, always return the same message regardless of whether
    // the email exists in our system or not
    res.status(200).json({ message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      throw new ApiError(400, 'Token and new password are required');
    }
    
    if (password.length < 8) {
      throw new ApiError(400, 'Password must be at least 8 characters long');
    }
    
    const result = await userModel.resetPassword(token, password);
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio, profileImage } = req.body;
    
    const updatedUser = await userModel.updateProfile(userId, {
      name,
      bio,
      profileImage
    });
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        bio: updatedUser.bio || '',
        profileImage: updatedUser.profile_image || '',
        emailVerified: updatedUser.email_verified,
        createdAt: updatedUser.created_at
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    }
    
    if (newPassword.length < 8) {
      throw new ApiError(400, 'New password must be at least 8 characters long');
    }
    
    const result = await userModel.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({ message: result.message });
  } catch (error) {
    next(error);
  }
};

/**
 * Google OAuth login
 */
const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw new ApiError(400, 'Google token is required');
    }
    
    // Verify Google token and get user info
    const googleUser = await socialAuthService.verifyGoogleToken(token);
    
    // Create or link social login
    const user = await userModel.createSocialLogin({
      email: googleUser.email,
      name: googleUser.name,
      provider: 'google',
      providerId: googleUser.providerId
    });
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      message: 'Google login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: jwtToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Facebook OAuth login
 */
const facebookLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      throw new ApiError(400, 'Facebook token is required');
    }
    
    // Verify Facebook token and get user info
    const facebookUser = await socialAuthService.verifyFacebookToken(token);
    
    // Create or link social login
    const user = await userModel.createSocialLogin({
      email: facebookUser.email,
      name: facebookUser.name,
      provider: 'facebook',
      providerId: facebookUser.providerId
    });
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      message: 'Facebook login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token: jwtToken
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  changePassword,
  googleLogin,
  facebookLogin
};
