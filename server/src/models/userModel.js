const db = require('../utils/db');
const { ApiError } = require('../utils/errorHandler');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const createUser = async (userData) => {
  const { email, password, name } = userData;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  try {
    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      throw new ApiError(409, 'User with this email already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert user
    const result = await db.query(
      `INSERT INTO users (id, email, password_hash, name, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, name, created_at`,
      [id, email, passwordHash, name, createdAt]
    );
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error creating user:', error);
    throw new ApiError(500, 'Failed to create user');
  }
};

const getUserByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new ApiError(500, 'Failed to get user');
  }
};

const getUserById = async (userId) => {
  try {
    const result = await db.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(404, 'User not found');
    }
    
    return result.rows[0];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error getting user by ID:', error);
    throw new ApiError(500, 'Failed to get user');
  }
};

const validatePassword = async (user, password) => {
  try {
    return await bcrypt.compare(password, user.password_hash);
  } catch (error) {
    console.error('Error validating password:', error);
    throw new ApiError(500, 'Password validation failed');
  }
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  validatePassword
};
