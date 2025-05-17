import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ChartComparisonView = ({ chartA, chartB }) => {
  const [activeTab, setActiveTab] = useState('aspects');
  const chartContainerRef = useRef(null);
  
  // Draw the comparison chart
  useEffect(() => {
    if (!chartContainerRef.current || !chartA || !chartB) return;
    
    // Clear previous chart
    d3.select(chartContainerRef.current).selectAll('*').remove();
    
    // Create SVG container
    const width = chartContainerRef.current.clientWidth;
    const height = 500;
    const radius = Math.min(width, height) / 3;
    
    const svg = d3.select(chartContainerRef.current)
      .append('svg')
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
      .innerRadius(radius * 0.7)
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
      .innerRadius(radius * 0.85)
      .outerRadius(radius * 0.85);
    
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
    
    // Colors for each chart
    const chartAColor = '#FF4136';
    const chartBColor = '#0074D9';
    
    // Chart A planets
    const planetsA = chartA.chartData.planets;
    
    // Chart B planets
    const planetsB = chartB.chartData.planets;
    
    // Function to convert zodiac degree to x,y coordinates
    const degreeToXY = (degree, planetRadius) => {
      // Convert from 0° Aries = 0 to standard unit circle
      const radian = (90 - degree) * (Math.PI / 180);
      return {
        x: Math.cos(radian) * planetRadius,
        y: -Math.sin(radian) * planetRadius
      };
    };
    
    // Draw planets for Chart A
    const planetRadiusA = radius * 0.5;
    
    Object.entries(planetsA).forEach(([planet, data]) => {
      if (planetSymbols[planet]) {
        const pos = degreeToXY(data.position, planetRadiusA);
        
        // Planet circle
        svg.append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('r', 12)
          .attr('fill', chartAColor)
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('opacity', 0.8);
        
        // Planet symbol
        svg.append('text')
          .attr('x', pos.x)
          .attr('y', pos.y)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(planetSymbols[planet]);
      }
    });
    
    // Draw planets for Chart B
    const planetRadiusB = radius * 0.3;
    
    Object.entries(planetsB).forEach(([planet, data]) => {
      if (planetSymbols[planet]) {
        const pos = degreeToXY(data.position, planetRadiusB);
        
        // Planet circle
        svg.append('circle')
          .attr('cx', pos.x)
          .attr('cy', pos.y)
          .attr('r', 12)
          .attr('fill', chartBColor)
          .attr('stroke', 'black')
          .attr('stroke-width', 1)
          .attr('opacity', 0.8);
        
        // Planet symbol
        svg.append('text')
          .attr('x', pos.x)
          .attr('y', pos.y)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('font-size', '12px')
          .text(planetSymbols[planet]);
      }
    });
    
    // Add legend
    svg.append('circle')
      .attr('cx', -width / 2 + 20)
      .attr('cy', -height / 2 + 20)
      .attr('r', 8)
      .attr('fill', chartAColor);
    
    svg.append('text')
      .attr('x', -width / 2 + 35)
      .attr('y', -height / 2 + 25)
      .attr('text-anchor', 'start')
      .attr('fill', 'white')
      .text(chartA.name);
    
    svg.append('circle')
      .attr('cx', -width / 2 + 20)
      .attr('cy', -height / 2 + 45)
      .attr('r', 8)
      .attr('fill', chartBColor);
    
    svg.append('text')
      .attr('x', -width / 2 + 35)
      .attr('y', -height / 2 + 50)
      .attr('text-anchor', 'start')
      .attr('fill', 'white')
      .text(chartB.name);
    
  }, [chartA, chartB]);
  
  // Calculate synastry aspects between two charts
  const calculateSynastryAspects = () => {
    if (!chartA || !chartB) return [];
    
    const aspects = [];
    const planetsA = chartA.chartData.planets;
    const planetsB = chartB.chartData.planets;
    
    // Define aspect types and their orbs
    const aspectTypes = {
      conjunction: { angle: 0, orb: 8, interpretation: 'Strong connection' },
      opposition: { angle: 180, orb: 8, interpretation: 'Challenging dynamic' },
      trine: { angle: 120, orb: 5, interpretation: 'Harmonious flow' },
      square: { angle: 90, orb: 5, interpretation: 'Dynamic tension' },
      sextile: { angle: 60, orb: 4, interpretation: 'Opportunity for growth' }
    };
    
    // Loop through Chart A planets
    Object.entries(planetsA).forEach(([planetA, dataA]) => {
      // Loop through Chart B planets
      Object.entries(planetsB).forEach(([planetB, dataB]) => {
        // Calculate the angle between the planets
        let angle = Math.abs(dataA.position - dataB.position);
        
        // Normalize the angle to be within 0-180 degrees
        if (angle > 180) angle = 360 - angle;
        
        // Check for aspects
        Object.entries(aspectTypes).forEach(([aspectType, aspectData]) => {
          const difference = Math.abs(angle - aspectData.angle);
          
          if (difference <= aspectData.orb) {
            aspects.push({
              planetA,
              planetB,
              aspect: aspectType,
              angle: aspectData.angle,
              orb: difference.toFixed(1),
              interpretation: `${planetA} ${aspectType} ${planetB}: ${aspectData.interpretation}`
            });
          }
        });
      });
    });
    
    return aspects;
  };
  
  const synastryAspects = calculateSynastryAspects();
  
  // Calculate planetary compatibility score (simplified version)
  const calculateCompatibilityScore = () => {
    if (!synastryAspects.length) return 0;
    
    // Assign points to different aspect types
    const aspectPoints = {
      conjunction: 5,
      trine: 4,
      sextile: 3,
      square: -2,
      opposition: -1
    };
    
    // Give extra points to significant planet pairs
    const significantPairs = [
      ['Sun', 'Moon'],
      ['Venus', 'Mars'],
      ['Sun', 'Venus'],
      ['Moon', 'Venus']
    ];
    
    let totalPoints = 0;
    let maxPossiblePoints = 0;
    
    synastryAspects.forEach(aspect => {
      // Base points from aspect type
      let points = aspectPoints[aspect.aspect] || 0;
      
      // Check if this is a significant planetary pair (in either direction)
      const isPairSignificant = significantPairs.some(
        pair => (pair[0] === aspect.planetA && pair[1] === aspect.planetB) ||
                (pair[0] === aspect.planetB && pair[1] === aspect.planetA)
      );
      
      if (isPairSignificant) {
        points *= 2; // Double points for significant pairs
      }
      
      totalPoints += points;
      maxPossiblePoints += Math.abs(points);
    });
    
    // Convert to a percentage (0-100)
    const normalizedScore = 50 + (totalPoints * 50 / maxPossiblePoints);
    
    // Ensure the score is between 0 and 100
    return Math.min(100, Math.max(0, Math.round(normalizedScore)));
  };
  
  const compatibilityScore = calculateCompatibilityScore();
  
  return (
    <div>
      <div className="flex justify-between mb-6">
        <div className="bg-night-700 rounded-lg p-4 flex-1 mx-2">
          <h2 className="text-xl font-bold text-primary-300 mb-2">{chartA.name}</h2>
          <div className="text-sm text-night-300">
            <p>Born: {new Date(chartA.birthDate).toLocaleDateString()}</p>
            <p>Location: {chartA.birthPlace}</p>
          </div>
        </div>
        
        <div className="text-center flex-1 mx-2">
          <div className="bg-night-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-night-200 mb-2">Compatibility</h3>
            <div className="text-4xl font-bold text-primary-400 mb-1">{compatibilityScore}%</div>
            <div className="w-full bg-night-600 rounded-full h-3">
              <div 
                className="bg-primary-500 h-3 rounded-full" 
                style={{ width: `${compatibilityScore}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="bg-night-700 rounded-lg p-4 flex-1 mx-2">
          <h2 className="text-xl font-bold text-primary-300 mb-2">{chartB.name}</h2>
          <div className="text-sm text-night-300">
            <p>Born: {new Date(chartB.birthDate).toLocaleDateString()}</p>
            <p>Location: {chartB.birthPlace}</p>
          </div>
        </div>
      </div>
      
      {/* Chart Visualization */}
      <div className="mb-8">
        <div ref={chartContainerRef} className="w-full h-[500px]"></div>
      </div>
      
      {/* Tabs Navigation */}
      <div className="border-b border-night-600 mb-6">
        <nav className="flex -mb-px">
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'aspects' 
                ? 'border-primary-400 text-primary-300' 
                : 'border-transparent text-night-300 hover:text-night-100'
            }`}
            onClick={() => setActiveTab('aspects')}
          >
            Synastry Aspects
          </button>
          
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'planets' 
                ? 'border-primary-400 text-primary-300' 
                : 'border-transparent text-night-300 hover:text-night-100'
            }`}
            onClick={() => setActiveTab('planets')}
          >
            Planetary Positions
          </button>
          
          <button
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'report' 
                ? 'border-primary-400 text-primary-300' 
                : 'border-transparent text-night-300 hover:text-night-100'
            }`}
            onClick={() => setActiveTab('report')}
          >
            Compatibility Report
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div className="bg-night-700 rounded-lg p-6">
        {activeTab === 'aspects' && (
          <div>
            <h3 className="text-xl font-semibold text-night-200 mb-4">Synastry Aspects</h3>
            
            {synastryAspects.length === 0 ? (
              <p className="text-night-300">No significant aspects found between these charts.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {synastryAspects.map((aspect, index) => (
                  <div key={index} className="bg-night-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-primary-300 font-medium">{aspect.planetA}</span>
                        <span className="text-night-300 mx-2">→</span>
                        <span className="text-primary-300 font-medium">{aspect.planetB}</span>
                      </div>
                      <div className="text-night-400 text-sm">
                        {aspect.aspect} ({aspect.orb}° orb)
                      </div>
                    </div>
                    <p className="text-night-200">{aspect.interpretation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'planets' && (
          <div>
            <h3 className="text-xl font-semibold text-night-200 mb-4">Planetary Positions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chart A Planets */}
              <div>
                <h4 className="text-lg font-medium text-primary-300 mb-3">{chartA.name}</h4>
                <div className="space-y-2">
                  {Object.entries(chartA.chartData.planets).map(([planet, data]) => (
                    <div key={planet} className="flex justify-between bg-night-800 p-2 rounded">
                      <span className="text-night-200">{planet}</span>
                      <span className="text-night-300">
                        {Math.floor(data.position / 30)}° {Math.round(data.position % 30)}' 
                        {zodiacSigns[Math.floor(data.position / 30)]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Chart B Planets */}
              <div>
                <h4 className="text-lg font-medium text-primary-300 mb-3">{chartB.name}</h4>
                <div className="space-y-2">
                  {Object.entries(chartB.chartData.planets).map(([planet, data]) => (
                    <div key={planet} className="flex justify-between bg-night-800 p-2 rounded">
                      <span className="text-night-200">{planet}</span>
                      <span className="text-night-300">
                        {Math.floor(data.position / 30)}° {Math.round(data.position % 30)}' 
                        {zodiacSigns[Math.floor(data.position / 30)]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'report' && (
          <div>
            <h3 className="text-xl font-semibold text-night-200 mb-4">Compatibility Report</h3>
            
            <div className="bg-night-800 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium text-primary-300 mb-3">Overview</h4>
              <p className="text-night-200 mb-4">
                The synastry between {chartA.name} and {chartB.name} reveals a 
                {compatibilityScore >= 80 ? ' highly compatible' : 
                 compatibilityScore >= 60 ? ' compatible' : 
                 compatibilityScore >= 40 ? ' moderately compatible' : 
                 ' challenging'} relationship with a compatibility score of {compatibilityScore}%.
              </p>
              
              {synastryAspects.length > 0 && (
                <div className="mt-4">
                  <p className="text-night-200">
                    The analysis shows {synastryAspects.length} significant planetary connections, 
                    which suggest areas of harmony, growth, and potential challenges in this relationship.
                  </p>
                </div>
              )}
            </div>
            
            <div className="bg-night-800 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium text-primary-300 mb-3">Key Planetary Connections</h4>
              
              {synastryAspects
                .filter(aspect => ['Sun', 'Moon', 'Venus', 'Mars'].includes(aspect.planetA) &&
                                ['Sun', 'Moon', 'Venus', 'Mars'].includes(aspect.planetB))
                .map((aspect, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <h5 className="font-medium text-night-100 mb-1">
                      {aspect.planetA} {aspect.aspect} {aspect.planetB}
                    </h5>
                    <p className="text-night-300">{aspect.interpretation}</p>
                  </div>
                ))}
              
              {!synastryAspects.some(aspect => 
                ['Sun', 'Moon', 'Venus', 'Mars'].includes(aspect.planetA) &&
                ['Sun', 'Moon', 'Venus', 'Mars'].includes(aspect.planetB)
              ) && (
                <p className="text-night-300">No major connections found between personal planets.</p>
              )}
            </div>
            
            <div className="bg-night-800 rounded-lg p-6">
              <h4 className="text-lg font-medium text-primary-300 mb-3">Relationship Dynamics</h4>
              
              <p className="text-night-200 mb-4">
                Based on the planetary aspects between these charts, this relationship is characterized by:
              </p>
              
              <ul className="space-y-2 text-night-300">
                {compatibilityScore >= 60 && (
                  <>
                    <li>• Strong emotional connection</li>
                    <li>• Good communication potential</li>
                  </>
                )}
                
                {(compatibilityScore >= 40 && compatibilityScore < 70) && (
                  <>
                    <li>• Some areas of natural harmony</li>
                    <li>• Growth opportunities through differences</li>
                  </>
                )}
                
                {compatibilityScore < 50 && (
                  <>
                    <li>• Challenging dynamic that may require effort</li>
                    <li>• Potential for growth through resolving tensions</li>
                  </>
                )}
                
                <li>• {synastryAspects.filter(a => a.aspect === 'conjunction').length} areas of strong connection</li>
                <li>• {synastryAspects.filter(a => ['trine', 'sextile'].includes(a.aspect)).length} harmonious aspects</li>
                <li>• {synastryAspects.filter(a => ['square', 'opposition'].includes(a.aspect)).length} challenging aspects</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartComparisonView;
