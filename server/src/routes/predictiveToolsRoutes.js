const express = require('express');
const router = express.Router();
const predictiveToolsController = require('../controllers/predictiveToolsController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Personalized forecast
router.post('/forecast', predictiveToolsController.createPersonalizedForecast);

// Eclipse impact analysis
router.post('/eclipse-impact', predictiveToolsController.analyzeEclipseImpact);

// Retrograde planning
router.post('/retrograde-planning', predictiveToolsController.createRetrogradePlanning);

// Key dates
router.post('/key-dates', predictiveToolsController.identifyKeyDates);

// Planetary hours
router.post('/planetary-hours', predictiveToolsController.calculatePlanetaryHours);

module.exports = router;
