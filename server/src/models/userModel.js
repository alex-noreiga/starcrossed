const db = require('../utils/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { ApiError } = require('../utils/errorHandler');

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
    
    // Insert user into database
    const result = await db.query(
      `INSERT INTO users (id, email, password_hash, name, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, created_at`,
      [id, email.toLowerCase(), passwordHash, name, createdAt]
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

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  validatePassword
};
