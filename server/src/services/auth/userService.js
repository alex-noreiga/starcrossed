const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../../utils/errorHandler');

/**
 * Get user by ID
 * 
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to retrieve user');
  }
};

/**
 * Get user by username
 * 
 * @param {string} username - Username
 * @returns {Object} User data
 */
const getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({ username });
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error getting user by username:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to retrieve user');
  }
};

/**
 * Update user profile
 * 
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Object} Updated user data
 */
const updateUserProfile = async (userId, profileData) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Update user fields
    if (profileData.hasOwnProperty('isPublic')) {
      user.isPublic = profileData.isPublic;
    }
    
    if (profileData.bio) {
      user.bio = profileData.bio;
    }
    
    if (profileData.professionalTitle) {
      user.professionalTitle = profileData.professionalTitle;
    }
    
    if (profileData.location) {
      user.location = profileData.location;
    }
    
    if (profileData.socialLinks) {
      user.socialLinks = profileData.socialLinks;
    }
    
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to update user profile');
  }
};

/**
 * Get user profiles with filters
 * 
 * @param {Object} filter - Query filter
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 * @returns {Object} Paginated user profiles
 */
const getUserProfiles = async (filter = {}, page = 1, limit = 10) => {
  try {
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Get users with filter and pagination
    const users = await User.find(filter)
      .select('username name bio professionalTitle location socialLinks')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    return {
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting user profiles:', error);
    throw new ApiError(500, 'Failed to retrieve user profiles');
  }
};

/**
 * Create a new user
 * 
 * @param {Object} userData - User data
 * @returns {Object} Created user
 */
const createUser = async (userData) => {
  try {
    const { username, email, password, name } = userData;
    
    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    
    if (existingUsername) {
      throw new ApiError(409, 'Username already taken');
    }
    
    // Check if email is taken
    const existingEmail = await User.findOne({ email });
    
    if (existingEmail) {
      throw new ApiError(409, 'Email already in use');
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      name
    });
    
    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    
    // Save user
    await user.save();
    
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name
      },
      verificationToken
    };
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to create user');
  }
};

/**
 * Authenticate user
 * 
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} Authentication data with token
 */
const authenticateUser = async (email, password) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      throw new ApiError(401, 'Email not verified');
    }
    
    // Update last login time
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Authentication failed');
  }
};

/**
 * Verify user email
 * 
 * @param {string} token - Verification token
 * @returns {Object} Verification result
 */
const verifyEmail = async (token) => {
  try {
    // Find user with this token and not expired
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }
    
    // Mark email as verified and clear token
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    
    await user.save();
    
    return {
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to verify email');
  }
};

/**
 * Request password reset
 * 
 * @param {string} email - User email
 * @returns {Object} Reset token data
 */
const requestPasswordReset = async (email) => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      // For security, don't reveal if email exists
      return {
        message: 'If your email is registered, you will receive a password reset link shortly'
      };
    }
    
    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    
    // Save user with token
    await user.save();
    
    return {
      message: 'Password reset link sent successfully',
      resetToken,
      email: user.email
    };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    throw new ApiError(500, 'Failed to request password reset');
  }
};

/**
 * Reset password with token
 * 
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Object} Reset result
 */
const resetPassword = async (token, newPassword) => {
  try {
    // Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with this token and not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
    
    // Set new password and clear token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;
    
    await user.save();
    
    return {
      message: 'Password reset successful'
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to reset password');
  }
};

/**
 * Change user password
 * 
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} Change result
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    
    // Set new password
    user.password = newPassword;
    
    await user.save();
    
    return {
      message: 'Password changed successfully'
    };
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to change password');
  }
};

module.exports = {
  getUserById,
  getUserByUsername,
  updateUserProfile,
  getUserProfiles,
  createUser,
  authenticateUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword
};
