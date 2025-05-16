const express = require('express');
const router = express.Router();
const chartController = require('../controllers/chartController');
const authMiddleware = require('../middleware/authMiddleware');

// Chart routes
router.post('/generate', chartController.generateChart);
router.get('/:id', chartController.getChart);
router.get('/', authMiddleware.authenticate, chartController.getUserCharts);
router.delete('/:id', authMiddleware.authenticate, chartController.deleteChart);

module.exports = router;
