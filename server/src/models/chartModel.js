const db = require('../utils/db');
const { ApiError } = require('../utils/errorHandler');
const { v4: uuidv4 } = require('uuid');

const createChart = async (chartData) => {
  const { userId, name, birthDate, birthTime, birthPlace, chartData: calculatedChartData } = chartData;
  const id = uuidv4();
  const createdAt = new Date().toISOString();
  
  try {
    const result = await db.query(
      `INSERT INTO charts (
        id, user_id, name, birth_date, birth_time, birth_place, chart_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [id, userId, name, birthDate, birthTime, birthPlace, JSON.stringify(calculatedChartData), createdAt]
    );
    
    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      name: result.rows[0].name,
      birthDate: result.rows[0].birth_date,
      birthTime: result.rows[0].birth_time,
      birthPlace: result.rows[0].birth_place,
      chartData: JSON.parse(result.rows[0].chart_data),
      createdAt: result.rows[0].created_at
    };
  } catch (error) {
    console.error('Error creating chart:', error);
    throw new ApiError(500, 'Failed to create birth chart');
  }
};

const getChartById = async (chartId, userId = null) => {
  try {
    let query = `SELECT * FROM charts WHERE id = $1`;
    const params = [chartId];
    
    // If userId is provided, only get chart if it belongs to this user
    if (userId) {
      query += ` AND user_id = $2`;
      params.push(userId);
    }
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Chart not found');
    }
    
    return {
      id: result.rows[0].id,
      userId: result.rows[0].user_id,
      name: result.rows[0].name,
      birthDate: result.rows[0].birth_date,
      birthTime: result.rows[0].birth_time,
      birthPlace: result.rows[0].birth_place,
      chartData: JSON.parse(result.rows[0].chart_data),
      createdAt: result.rows[0].created_at
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error getting chart:', error);
    throw new ApiError(500, 'Failed to retrieve birth chart');
  }
};

const getChartsByUserId = async (userId) => {
  try {
    const result = await db.query(
      `SELECT * FROM charts WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthPlace: row.birth_place,
      chartData: JSON.parse(row.chart_data),
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error getting user charts:', error);
    throw new ApiError(500, 'Failed to retrieve user charts');
  }
};

const deleteChart = async (chartId, userId) => {
  try {
    const result = await db.query(
      `DELETE FROM charts WHERE id = $1 AND user_id = $2 RETURNING id`,
      [chartId, userId]
    );
    
    if (result.rows.length === 0) {
      throw new ApiError(404, 'Chart not found or not authorized');
    }
    
    return { id: result.rows[0].id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Error deleting chart:', error);
    throw new ApiError(500, 'Failed to delete birth chart');
  }
};

module.exports = {
  createChart,
  getChartById,
  getChartsByUserId,
  deleteChart
};
