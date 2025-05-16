const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const chartController = require('../controllers/chartController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

// Generate birth chart (public endpoint)
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('birthDate').isDate().withMessage('Valid birth date is required'),
    body('birthTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Birth time must be in HH:MM format'),
    body('birthPlace').notEmpty().withMessage('Birth place is required')
  ],
  validate,
  chartController.generateChart
);

// Get a specific chart by ID (requires auth if private)
router.get('/:id', chartController.getChart);

// Get all charts for the authenticated user
router.get('/', auth, chartController.getUserCharts);

// Delete a chart
router.delete('/:id', auth, chartController.deleteChart);

module.exports = router;
