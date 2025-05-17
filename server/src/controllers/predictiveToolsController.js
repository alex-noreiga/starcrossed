const { ApiError } = require('../utils/errorHandler');
const predictiveToolsService = require('../services/predictiveToolsService');
const chartService = require('../services/chartService');

/**
 * Controller for predictive tools endpoints
 */
class PredictiveToolsController {
  /**
   * Create personalized astrological forecast
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createPersonalizedForecast(req, res, next) {
    try {
      const { chartId, startDate, duration } = req.body;
      
      if (!chartId) {
        throw new ApiError(400, 'Chart ID is required');
      }
      
      // Get birth chart
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Verify user has access to this chart
      if (birthChart.userId !== req.user.id && !birthChart.isPublic) {
        throw new ApiError(403, 'You do not have access to this chart');
      }
      
      // Parse start date or use current date
      const forecastStartDate = startDate ? new Date(startDate) : new Date();
      
      // Calculate personalized forecast
      const forecast = await predictiveToolsService.createPersonalizedForecast(
        birthChart, forecastStartDate, duration || 30
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
   * Analyze eclipse impacts
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async analyzeEclipseImpact(req, res, next) {
    try {
      const { chartId, date } = req.body;
      
      if (!chartId) {
        throw new ApiError(400, 'Chart ID is required');
      }
      
      // Get birth chart
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Verify user has access to this chart
      if (birthChart.userId !== req.user.id && !birthChart.isPublic) {
        throw new ApiError(403, 'You do not have access to this chart');
      }
      
      // Parse date or use current date
      const targetDate = date ? new Date(date) : new Date();
      
      // Analyze eclipse impacts
      const eclipseImpact = await predictiveToolsService.analyzeEclipseImpact(
        birthChart, targetDate
      );
      
      res.status(200).json({
        success: true,
        data: eclipseImpact
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Create retrograde planning tool
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async createRetrogradePlanning(req, res, next) {
    try {
      const { chartId, startDate, months } = req.body;
      
      if (!chartId) {
        throw new ApiError(400, 'Chart ID is required');
      }
      
      // Get birth chart
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Verify user has access to this chart
      if (birthChart.userId !== req.user.id && !birthChart.isPublic) {
        throw new ApiError(403, 'You do not have access to this chart');
      }
      
      // Parse start date or use current date
      const planningStartDate = startDate ? new Date(startDate) : new Date();
      
      // Create retrograde planning
      const retrogradePlanning = await predictiveToolsService.createRetrogradePlanning(
        birthChart, planningStartDate, months || 6
      );
      
      res.status(200).json({
        success: true,
        data: retrogradePlanning
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Identify key astrological dates
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async identifyKeyDates(req, res, next) {
    try {
      const { chartId, startDate, endDate } = req.body;
      
      if (!chartId || !startDate || !endDate) {
        throw new ApiError(400, 'Chart ID, start date, and end date are required');
      }
      
      // Get birth chart
      const birthChart = await chartService.getChartById(chartId);
      
      if (!birthChart) {
        throw new ApiError(404, 'Birth chart not found');
      }
      
      // Verify user has access to this chart
      if (birthChart.userId !== req.user.id && !birthChart.isPublic) {
        throw new ApiError(403, 'You do not have access to this chart');
      }
      
      // Parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Identify key dates
      const keyDates = await predictiveToolsService.identifyKeyDates(
        birthChart, start, end
      );
      
      res.status(200).json({
        success: true,
        data: keyDates
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Calculate planetary hours
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async calculatePlanetaryHours(req, res, next) {
    try {
      const { date, coordinates } = req.body;
      
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        throw new ApiError(400, 'Valid coordinates are required');
      }
      
      // Parse date or use current date
      const targetDate = date ? new Date(date) : new Date();
      
      // Calculate planetary hours
      const planetaryHours = await predictiveToolsService.calculatePlanetaryHours(
        targetDate, coordinates
      );
      
      res.status(200).json({
        success: true,
        data: planetaryHours
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PredictiveToolsController();
