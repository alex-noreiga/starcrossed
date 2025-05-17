const chartModel = require('../models/chartModel');
const calculationService = require('../services/calculationService');
const PDFDocument = require('pdfkit');
const { ApiError } = require('../utils/errorHandler');

/**
 * Generate a birth chart without saving it
 */
const generateChart = async (req, res, next) => {
  try {
    const { name, birthDate, birthTime, birthPlace } = req.body;
    
    // Validate input
    if (!name || !birthDate || !birthTime || !birthPlace) {
      throw new ApiError(400, 'Missing required fields');
    }
    
    // Generate chart data
    const chartData = await calculationService.calculateBirthChart({
      name,
      birthDate,
      birthTime,
      birthPlace
    });
    
    res.status(200).json(chartData);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a birth chart and save it to user's profile
 */
const createChart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, birthDate, birthTime, birthPlace, chartData } = req.body;
    
    // Validate input
    if (!name || !birthDate || !birthTime || !birthPlace) {
      throw new ApiError(400, 'Missing required fields');
    }
    
    // If chart data is not provided, calculate it
    let calculatedChartData = chartData;
    if (!calculatedChartData) {
      calculatedChartData = await calculationService.calculateBirthChart({
        name,
        birthDate,
        birthTime,
        birthPlace
      });
    }
    
    // Save chart to database
    const savedChart = await chartModel.createChart({
      userId,
      name,
      birthDate,
      birthTime,
      birthPlace,
      chartData: calculatedChartData
    });
    
    res.status(201).json(savedChart);
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
 * Get a chart by ID (accessible to chart owner or via shared link)
 */
const getChartById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // May be undefined for public access
    
    // If userId is provided, only get if it belongs to this user
    // Otherwise, fetch the chart without user verification (for sharing)
    const chart = await chartModel.getChartById(id, userId);
    
    res.status(200).json(chart);
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
    
    const result = await chartModel.deleteChart(id, userId);
    
    res.status(200).json({ message: 'Chart deleted successfully', id: result.id });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare two charts and generate synastry
 */
const compareCharts = async (req, res, next) => {
  try {
    const { chartIdA, chartIdB } = req.body;
    
    // Validate input
    if (!chartIdA || !chartIdB) {
      throw new ApiError(400, 'Two chart IDs are required');
    }
    
    // Get both charts
    const chartA = await chartModel.getChartById(chartIdA);
    const chartB = await chartModel.getChartById(chartIdB);
    
    // Calculate synastry aspects
    const synastryData = calculationService.calculateSynastry(
      chartA.chartData,
      chartB.chartData
    );
    
    res.status(200).json({
      chartA,
      chartB,
      synastry: synastryData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export chart as PDF
 */
const exportChartPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get the chart
    const chart = await chartModel.getChartById(id);
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=birth-chart-${id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc
      .fontSize(25)
      .text('Birth Chart', { align: 'center' })
      .moveDown(0.5);
    
    doc
      .fontSize(16)
      .text(`Name: ${chart.name}`, { align: 'left' })
      .moveDown(0.5);
    
    doc
      .fontSize(12)
      .text(`Birth Date: ${new Date(chart.birthDate).toLocaleDateString()}`, { align: 'left' })
      .text(`Birth Time: ${chart.birthTime}`, { align: 'left' })
      .text(`Birth Place: ${chart.birthPlace}`, { align: 'left' })
      .moveDown(1);
    
    // Add planet positions
    doc
      .fontSize(14)
      .text('Planetary Positions', { align: 'left' })
      .moveDown(0.5);
    
    // Get zodiac signs
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    // Format each planet position
    Object.entries(chart.chartData.planets).forEach(([planet, data]) => {
      const sign = zodiacSigns[Math.floor(data.position / 30)];
      const degrees = Math.floor(data.position % 30);
      const minutes = Math.round((data.position % 1) * 60);
      
      doc.text(`${planet}: ${degrees}° ${minutes}' ${sign}`, { align: 'left' });
    });
    
    doc.moveDown(1);
    
    // Add aspects
    doc
      .fontSize(14)
      .text('Aspects', { align: 'left' })
      .moveDown(0.5);
    
    chart.chartData.aspects.forEach(aspect => {
      doc.text(`${aspect.planet1} ${aspect.aspectType} ${aspect.planet2} (${aspect.orb.toFixed(1)}°)`, { align: 'left' });
    });
    
    // Add houses
    doc.moveDown(1)
      .fontSize(14)
      .text('Houses', { align: 'left' })
      .moveDown(0.5);
    
    chart.chartData.houses.forEach((house, index) => {
      const sign = zodiacSigns[Math.floor(house.cusp / 30)];
      const degrees = Math.floor(house.cusp % 30);
      const minutes = Math.round((house.cusp % 1) * 60);
      
      doc.text(`House ${index + 1}: ${degrees}° ${minutes}' ${sign}`, { align: 'left' });
    });
    
    // Add interpretations if available
    if (chart.chartData.interpretations) {
      doc.moveDown(1)
        .fontSize(14)
        .text('Interpretations', { align: 'left' })
        .moveDown(0.5);
      
      Object.entries(chart.chartData.interpretations).forEach(([key, text]) => {
        doc.fontSize(12)
          .text(key, { underline: true })
          .moveDown(0.2)
          .text(text)
          .moveDown(0.5);
      });
    }
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    next(error);
  }
};

/**
 * Export chart as SVG image
 */
const exportChartImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get the chart
    const chart = await chartModel.getChartById(id);
    
    // Create SVG content
    const width = 800;
    const height = 800;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 350;
    
    // Start SVG
    let svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1a1a2e"/>
  <text x="${centerX}" y="50" font-family="Arial" font-size="24" fill="white" text-anchor="middle" font-weight="bold">
    Birth Chart: ${chart.name}
  </text>`;
    
    // Zodiac colors
    const zodiacColors = [
      '#FF4136', '#2ECC40', '#FFDC00', '#B10DC9',
      '#FF851B', '#7FDBFF', '#F012BE', '#111111',
      '#01FF70', '#0074D9', '#39CCCC', '#85144b'
    ];
    
    // Draw zodiac wheel (12 segments)
    for (let i = 0; i < 12; i++) {
      const startAngle = i * 30;
      const endAngle = (i + 1) * 30;
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;
      
      // Calculate points
      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);
      
      // Create path for segment
      const largeArcFlag = 0; // 0 for arcs less than 180 degrees
      const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      svg += `<path d="${path}" fill="${zodiacColors[i]}" stroke="black" stroke-width="1" opacity="0.7"/>`;
    }
    
    // Draw zodiac symbols
    const zodiacSymbols = {
      Aries: '♈',
      Taurus: '♉',
      Gemini: '♊',
      Cancer: '♋',
      Leo: '♌',
      Virgo: '♍',
      Libra: '♎',
      Scorpio: '♏',
      Sagittarius: '♐',
      Capricorn: '♑',
      Aquarius: '♒',
      Pisces: '♓'
    };
    
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 + 15 - 90) * Math.PI / 180; // Middle of segment, -90 to start at top
      const labelRadius = radius * 0.8;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      svg += `<text x="${x}" y="${y}" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${zodiacSymbols[zodiacSigns[i]]}
      </text>`;
    }
    
    // Draw planets
    Object.entries(chart.chartData.planets).forEach(([planet, data]) => {
      const degree = data.position;
      const angle = (degree - 90) * Math.PI / 180; // -90 to start at top
      const planetRadius = radius * 0.6;
      const x = centerX + planetRadius * Math.cos(angle);
      const y = centerY + planetRadius * Math.sin(angle);
      
      // Planet symbols
      const planetSymbols = {
        Sun: '☉',
        Moon: '☽',
        Mercury: '☿',
        Venus: '♀',
        Mars: '♂',
        Jupiter: '♃',
        Saturn: '♄',
        Uranus: '♅',
        Neptune: '♆',
        Pluto: '♇'
      };
      
      svg += `<circle cx="${x}" cy="${y}" r="12" fill="white" stroke="black" stroke-width="1"/>
      <text x="${x}" y="${y}" font-family="Arial" font-size="12" fill="black" text-anchor="middle" dominant-baseline="middle">
        ${planetSymbols[planet] || planet.charAt(0)}
      </text>`;
    });
    
    // Close SVG
    svg += `</svg>`;
    
    // Set response headers
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename=birth-chart-${id}.svg`);
    
    // Send SVG response
    res.send(svg);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateChart,
  createChart,
  getUserCharts,
  getChartById,
  deleteChart,
  compareCharts,
  exportChartPdf,
  exportChartImage
};
