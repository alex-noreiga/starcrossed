const { ApiError } = require('../utils/errorHandler');
const notificationService = require('../services/notificationService');
const chartService = require('../services/chartService');

/**
 * Controller for notification-related endpoints
 */
class NotificationController {
  /**
   * Get user notifications
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getUserNotifications(req, res, next) {
    try {
      const { userId } = req.user;
      const { unreadOnly, limit } = req.query;
      
      // Parse query parameters
      const options = {
        unreadOnly: unreadOnly === 'true',
        limit: limit ? parseInt(limit) : 50
      };
      
      // Get notifications
      const notifications = await notificationService.getUserNotifications(userId, options);
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Mark notifications as read
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async markNotificationsAsRead(req, res, next) {
    try {
      const { userId } = req.user;
      const { notificationIds } = req.body;
      
      if (!notificationIds || !Array.isArray(notificationIds)) {
        throw new ApiError(400, 'Notification IDs must be provided as an array');
      }
      
      // Mark notifications as read
      await notificationService.markNotificationsAsRead(userId, notificationIds);
      
      res.status(200).json({
        success: true,
        message: 'Notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Delete notifications
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async deleteNotifications(req, res, next) {
    try {
      const { userId } = req.user;
      const { notificationIds } = req.body;
      
      if (!notificationIds || !Array.isArray(notificationIds)) {
        throw new ApiError(400, 'Notification IDs must be provided as an array');
      }
      
      // Delete notifications
      await notificationService.deleteNotifications(userId, notificationIds);
      
      res.status(200).json({
        success: true,
        message: 'Notifications deleted'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Update notification settings for a chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async updateNotificationSettings(req, res, next) {
    try {
      const { userId } = req.user;
      const { chartId } = req.params;
      const settings = req.body;
      
      // Check if chart exists and belongs to user
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      if (chart.userId !== userId) {
        throw new ApiError(403, 'You do not have permission to update settings for this chart');
      }
      
      // Update notification settings
      const updatedSettings = await notificationService.updateNotificationSettings(
        userId, chartId, settings
      );
      
      res.status(200).json({
        success: true,
        data: updatedSettings
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get notification settings for a chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getNotificationSettings(req, res, next) {
    try {
      const { userId } = req.user;
      const { chartId } = req.params;
      
      // Check if chart exists and belongs to user
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      if (chart.userId !== userId) {
        throw new ApiError(403, 'You do not have permission to view settings for this chart');
      }
      
      // Get notification settings
      const settings = await notificationService.getNotificationSettings(userId, chartId);
      
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Check for upcoming notifications for a chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getUpcomingNotifications(req, res, next) {
    try {
      const { userId } = req.user;
      const { chartId } = req.params;
      const { days } = req.query;
      
      // Parse days parameter
      const lookAheadDays = days ? parseInt(days) : 7;
      
      // Check if chart exists and belongs to user
      const chart = await chartService.getChartById(chartId);
      
      if (!chart) {
        throw new ApiError(404, 'Chart not found');
      }
      
      if (chart.userId !== userId) {
        throw new ApiError(403, 'You do not have permission to access this chart');
      }
      
      // Generate upcoming notifications
      const notifications = await notificationService.generateUpcomingNotifications(
        userId, chartId, chart, lookAheadDays
      );
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Check for new notifications
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async checkForNewNotifications(req, res, next) {
    try {
      const { userId } = req.user;
      
      // Check for new notifications
      const notifications = await notificationService.checkForNewNotifications(userId);
      
      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
