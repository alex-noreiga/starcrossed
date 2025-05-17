const express = require('express');
const router = express.Router();
const progressionController = require('../controllers/progressionController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Secondary progressions
router.post('/secondary-progressions', progressionController.calculateSecondaryProgressions);

// Solar arc directions
router.post('/solar-arc', progressionController.calculateSolarArcDirections);

// Solar return
router.post('/solar-return', progressionController.calculateSolarReturn);

// Lunar phase analysis
router.post('/lunar-phase', progressionController.calculateLunarPhaseAnalysis);

// Composite chart
router.post('/composite', progressionController.calculateCompositeChart);

module.exports = router;
