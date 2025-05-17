const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const chartRoutes = require('./chartRoutes');
const transitRoutes = require('./transitRoutes');
const notificationRoutes = require('./notificationRoutes');
const progressionRoutes = require('./progressionRoutes');
const predictiveToolsRoutes = require('./predictiveToolsRoutes');
const communityRoutes = require('./communityRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/charts', chartRoutes);
router.use('/transits', transitRoutes);
router.use('/notifications', notificationRoutes);
router.use('/progressions', progressionRoutes);
router.use('/predictive', predictiveToolsRoutes);
router.use('/community', communityRoutes);

module.exports = router;
