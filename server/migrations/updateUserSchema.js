const db = require('../src/utils/db');

const updateUserSchema = async () => {
  try {
    // Add new columns to users table
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reset_password_token VARCHAR(255),
      ADD COLUMN IF NOT EXISTS reset_password_token_expires TIMESTAMP,
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bio TEXT;
    `);

    // Create social logins table
    await db.query(`
      CREATE TABLE IF NOT EXISTS social_logins (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL,
        UNIQUE(provider, provider_id)
      );
    `);
    
    console.log('User schema updated successfully');
  } catch (error) {
    console.error('Error updating user schema:', error);
    throw error;
  }
};

module.exports = {
  updateUserSchema
};
