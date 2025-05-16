require('dotenv').config();
const { createTables } = require('./createTables');

// Run migrations
const runMigrations = async () => {
  try {
    console.log('Running migrations...');
    
    await createTables();
    
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migrations immediately
runMigrations();
