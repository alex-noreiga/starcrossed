require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./utils/errorHandler');
const swisseph = require('swisseph');
const path = require('path');

// Set up Swiss Ephemeris
const ephePath = process.env.EPHE_PATH || path.join(__dirname, '../ephe');
swisseph.swe_set_ephe_path(ephePath);
console.log(`Swiss Ephemeris path set to: ${ephePath}`);

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
