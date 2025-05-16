require('dotenv').config();
const express = require('express');
const cors = require('cors');
const chartRoutes = require('./routes/chartRoutes');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./utils/errorHandler');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/charts', chartRoutes);
app.use('/api/auth', authRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Starcrossed API' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
