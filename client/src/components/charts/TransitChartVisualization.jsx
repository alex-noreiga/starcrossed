import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

/**
 * TransitChartVisualization component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.birthChart - Birth chart data
 * @param {Object} props.transitData - Transit data (optional, if not provided will fetch current transits)
 * @param {string} props.chartId - Chart ID for fetching transit data
 * @param {Date} props.transitDate - Date to calculate transits for (defaults to current date)
 */
const TransitChartVisualization = ({ 
  birthChart, 
  transitData: providedTransitData, 
  chartId,
  transitDate 
}) => {
  const { token } = useAuth();
  const [transitData, setTransitData] = useState(providedTransitData || null);
  const [loading, setLoading] = useState(!providedTransitData);
  const [error, setError] = useState(null);
  
  // Chart configuration
  const config = {
    width: 600,
    height: 600,
    margin: 50,
    radiusOuter: 250,
    radiusInner: 150,
    centerX: 300,
    centerY: 300,
    zodiacColors: {
      'Aries': '#FF4500',
      'Taurus': '#228B22',
      'Gemini': '#FFD700',
      'Cancer': '#87CEEB',
      'Leo': '#FF8C00',
      'Virgo': '#BDB76B',
      'Libra': '#DDA0DD',
      'Scorpio': '#800000',
      'Sagittarius': '#FF1493',
      'Capricorn': '#708090',
      'Aquarius': '#00BFFF',
      'Pisces': '#9370DB'
    },
    planetSymbols: {
      'Sun': '☉',
      'Moon': '☽',
      'Mercury': '☿',
      'Venus': '♀',
      'Mars': '♂',
      'Jupiter': '♃',
      'Saturn': '♄',
      'Uranus': '♅',
      'Neptune': '♆',
      'Pluto': '♇',
      'North Node': '☊'
    },
    aspectSymbols: {
      'conjunction': '☌',
      'opposition': '☍',
      'trine': '△',
      'square': '□',
      'sextile': '⚹'
    },
    aspectColors: {
      'conjunction': '#FF0000',
      'opposition': '#0000FF',
      'trine': '#00FF00',
      'square': '#FF00FF',
      'sextile': '#FFFF00'
    }
  };
  
  // Fetch transit data if not provided
  useEffect(() => {
    if (!providedTransitData && chartId) {
      fetchTransitData();
    }
  }, [chartId, transitDate]);
  
  const fetchTransitData = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let queryParams = '';
      if (transitDate) {
        queryParams = `?date=${transitDate.toISOString()}`;
      }
      
      // Fetch transit data
      const response = await axios.get(
        `/api/transits/${chartId}/current${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setTransitData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transit data:', error);
      setError('Failed to load transit data');
      setLoading(false);
    }
  };
  
  // Generate chart visualization when data is available
  useEffect(() => {
    if (birthChart && transitData) {
      renderChart();
    }
  }, [birthChart, transitData]);
  
  const renderChart = () => {
    // Clear previous chart
    d3.select('#transit-chart-visualization').selectAll('*').remove();
    
    // Create SVG container
    const svg = d3.select('#transit-chart-visualization')
      .append('svg')
      .attr('width', config.width)
      .attr('height', config.height)
      .append('g')
      .attr('transform', `translate(${config.centerX}, ${config.centerY})`);
    
    // Draw zodiac wheel
    drawZodiacWheel(svg);
    
    // Draw house cusps
    drawHouseCusps(svg, birthChart.houses);
    
    // Draw natal planets
    drawNatalPlanets(svg, birthChart.planets);
    
    // Draw transit planets
    drawTransitPlanets(svg, transitData.transitPositions);
    
    // Draw transit aspects
    drawTransitAspects(svg, transitData.transitAspects);
    
    // Draw chart legend
    drawChartLegend(svg);
  };
  
  const drawZodiacWheel = (svg) => {
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    // Draw zodiac ring
    const arcGenerator = d3.arc()
      .innerRadius(config.radiusInner)
      .outerRadius(config.radiusOuter)
      .startAngle((d, i) => (i * 30) * Math.PI / 180)
      .endAngle((d, i) => ((i + 1) * 30) * Math.PI / 180);
    
    // Draw zodiac segments
    svg.selectAll('.zodiac-segment')
      .data(zodiacSigns)
      .enter()
      .append('path')
      .attr('class', 'zodiac-segment')
      .attr('d', arcGenerator)
      .attr('fill', (d) => config.zodiacColors[d])
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .attr('opacity', 0.6);
    
    // Add zodiac symbols
    svg.selectAll('.zodiac-symbol')
      .data(zodiacSigns)
      .enter()
      .append('text')
      .attr('class', 'zodiac-symbol')
      .attr('x', (d, i) => {
        const angle = ((i * 30) + 15) * Math.PI / 180;
        return Math.sin(angle) * (config.radiusOuter + 20);
      })
      .attr('y', (d, i) => {
        const angle = ((i * 30) + 15) * Math.PI / 180;
        return -Math.cos(angle) * (config.radiusOuter + 20);
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text((d, i) => getZodiacSymbol(d));
    
    // Draw degree markers
    for (let i = 0; i < 360; i += 5) {
      const isHeavy = i % 30 === 0;
      const markerLength = isHeavy ? 15 : 5;
      
      const angle = i * Math.PI / 180;
      const x1 = Math.sin(angle) * config.radiusOuter;
      const y1 = -Math.cos(angle) * config.radiusOuter;
      const x2 = Math.sin(angle) * (config.radiusOuter - markerLength);
      const y2 = -Math.cos(angle) * (config.radiusOuter - markerLength);
      
      svg.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#333')
        .attr('stroke-width', isHeavy ? 2 : 1);
    }
  };
  
  const drawHouseCusps = (svg, houses) => {
    // Draw house cusp lines
    houses.forEach((house, i) => {
      const angle = house.cusp * Math.PI / 180;
      const x1 = Math.sin(angle) * config.radiusInner;
      const y1 = -Math.cos(angle) * config.radiusInner;
      const x2 = Math.sin(angle) * config.radiusOuter;
      const y2 = -Math.cos(angle) * config.radiusOuter;
      
      svg.append('line')
        .attr('class', 'house-cusp')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#333')
        .attr('stroke-width', house.number % 3 === 1 ? 2 : 1)
        .attr('stroke-dasharray', house.number % 3 === 1 ? 'none' : '3,3');
      
      // Add house number
      const labelAngle = ((house.cusp + (houses[(i + 1) % 12].cusp)) / 2) * Math.PI / 180;
      const labelRadius = config.radiusInner - 20;
      
      svg.append('text')
        .attr('class', 'house-number')
        .attr('x', Math.sin(labelAngle) * labelRadius)
        .attr('y', -Math.cos(labelAngle) * labelRadius)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(house.number);
    });
  };
  
  const drawNatalPlanets = (svg, planets) => {
    const planetEntries = Object.entries(planets);
    
    // Calculate planet positions with spacing to avoid overlaps
    const positions = calculatePlanetPositions(planetEntries, config.radiusInner - 30);
    
    // Draw natal planets
    svg.selectAll('.natal-planet')
      .data(positions)
      .enter()
      .append('g')
      .attr('class', 'natal-planet')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .each(function(d) {
        // Planet circle
        d3.select(this)
          .append('circle')
          .attr('r', 15)
          .attr('fill', 'white')
          .attr('stroke', '#333')
          .attr('stroke-width', 1);
        
        // Planet symbol
        d3.select(this)
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(config.planetSymbols[d.planet] || d.planet.charAt(0));
        
        // Draw line to exact position on wheel
        const exactAngle = d.exactPosition * Math.PI / 180;
        const exactX = Math.sin(exactAngle) * config.radiusOuter;
        const exactY = -Math.cos(exactAngle) * config.radiusOuter;
        
        svg.append('line')
          .attr('x1', d.x)
          .attr('y1', d.y)
          .attr('x2', exactX)
          .attr('y2', exactY)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2');
      });
  };
  
  const drawTransitPlanets = (svg, transitPlanets) => {
    const planetEntries = Object.entries(transitPlanets).map(([planet, data]) => ({
      planet,
      position: data.position,
      retrograde: data.retrograde
    }));
    
    // Calculate planet positions with spacing to avoid overlaps
    const positions = calculatePlanetPositions(planetEntries, config.radiusOuter + 30);
    
    // Draw transit planets
    svg.selectAll('.transit-planet')
      .data(positions)
      .enter()
      .append('g')
      .attr('class', 'transit-planet')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .each(function(d) {
        // Planet circle
        d3.select(this)
          .append('circle')
          .attr('r', 12)
          .attr('fill', '#f0f0f0')
          .attr('stroke', 'red')
          .attr('stroke-width', 1.5);
        
        // Planet symbol
        d3.select(this)
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', 'red')
          .text(config.planetSymbols[d.planet] || d.planet.charAt(0));
        
        // Add retrograde symbol if applicable
        if (d.retrograde) {
          d3.select(this)
            .append('text')
            .attr('x', 0)
            .attr('y', 15)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'red')
            .text('℞');
        }
        
        // Draw line to exact position on wheel
        const exactAngle = d.exactPosition * Math.PI / 180;
        const exactX = Math.sin(exactAngle) * config.radiusOuter;
        const exactY = -Math.cos(exactAngle) * config.radiusOuter;
        
        svg.append('line')
          .attr('x1', d.x)
          .attr('y1', d.y)
          .attr('x2', exactX)
          .attr('y2', exactY)
          .attr('stroke', 'red')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '2,2');
      });
  };
  
  const drawTransitAspects = (svg, aspects) => {
    // Filter significant aspects (high exactness)
    const significantAspects = aspects.filter(aspect => aspect.exactness > 75);
    
    // Draw aspect lines
    svg.selectAll('.transit-aspect')
      .data(significantAspects)
      .enter()
      .append('g')
      .attr('class', 'transit-aspect')
      .each(function(aspect) {
        // Find planet positions
        const transitPlanetPosition = transitData.transitPositions[aspect.transitPlanet].position;
        const natalPlanetPosition = birthChart.planets[aspect.natalPlanet].position;
        
        // Convert to cartesian coordinates
        const transitAngle = transitPlanetPosition * Math.PI / 180;
        const natalAngle = natalPlanetPosition * Math.PI / 180;
        
        const transitX = Math.sin(transitAngle) * (config.radiusOuter + 30);
        const transitY = -Math.cos(transitAngle) * (config.radiusOuter + 30);
        const natalX = Math.sin(natalAngle) * (config.radiusInner - 30);
        const natalY = -Math.cos(natalAngle) * (config.radiusInner - 30);
        
        // Draw aspect line
        svg.append('line')
          .attr('x1', transitX)
          .attr('y1', transitY)
          .attr('x2', natalX)
          .attr('y2', natalY)
          .attr('stroke', config.aspectColors[aspect.aspectType])
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', aspect.applying ? 'none' : '5,3')
          .attr('opacity', aspect.exactness / 100);
        
        // Add aspect symbol at midpoint
        const midX = (transitX + natalX) / 2;
        const midY = (transitY + natalY) / 2;
        
        svg.append('text')
          .attr('x', midX)
          .attr('y', midY)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .attr('fill', config.aspectColors[aspect.aspectType])
          .text(config.aspectSymbols[aspect.aspectType] || '*');
      });
  };
  
  const drawChartLegend = (svg) => {
    // Create legend container
    const legend = svg.append('g')
      .attr('class', 'chart-legend')
      .attr('transform', `translate(${-config.width / 2 + 20}, ${-config.height / 2 + 20})`);
    
    // Title
    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text('Transit Chart Legend');
    
    // Natal planets (inner)
    legend.append('circle')
      .attr('cx', 10)
      .attr('cy', 30)
      .attr('r', 8)
      .attr('fill', 'white')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 35)
      .attr('font-size', '12px')
      .text('Natal Planets (Birth Chart)');
    
    // Transit planets (outer)
    legend.append('circle')
      .attr('cx', 10)
      .attr('cy', 55)
      .attr('r', 8)
      .attr('fill', '#f0f0f0')
      .attr('stroke', 'red')
      .attr('stroke-width', 1.5);
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 60)
      .attr('font-size', '12px')
      .text('Transit Planets (Current)');
    
    // Aspect types
    let y = 85;
    Object.entries(config.aspectSymbols).forEach(([aspect, symbol]) => {
      legend.append('text')
        .attr('x', 10)
        .attr('y', y)
        .attr('font-size', '14px')
        .attr('fill', config.aspectColors[aspect])
        .attr('font-weight', 'bold')
        .text(symbol);
      
      legend.append('text')
        .attr('x', 25)
        .attr('y', y + 5)
        .attr('font-size', '12px')
        .text(capitalizeFirstLetter(aspect));
      
      y += 20;
    });
  };
  
  // Helper function to calculate planet positions with spacing
  const calculatePlanetPositions = (planets, baseRadius) => {
    const positions = [];
    const occupiedPositions = new Map(); // Track occupied angles
    
    planets.forEach(planet => {
      let position, exactPosition;
      
      if (Array.isArray(planet)) {
        // Handle array structure from Object.entries()
        const [name, data] = planet;
        exactPosition = data.position;
        position = exactPosition;
      } else {
        // Handle object structure
        exactPosition = planet.position;
        position = exactPosition;
      }
      
      // Check for overlaps within 5 degrees
      let offset = 0;
      const increment = 5;
      const maxOffset = 15;
      
      while (offset <= maxOffset) {
        // Try original position first
        const checkPos = (position + offset) % 360;
        
        // Check if position is already occupied
        if (!isPositionOccupied(occupiedPositions, checkPos, 5)) {
          // Position is available
          position = checkPos;
          occupiedPositions.set(position, true);
          break;
        }
        
        // If occupied, try negative offset
        if (offset > 0) {
          const negCheckPos = (position - offset + 360) % 360;
          
          if (!isPositionOccupied(occupiedPositions, negCheckPos, 5)) {
            // Position is available
            position = negCheckPos;
            occupiedPositions.set(position, true);
            break;
          }
        }
        
        // Increase offset
        offset += increment;
      }
      
      // Convert to cartesian coordinates
      const angle = position * Math.PI / 180;
      const x = Math.sin(angle) * baseRadius;
      const y = -Math.cos(angle) * baseRadius;
      
      // Add to positions array
      if (Array.isArray(planet)) {
        positions.push({
          planet: planet[0],
          position,
          exactPosition,
          x,
          y,
          retrograde: planet[1].retrograde
        });
      } else {
        positions.push({
          planet: planet.planet,
          position,
          exactPosition,
          x,
          y,
          retrograde: planet.retrograde
        });
      }
    });
    
    return positions;
  };
  
  // Helper function to check if position is already occupied
  const isPositionOccupied = (occupiedPositions, position, tolerance) => {
    for (let pos of occupiedPositions.keys()) {
      // Check if any occupied position is within tolerance
      let diff = Math.abs(pos - position);
      if (diff > 180) diff = 360 - diff; // Handle positions across 0°
      
      if (diff < tolerance) {
        return true;
      }
    }
    
    return false;
  };
  
  // Helper function to get zodiac symbol
  const getZodiacSymbol = (sign) => {
    const symbols = {
      'Aries': '♈',
      'Taurus': '♉',
      'Gemini': '♊',
      'Cancer': '♋',
      'Leo': '♌',
      'Virgo': '♍',
      'Libra': '♎',
      'Scorpio': '♏',
      'Sagittarius': '♐',
      'Capricorn': '♑',
      'Aquarius': '♒',
      'Pisces': '♓'
    };
    
    return symbols[sign] || sign.charAt(0);
  };
  
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  
  // Render component
  return (
    <div className="transit-chart-container">
      {loading && <div className="loading">Loading transit data...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && transitData && (
        <div className="transit-chart-content">
          <div className="transit-date">
            Transit Chart for: {new Date(transitData.transitDate).toLocaleDateString()}
          </div>
          
          <div id="transit-chart-visualization" className="chart-svg-container">
            {/* D3 visualization will be rendered here */}
          </div>
          
          <div className="transit-interpretations">
            <h3>Transit Interpretations</h3>
            
            <div className="overall-interpretation">
              <p>{transitData.interpretations.overall}</p>
            </div>
            
            <div className="aspect-interpretations">
              <h4>Key Transit Aspects</h4>
              <ul>
                {transitData.interpretations.aspects.slice(0, 5).map((aspect, index) => (
                  <li key={index} className="aspect-item">
                    <span className="aspect-title">
                      {aspect.transitPlanet} {config.aspectSymbols[aspect.aspectType]} {aspect.natalPlanet}
                    </span>
                    <span className="aspect-exactness">
                      ({aspect.exactness.toFixed(0)}% {aspect.applying ? 'Applying' : 'Separating'})
                    </span>
                    <p>{aspect.interpretation}</p>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="house-interpretations">
              <h4>Active House Transits</h4>
              {Object.entries(transitData.interpretations.houses).map(([house, data]) => (
                <div key={house} className="house-item">
                  <h5>House {house}</h5>
                  <p>{data.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransitChartVisualization;
