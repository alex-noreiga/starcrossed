const { ApiError } = require('../utils/errorHandler');
const progressionService = require('../services/progressionService');
const chartService = require('../services/chartService');

/**
 * Controller for progression-related endpoints
 */
class ProgressionController {
  /**
   * Calculate secondary progressions
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async calculateSecondaryProgressions(req, res, next) {
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
      const progressedDate = date ? new Date(date) : new Date();
      
      // Calculate secondary progressions
      const progressions = await progressionService.calculateSecondaryProgressions(
        birthChart, progressedDate
      );
      
      res.status(200).json({
        success: true,
        data: progressions
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Calculate solar arc directions
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async calculateSolarArcDirections(req, res, next) {
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
      const directedDate = date ? new Date(date) : new Date();
      
      // Calculate solar arc directions
      const solarArc = await progressionService.calculateSolarArcDirections(
        birthChart, directedDate
      );
      
      res.status(200).json({
        success: true,
        data: solarArc
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Calculate solar return chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async calculateSolarReturn(req, res, next) {
    try {
      const { chartId, year, coordinates } = req.body;
      
      if (!chartId || !year) {
        throw new ApiError(400, 'Chart ID and year are required');
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
      
      // Calculate solar return
      const solarReturn = await progressionService.calculateSolarReturn(
        birthChart, parseInt(year), coordinates
      );
      
      res.status(200).json({
        success: true,
        data: solarReturn
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Calculate lunar phase analysis
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async calculateLunarPhaseAnalysis(req, res, next) {
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
      
      // Calculate lunar phase analysis
      const lunarPhaseAnalysis = await progressionService.calculateLunarPhaseAnalysis(
        birthChart, targetDate
      );
      
      res.status(200).json({
        success: true,
        data: lunarPhaseAnalysis
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Calculate composite chart
   * 
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  async calculateCompositeChart(req, res, next) {
    try {
      const { chartIdA, chartIdB, coordinates } = req.body;
      
      if (!chartIdA || !chartIdB) {
        throw new ApiError(400, 'Both chart IDs are required');
      }
      
      // Get both birth charts
      const chartA = await chartService.getChartById(chartIdA);
      const chartB = await chartService.getChartById(chartIdB);
      
      if (!chartA || !chartB) {
        throw new ApiError(404, 'One or both birth charts not found');
      }
      
      // Verify user has access to both charts
      if ((chartA.userId !== req.user.id && !chartA.isPublic) || 
          (chartB.userId !== req.user.id && !chartB.isPublic)) {
        throw new ApiError(403, 'You do not have access to one or both charts');
      }
      
      // Calculate composite chart
      const compositeChart = await progressionService.calculateCompositeChart(
        chartA, chartB, coordinates
      );
      
      res.status(200).json({
        success: true,
        data: compositeChart
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProgressionController();
