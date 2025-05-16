import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ChartVisualizationProps {
  chartData: {
    planets: {
      name: string;
      longitude: number;
      degree: number;
      sign: string;
      house: number;
      isRetrograde?: boolean;
    }[];
    houses: {
      house: number;
      longitude: number;
      sign: string;
      degree: number;
    }[];
    aspects: {
      planet1: string;
      planet2: string;
      type: string;
      orb: number;
    }[];
    points: {
      ascendant: {
        longitude: number;
        sign: string;
        degree: number;
      };
      mc: {
        longitude: number;
        sign: string;
        degree: number;
      };
    };
  };
}

const ChartVisualization: React.FC<ChartVisualizationProps> = ({ chartData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Planet symbols
  const planetSymbols: Record<string, string> = {
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
    'North Node': '☊',
    'Chiron': '⚷',
    'Ascendant': 'Asc',
    'MC': 'MC'
  };
  
  // Zodiac symbols
  const zodiacSymbols: Record<string, string> = {
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
  
  // Aspect symbols
  const aspectSymbols: Record<string, string> = {
    'Conjunction': '☌',
    'Sextile': '⚹',
    'Square': '□',
    'Trine': '△',
    'Opposition': '☍'
  };
  
  // Element colors
  const elementColors: Record<string, string> = {
    'Fire': '#FF4500',
    'Earth': '#8B4513',
    'Air': '#87CEEB',
    'Water': '#1E90FF'
  };
  
  // Sign to element mapping
  const signElements: Record<string, string> = {
    'Aries': 'Fire',
    'Taurus': 'Earth',
    'Gemini': 'Air',
    'Cancer': 'Water',
    'Leo': 'Fire',
    'Virgo': 'Earth',
    'Libra': 'Air',
    'Scorpio': 'Water',
    'Sagittarius': 'Fire',
    'Capricorn': 'Earth',
    'Aquarius': 'Air',
    'Pisces': 'Water'
  };
  
  // Aspect colors
  const aspectColors: Record<string, string> = {
    'Conjunction': '#FFD700',
    'Sextile': '#90EE90',
    'Square': '#FF6347',
    'Trine': '#4682B4',
    'Opposition': '#BA55D3'
  };
  
  useEffect(() => {
    if (!svgRef.current || !chartData) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Chart dimensions
    const width = 600;
    const height = 600;
    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;
    
    // Center point
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${centerX}, ${centerY})`);
    
    // Draw outer circle (the chart boundary)
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 2);
    
    // Draw inner circle (represents the native)
    svg.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius * 0.1)
      .attr('fill', '#222')
      .attr('stroke', '#444')
      .attr('stroke-width', 1);
    
    // Draw zodiac wheel (12 signs, 30 degrees each)
    const zodiacRadius = radius * 0.85;
    const signArcGenerator = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius);
    
    // Create the 12 sign segments
    const zodiacSigns = Array.from({ length: 12 }, (_, i) => {
      const sign = Object.keys(zodiacSymbols)[i];
      return {
        index: i,
        name: sign,
        element: signElements[sign],
        startAngle: (i * 30 - 90) * (Math.PI / 180),
        endAngle: ((i + 1) * 30 - 90) * (Math.PI / 180),
      };
    });
    
    // Draw the zodiac wheel segments
    svg.selectAll('.zodiac-sign')
      .data(zodiacSigns)
      .enter()
      .append('path')
      .attr('class', 'zodiac-sign')
      .attr('d', (d: any) => signArcGenerator(d))
      .attr('fill', (d: any) => {
        const element = signElements[d.name];
        // Create a lighter shade for the background
        const color = d3.color(elementColors[element]);
        if (color) {
          color.opacity = 0.2;
          return color.toString();
        }
        return '#333';
      })
      .attr('stroke', '#444')
      .attr('stroke-width', 1);
    
    // Add zodiac symbols
    svg.selectAll('.zodiac-symbol')
      .data(zodiacSigns)
      .enter()
      .append('text')
      .attr('class', 'zodiac-symbol')
      .attr('x', (d: any) => {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        return Math.cos(midAngle) * (radius * 0.9);
      })
      .attr('y', (d: any) => {
        const midAngle = (d.startAngle + d.endAngle) / 2;
        return Math.sin(midAngle) * (radius * 0.9);
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', 'white')
      .attr('font-size', '20px')
      .text((d: any) => zodiacSymbols[d.name]);
    
    // Draw house cusps
    if (chartData.houses && chartData.houses.length === 12) {
      // Sort houses by longitude for proper drawing
      const sortedHouses = [...chartData.houses].sort((a, b) => a.longitude - b.longitude);
      
      // Draw house cusp lines
      svg.selectAll('.house-cusp')
        .data(sortedHouses)
        .enter()
        .append('line')
        .attr('class', 'house-cusp')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', (d: any) => {
          // Convert astronomical longitude to chart angle (0° Aries at top)
          const angle = (d.longitude - 90) * (Math.PI / 180);
          return Math.cos(angle) * radius;
        })
        .attr('y2', (d: any) => {
          const angle = (d.longitude - 90) * (Math.PI / 180);
          return Math.sin(angle) * radius;
        })
        .attr('stroke', '#777')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '5,5');
      
      // Add house numbers near the cusps
      svg.selectAll('.house-number')
        .data(sortedHouses)
        .enter()
        .append('text')
        .attr('class', 'house-number')
        .attr('x', (d: any) => {
          const angle = (d.longitude - 90) * (Math.PI / 180);
          return Math.cos(angle) * (radius * 0.65);
        })
        .attr('y', (d: any) => {
          const angle = (d.longitude - 90) * (Math.PI / 180);
          return Math.sin(angle) * (radius * 0.65);
        })
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text((d: any) => d.house);
    }
    
    // Plot planets
    if (chartData.planets && chartData.planets.length > 0) {
      // Add Ascendant and MC to the planets array for plotting
      const allPoints = [
        ...chartData.planets,
        {
          name: 'Ascendant',
          longitude: chartData.points.ascendant.longitude,
          degree: chartData.points.ascendant.degree,
          sign: chartData.points.ascendant.sign,
          house: 1
        },
        {
          name: 'MC',
          longitude: chartData.points.mc.longitude,
          degree: chartData.points.mc.degree,
          sign: chartData.points.mc.sign,
          house: 10
        }
      ];
      
      // Group planets by their position to handle close positions
      const positionGroups: Record<string, Array<any>> = {};
      const positionResolution = 5; // Group planets within 5 degrees
      
      allPoints.forEach(planet => {
        const positionKey = Math.floor(planet.longitude / positionResolution) * positionResolution;
        if (!positionGroups[positionKey]) {
          positionGroups[positionKey] = [];
        }
        positionGroups[positionKey].push(planet);
      });
      
      // For each group, adjust positions to avoid overlap
      Object.values(positionGroups).forEach(group => {
        if (group.length > 1) {
          // Adjust radial positions for planets in the same group
          const baseRadius = radius * 0.5;
          const radiusStep = radius * 0.06;
          
          group.forEach((planet, i) => {
            planet.adjustedRadius = baseRadius + i * radiusStep;
          });
        } else if (group.length === 1) {
          group[0].adjustedRadius = radius * 0.5;
        }
      });
      
      // Flatten the groups back to a list
      const adjustedPoints = Object.values(positionGroups).flat();
      
      // Draw planet symbols
      svg.selectAll('.planet')
        .data(adjustedPoints)
        .enter()
        .append('g')
        .attr('class', 'planet')
        .attr('transform', (d: any) => {
          const angle = (d.longitude - 90) * (Math.PI / 180);
          const planetRadius = d.adjustedRadius || radius * 0.5;
          const x = Math.cos(angle) * planetRadius;
          const y = Math.sin(angle) * planetRadius;
          return `translate(${x},${y})`;
        })
        .each(function(d: any) {
          // Add circle background for the planet
          d3.select(this)
            .append('circle')
            .attr('r', 13)
            .attr('fill', '#222')
            .attr('stroke', d.isRetrograde ? '#FF6347' : 'white')
            .attr('stroke-width', 1.5);
          
          // Add planet symbol
          d3.select(this)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('fill', 'white')
            .attr('font-size', '16px')
            .text(planetSymbols[d.name] || d.name.substring(0, 1));
        });
      
      // Add planet descriptions outside the chart
      const descriptionArea = d3.select(svgRef.current)
        .append('g')
        .attr('transform', `translate(${width + 10}, 20)`);
      
      chartData.planets.forEach((planet, i) => {
        const group = descriptionArea.append('g')
          .attr('transform', `translate(0, ${i * 25})`);
        
        group.append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('fill', 'white')
          .attr('font-size', '14px')
          .text(`${planetSymbols[planet.name] || planet.name}: ${planet.sign} ${planet.degree.toFixed(1)}° (${planet.isRetrograde ? 'R' : ''})`);
      });
    }
    
    // Draw aspects
    if (chartData.aspects && chartData.aspects.length > 0) {
      // Create a lookup map for planet positions
      const planetLongitudes: Record<string, number> = {};
      
      [...chartData.planets, 
        {
          name: 'Ascendant',
          longitude: chartData.points.ascendant.longitude
        },
        {
          name: 'MC',
          longitude: chartData.points.mc.longitude
        }
      ].forEach((planet: any) => {
        planetLongitudes[planet.name] = planet.longitude;
      });
      
      // Draw aspect lines
      svg.selectAll('.aspect')
        .data(chartData.aspects)
        .enter()
        .append('line')
        .attr('class', 'aspect')
        .attr('x1', (d: any) => {
          const angle = (planetLongitudes[d.planet1] - 90) * (Math.PI / 180);
          return Math.cos(angle) * (radius * 0.3);
        })
        .attr('y1', (d: any) => {
          const angle = (planetLongitudes[d.planet1] - 90) * (Math.PI / 180);
          return Math.sin(angle) * (radius * 0.3);
        })
        .attr('x2', (d: any) => {
          const angle = (planetLongitudes[d.planet2] - 90) * (Math.PI / 180);
          return Math.cos(angle) * (radius * 0.3);
        })
        .attr('y2', (d: any) => {
          const angle = (planetLongitudes[d.planet2] - 90) * (Math.PI / 180);
          return Math.sin(angle) * (radius * 0.3);
        })
        .attr('stroke', (d: any) => aspectColors[d.type] || '#999')
        .attr('stroke-width', (d: any) => {
          // Stronger aspects have thicker lines
          return 5 - Math.min(d.orb, 4);
        })
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', (d: any) => {
          // Different line styles for different aspect types
          if (d.type === 'Square' || d.type === 'Opposition') {
            return '3,3';
          }
          return null;
        });
    }
    
  }, [chartData]);
  
  return (
    <div className="chart-visualization relative">
      <svg 
        ref={svgRef} 
        className="mx-auto"
        style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
      ></svg>
    </div>
  );
};

export default ChartVisualization;
