const { ApiError } = require('../utils/errorHandler');
const transitService = require('../services/transitService');
const chartService = require('../services/chartService');

/**
 * Controller for transit-related endpoints
 */
class TransitController {
  /**
   * Calculate current transits for a birth chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getCurrentTransits(req, res, next) {
    try {
      const { chartId } = req.params;
      const { date } = req.query;
      
      // Get birth chart data
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Parse transit date if provided, or use current date
      const transitDate = date ? new Date(date) : new Date();
      
      // Calculate transits
      const transits = transitService.calculateCurrentTransits(birthChart, transitDate);
      
      res.status(200).json({
        success: true,
        data: transits
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Generate transit forecast for a period
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransitForecast(req, res, next) {
    try {
      const { chartId } = req.params;
      const { startDate, endDate, interval } = req.query;
      
      // Validate required parameters
      if (!startDate || !endDate) {
        throw new ApiError(400, 'Start date and end date are required');
      }
      
      // Get birth chart data
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Parse dates
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      const parsedInterval = interval ? parseInt(interval) : 1;
      
      // Generate forecast
      const forecast = transitService.generateTransitForecast(
        birthChart, 
        parsedStartDate, 
        parsedEndDate, 
        parsedInterval
      );
      
      res.status(200).json({
        success: true,
        data: forecast
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Get transit calendar data
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getTransitCalendar(req, res, next) {
    try {
      const { chartId } = req.params;
      const { startDate, days } = req.query;
      
      // Get birth chart data
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Parse parameters
      const parsedStartDate = startDate ? new Date(startDate) : new Date();
      const parsedDays = days ? parseInt(days) : 30;
      
      // Calculate calendar data
      const calendarData = transitService.calculateTransitCalendar(
        birthChart,
        parsedStartDate,
        parsedDays
      );
      
      res.status(200).json({
        success: true,
        data: calendarData
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Find upcoming significant transits
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async getUpcomingTransits(req, res, next) {
    try {
      const { chartId } = req.params;
      const { days } = req.query;
      
      // Get birth chart data
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Parse parameters
      const parsedDays = days ? parseInt(days) : 90;
      
      // Find upcoming transits
      const upcomingTransits = transitService.findUpcomingTransits(
        birthChart,
        parsedDays
      );
      
      res.status(200).json({
        success: true,
        data: upcomingTransits
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Setup transit notifications (to be integrated with notification service)
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async setupTransitNotifications(req, res, next) {
    try {
      const { chartId } = req.params;
      const { userId } = req.user;
      const { enabled, planetFilters, aspectFilters, frequency } = req.body;
      
      // Get birth chart data
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Ensure the chart belongs to the user
      if (birthChart.userId !== userId) {
        throw new ApiError(403, 'You do not have permission to access this chart');
      }
      
      // Store notification preferences (implementation would depend on your notification system)
      const notificationSettings = {
        userId,
        chartId,
        enabled: enabled !== undefined ? enabled : true,
        planetFilters: planetFilters || [],
        aspectFilters: aspectFilters || [],
        frequency: frequency || 'daily'
      };
      
      // TODO: Save notification settings to database
      
      res.status(200).json({
        success: true,
        message: 'Transit notifications set up successfully',
        data: notificationSettings
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransitController();
