const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const chartRoutes = require('./chartRoutes');

// Mount sub-routes
router.use('/auth', authRoutes);
router.use('/charts', chartRoutes);

// API health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running'
  });
});

module.exports = router;
