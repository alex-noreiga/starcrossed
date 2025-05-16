const db = require('../src/utils/db');

const createTables = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL
      );
    `);
    
    // Create charts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS charts (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        birth_date DATE NOT NULL,
        birth_time TIME NOT NULL,
        birth_place VARCHAR(255) NOT NULL,
        chart_data JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL
      );
    `);
    
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = {
  createTables
};
