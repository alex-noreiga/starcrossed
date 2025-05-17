const express = require('express');
const router = express.Router();
const transitController = require('../controllers/transitController');
const auth = require('../middleware/auth');

// All transit routes require authentication
router.use(auth);

/**
 * @route   GET /api/transits/:chartId/current
 * @desc    Get current transits for a birth chart
 * @access  Private
 */
router.get('/:chartId/current', transitController.getCurrentTransits);

/**
 * @route   GET /api/transits/:chartId/forecast
 * @desc    Generate transit forecast for a period
 * @access  Private
 */
router.get('/:chartId/forecast', transitController.getTransitForecast);

/**
 * @route   GET /api/transits/:chartId/calendar
 * @desc    Get transit calendar data
 * @access  Private
 */
router.get('/:chartId/calendar', transitController.getTransitCalendar);

/**
 * @route   GET /api/transits/:chartId/upcoming
 * @desc    Find upcoming significant transits
 * @access  Private
 */
router.get('/:chartId/upcoming', transitController.getUpcomingTransits);

/**
 * @route   POST /api/transits/:chartId/notifications
 * @desc    Set up transit notifications
 * @access  Private
 */
router.post('/:chartId/notifications', transitController.setupTransitNotifications);

module.exports = router;
