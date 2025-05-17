const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All notification routes require authentication
router.use(auth);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @route   POST /api/notifications/mark-read
 * @desc    Mark notifications as read
 * @access  Private
 */
router.post('/mark-read', notificationController.markNotificationsAsRead);

/**
 * @route   DELETE /api/notifications/delete
 * @desc    Delete notifications
 * @access  Private
 */
router.post('/delete', notificationController.deleteNotifications);

/**
 * @route   GET /api/notifications/check
 * @desc    Check for new notifications
 * @access  Private
 */
router.get('/check', notificationController.checkForNewNotifications);

/**
 * @route   GET /api/notifications/chart/:chartId
 * @desc    Get upcoming notifications for a chart
 * @access  Private
 */
router.get('/chart/:chartId', notificationController.getUpcomingNotifications);

/**
 * @route   GET /api/notifications/settings/:chartId
 * @desc    Get notification settings for a chart
 * @access  Private
 */
router.get('/settings/:chartId', notificationController.getNotificationSettings);

/**
 * @route   PUT /api/notifications/settings/:chartId
 * @desc    Update notification settings for a chart
 * @access  Private
 */
router.put('/settings/:chartId', notificationController.updateNotificationSettings);

module.exports = router;
