import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ChartVisualization = ({ chartData }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!chartData || !svgRef.current) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG container
    const width = svgRef.current.clientWidth;
    const height = width; // Make it square
    const radius = Math.min(width, height) / 2.5;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Draw the zodiac wheel
    const zodiacColors = {
      Aries: '#FF4136',
      Taurus: '#2ECC40',
      Gemini: '#FFDC00',
      Cancer: '#B10DC9',
      Leo: '#FF851B',
      Virgo: '#7FDBFF',
      Libra: '#F012BE',
      Scorpio: '#111111',
      Sagittarius: '#01FF70',
      Capricorn: '#0074D9',
      Aquarius: '#39CCCC',
      Pisces: '#85144b'
    };
    
    // Create zodiac segments
    const pie = d3.pie()
      .startAngle(0)
      .endAngle(2 * Math.PI)
      .value(1/12)
      .sort(null);
    
    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius);
    
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    const zodiacData = zodiacSigns.map(sign => ({ sign }));
    
    svg.selectAll('.zodiac-segment')
      .data(pie(zodiacData))
      .enter()
      .append('path')
      .attr('class', 'zodiac-segment')
      .attr('d', arc)
      .attr('fill', (d, i) => zodiacColors[zodiacSigns[i]])
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.7);
    
    // Add zodiac symbols
    const symbolArc = d3.arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 0.8);
    
    const zodiacSymbols = {
      Aries: '♈︎',
      Taurus: '♉︎',
      Gemini: '♊︎',
      Cancer: '♋︎',
      Leo: '♌︎',
      Virgo: '♍︎',
      Libra: '♎︎',
      Scorpio: '♏︎',
      Sagittarius: '♐︎',
      Capricorn: '♑︎',
      Aquarius: '♒︎',
      Pisces: '♓︎'
    };
    
    svg.selectAll('.zodiac-symbol')
      .data(pie(zodiacData))
      .enter()
      .append('text')
      .attr('class', 'zodiac-symbol')
      .attr('transform', d => `translate(${symbolArc.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '16px')
      .text((d, i) => zodiacSymbols[zodiacSigns[i]]);
    
    // Draw house cusps
    if (chartData.houses && chartData.houses.length === 12) {
      // Create lines for each house cusp
      chartData.houses.forEach(house => {
        const degree = house.cusp;
        const radian = (90 - degree) * (Math.PI / 180);
        
        svg.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', Math.cos(radian) * radius)
          .attr('y2', -Math.sin(radian) * radius)
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
          .attr('opacity', 0.7);
        
        // Add house number
        const labelRadius = radius * 0.5;
        svg.append('text')
          .attr('x', Math.cos(radian) * labelRadius)
          .attr('y', -Math.sin(radian) * labelRadius)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(house.number);
      });
    }
    
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
    
    // Function to convert zodiac degree to x,y coordinates
    const degreeToXY = (degree, planetRadius) => {
      // Convert from 0° Aries = 0 to standard unit circle
      const radian = (90 - degree) * (Math.PI / 180);
      return {
        x: Math.cos(radian) * planetRadius,
        y: -Math.sin(radian) * planetRadius
      };
    };
    
    // Draw planets
    const planetRadius = radius * 0.4;
    const planetPositions = [];
    
    // First pass: collect all planet positions for collision detection
    Object.entries(chartData.planets).forEach(([planet, data]) => {
      planetPositions.push({
        planet,
        position: data.position,
        xy: degreeToXY(data.position, planetRadius)
      });
    });
    
    // Adjust positions for overlapping planets
    const minDistance = 25; // Minimum distance between planets
    
    for (let i = 0; i < planetPositions.length; i++) {
      for (let j = i + 1; j < planetPositions.length; j++) {
        const p1 = planetPositions[i];
        const p2 = planetPositions[j];
        
        // Calculate distance between planets
        const dx = p2.xy.x - p1.xy.x;
        const dy = p2.xy.y - p1.xy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If planets are too close, adjust position
        if (distance < minDistance) {
          // Move planets apart
          const angle = Math.atan2(dy, dx);
          const moveDistance = (minDistance - distance) / 2;
          
          // Move p1 away from p2
          p1.xy.x -= Math.cos(angle) * moveDistance;
          p1.xy.y -= Math.sin(angle) * moveDistance;
          
          // Move p2 away from p1
          p2.xy.x += Math.cos(angle) * moveDistance;
          p2.xy.y += Math.sin(angle) * moveDistance;
        }
      }
    }
    
    // Draw planets with adjusted positions
    planetPositions.forEach(({ planet, position, xy }) => {
      if (planetSymbols[planet]) {
        // Planet circle
        svg.append('circle')
          .attr('cx', xy.x)
          .attr('cy', xy.y)
          .attr('r', 12)
          .attr('fill', '#fff')
          .attr('stroke', 'black')
          .attr('stroke-width', 1);
        
        // Planet symbol
        svg.append('text')
          .attr('x', xy.x)
          .attr('y', xy.y)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', '#000')
          .attr('font-size', '12px')
          .text(planetSymbols[planet]);
      }
    });
    
    // Draw aspect lines
    if (chartData.aspects && chartData.aspects.length > 0) {
      // Create a dictionary to find planet positions
      const planetDict = {};
      planetPositions.forEach(p => {
        planetDict[p.planet] = p.xy;
      });
      
      // Define aspect colors
      const aspectColors = {
        conjunction: '#fff',
        opposition: '#FF4136',
        trine: '#2ECC40',
        square: '#0074D9',
        sextile: '#FFDC00'
      };
      
      // Draw aspect lines
      chartData.aspects.forEach(aspect => {
        const p1 = planetDict[aspect.planet1];
        const p2 = planetDict[aspect.planet2];
        
        if (p1 && p2) {
          svg.append('line')
            .attr('x1', p1.x)
            .attr('y1', p1.y)
            .attr('x2', p2.x)
            .attr('y2', p2.y)
            .attr('stroke', aspectColors[aspect.aspectType] || '#fff')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', aspect.aspectType === 'conjunction' ? 'none' : '3,3')
            .attr('opacity', 0.6);
        }
      });
    }
    
    // Add ascendant marker
    if (chartData.ascendant) {
      const ascPos = degreeToXY(chartData.ascendant, radius);
      
      svg.append('circle')
        .attr('cx', ascPos.x)
        .attr('cy', ascPos.y)
        .attr('r', 5)
        .attr('fill', 'red');
      
      svg.append('text')
        .attr('x', ascPos.x)
        .attr('y', ascPos.y - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '14px')
        .text('ASC');
    }
    
  }, [chartData]);
  
  return (
    <div className="chart-container w-full">
      <svg ref={svgRef} className="w-full max-w-2xl mx-auto"></svg>
    </div>
  );
};

export default ChartVisualization;
