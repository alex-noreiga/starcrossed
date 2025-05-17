const db = require('../utils/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../utils/errorHandler');
const crypto = require('crypto');

/**
 * Create a new user
 */
const createUser = async (userData) => {
  const { email, password, name } = userData;
  
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      throw new ApiError(409, 'Email already in use');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate UUID
    const id = uuidv4();
    
    // Current timestamp
    const createdAt = new Date().toISOString();
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const verificationTokenExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Insert user into database
    const result = await db.query(
      `INSERT INTO users (
        id, email, password_hash, name, created_at, 
        verification_token, verification_token_expires
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, name, created_at, verification_token`,
      [
        id, 
        email.toLowerCase(), 
        passwordHash, 
        name, 
        createdAt, 
        verificationToken, 
        verificationTokenExpires
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error creating user:', error);
    throw new ApiError(500, 'Failed to create user');
  }
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new ApiError(500, 'Database error');
  }
};

/**
 * Get user by ID
 */
const getUserById = async (id) => {
  try {
    const result = await db.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw new ApiError(500, 'Database error');
  }
};

/**
 * Validate user password
 */
const validatePassword = async (user, password) => {
  return await bcrypt.compare(password, user.password_hash);
};

/**
 * Verify user email
 */
const verifyEmail = async (token) => {
  try {
    const now = new Date();
    
    const result = await db.query(
      `SELECT * FROM users 
       WHERE verification_token = $1 
       AND verification_token_expires > $2
       AND email_verified = FALSE`,
      [token, now]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(400, 'Invalid or expired verification token');
    }
    
    const user = result.rows[0];
    
    // Update user as verified
    await db.query(
      `UPDATE users 
       SET email_verified = TRUE, 
           verification_token = NULL, 
           verification_token_expires = NULL
       WHERE id = $1`,
      [user.id]
    );
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: true
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error verifying email:', error);
    throw new ApiError(500, 'Failed to verify email');
  }
};

/**
 * Generate password reset token
 */
const createPasswordResetToken = async (email) => {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return { message: 'If your email is registered, you will receive a password reset link shortly' };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const resetTokenExpires = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Save reset token to database
    await db.query(
      `UPDATE users 
       SET reset_password_token = $1, 
           reset_password_token_expires = $2
       WHERE id = $3`,
      [resetToken, resetTokenExpires, user.id]
    );
    
    return {
      email: user.email,
      resetToken,
      message: 'If your email is registered, you will receive a password reset link shortly'
    };
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw new ApiError(500, 'Failed to generate reset token');
  }
};

/**
 * Reset password with token
 */
const resetPassword = async (token, newPassword) => {
  try {
    const now = new Date();
    
    const result = await db.query(
      `SELECT * FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_token_expires > $2`,
      [token, now]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
    
    const user = result.rows[0];
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password and clear token
    await db.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_password_token = NULL, 
           reset_password_token_expires = NULL
       WHERE id = $2`,
      [passwordHash, user.id]
    );
    
    return { message: 'Password reset successful' };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error resetting password:', error);
    throw new ApiError(500, 'Failed to reset password');
  }
};

/**
 * Update user profile
 */
const updateProfile = async (userId, profileData) => {
  const { name, bio, profileImage } = profileData;
  const updateFields = [];
  const values = [];
  let paramCounter = 1;
  
  if (name) {
    updateFields.push(`name = $${paramCounter}`);
    values.push(name);
    paramCounter++;
  }
  
  if (bio !== undefined) {
    updateFields.push(`bio = $${paramCounter}`);
    values.push(bio);
    paramCounter++;
  }
  
  if (profileImage !== undefined) {
    updateFields.push(`profile_image = $${paramCounter}`);
    values.push(profileImage);
    paramCounter++;
  }
  
  if (updateFields.length === 0) {
    return await getUserById(userId);
  }
  
  values.push(userId);
  
  try {
    const result = await db.query(
      `UPDATE users 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCounter}
       RETURNING id, email, name, bio, profile_image, email_verified, created_at`,
      values
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error updating profile:', error);
    throw new ApiError(500, 'Failed to update profile');
  }
};

/**
 * Change user password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await getUserById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    // Validate old password
    const isPasswordValid = await validatePassword(user, oldPassword);
    
    if (!isPasswordValid) {
      throw new ApiError(401, 'Current password is incorrect');
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await db.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2`,
      [passwordHash, userId]
    );
    
    return { message: 'Password changed successfully' };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error changing password:', error);
    throw new ApiError(500, 'Failed to change password');
  }
};

/**
 * Create social login
 */
const createSocialLogin = async (userData) => {
  const { email, name, provider, providerId } = userData;
  
  try {
    // Begin transaction
    await db.query('BEGIN');
    
    // Check if social login already exists
    const existingSocialLogin = await db.query(
      `SELECT * FROM social_logins WHERE provider = $1 AND provider_id = $2`,
      [provider, providerId]
    );
    
    if (existingSocialLogin.rows.length > 0) {
      // Get the user linked to this social login
      const userId = existingSocialLogin.rows[0].user_id;
      const user = await getUserById(userId);
      
      await db.query('COMMIT');
      return user;
    }
    
    // Check if user with this email already exists
    let user = await getUserByEmail(email);
    let userId;
    
    // If user doesn't exist, create a new one
    if (!user) {
      // Generate random password for the user (they won't need it)
      const password = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(password, 10);
      
      userId = uuidv4();
      const createdAt = new Date().toISOString();
      
      const result = await db.query(
        `INSERT INTO users (id, email, password_hash, name, created_at, email_verified)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id, email, name, created_at`,
        [userId, email.toLowerCase(), passwordHash, name, createdAt]
      );
      
      user = result.rows[0];
    } else {
      userId = user.id;
    }
    
    // Create social login entry
    const socialLoginId = uuidv4();
    const createdAt = new Date().toISOString();
    
    await db.query(
      `INSERT INTO social_logins (id, user_id, provider, provider_id, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [socialLoginId, userId, provider, providerId, createdAt]
    );
    
    await db.query('COMMIT');
    
    return user;
  } catch (error) {
    await db.query('ROLLBACK');
    
    if (error instanceof ApiError) throw error;
    console.error('Error creating social login:', error);
    throw new ApiError(500, 'Failed to create social login');
  }
};

/**
 * Get user's social logins
 */
const getUserSocialLogins = async (userId) => {
  try {
    const result = await db.query(
      `SELECT provider FROM social_logins WHERE user_id = $1`,
      [userId]
    );
    
    return result.rows.map(row => row.provider);
  } catch (error) {
    console.error('Error getting user social logins:', error);
    throw new ApiError(500, 'Failed to retrieve social logins');
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  validatePassword,
  verifyEmail,
  createPasswordResetToken,
  resetPassword,
  updateProfile,
  changePassword,
  createSocialLogin,
  getUserSocialLogins
};
