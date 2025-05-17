const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');
const authMiddleware = require('../middleware/authMiddleware');

// Chart CRUD operations
router.post('/', authMiddleware.authenticate, chartController.createChart);
router.get('/', authMiddleware.authenticate, chartController.getUserCharts);
router.get('/:id', chartController.getChartById); // Public route to support sharing
router.delete('/:id', authMiddleware.authenticate, chartController.deleteChart);

// Export chart to PDF/Image
router.get('/:id/pdf', chartController.exportChartPdf);
router.get('/:id/image', chartController.exportChartImage);

// Chart comparison
router.post('/compare', chartController.compareCharts);

// Generate a new chart (does not save it)
router.post('/generate', chartController.generateChart);

module.exports = router;
