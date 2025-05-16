const chartService = require('../services/chartService');
const chartModel = require('../models/chartModel');
const { ApiError } = require('../utils/errorHandler');

/**
 * Generate a birth chart
 */
const generateChart = async (req, res, next) => {
  try {
    const { name, birthDate, birthTime, birthPlace } = req.body;
    
    // Optional userId from auth middleware, if user is logged in
    const userId = req.user ? req.user.id : null;
    
    // Calculate the chart data
    const chartData = await chartService.calculateBirthChart({ birthDate, birthTime, birthPlace });
    
    // If user is logged in, store the chart in the database
    if (userId) {
      const chart = await chartModel.createChart({
        userId,
        name,
        birthDate,
        birthTime,
        birthPlace,
        chartData
      });
      
      return res.status(201).json(chart);
    }
    
    // If not logged in, just return the calculated chart data
    res.status(200).json({
      name,
      birthDate,
      birthTime,
      birthPlace,
      chartData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a chart by ID
 */
const getChart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    
    const chart = await chartModel.getChartById(id, userId);
    res.status(200).json(chart);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all charts for the authenticated user
 */
const getUserCharts = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const charts = await chartModel.getChartsByUserId(userId);
    res.status(200).json(charts);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a chart
 */
const deleteChart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await chartModel.deleteChart(id, userId);
    res.status(200).json({ message: 'Chart deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateChart,
  getChart,
  getUserCharts,
  deleteChart
};
