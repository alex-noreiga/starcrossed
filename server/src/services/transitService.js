const swisseph = require('swisseph');
const { ApiError } = require('../utils/errorHandler');
const calculationService = require('./calculationService');

/**
 * Service for transit calculations and analysis
 */
class TransitService {
  constructor() {
    // Reference the main calculation service for shared functionality
    this.calculationService = calculationService;
    this.swe = calculationService.swe;
    this.planets = calculationService.planets;
    this.aspects = calculationService.aspects;
    this.zodiacSigns = calculationService.zodiacSigns;
    
    // Transit-specific aspect orbs (typically tighter than natal chart)
    this.transitAspects = {
      conjunction: { angle: 0, orb: 2 },
      opposition: { angle: 180, orb: 2 },
      trine: { angle: 120, orb: 1.5 },
      square: { angle: 90, orb: 1.5 },
      sextile: { angle: 60, orb: 1 }
    };
    
    // Significant transit bodies (usually exclude outer planets for faster-moving transits)
    this.transitBodies = {
      Sun: this.swe.SE_SUN,
      Moon: this.swe.SE_MOON,
      Mercury: this.swe.SE_MERCURY,
      Venus: this.swe.SE_VENUS,
      Mars: this.swe.SE_MARS,
      Jupiter: this.swe.SE_JUPITER,
      Saturn: this.swe.SE_SATURN,
      Uranus: this.swe.SE_URANUS,
      Neptune: this.swe.SE_NEPTUNE,
      Pluto: this.swe.SE_PLUTO,
      // Additional points for transit analysis
      'North Node': this.swe.SE_TRUE_NODE
    };
    
    console.log('Transit Service Initialized');
  }
  
  /**
   * Calculate current transits relative to a birth chart
   * 
   * @param {Object} birthChart - Birth chart data
   * @param {Date} [transitDate] - Transit date (defaults to current date)
   * @returns {Object} Transit data
   */
  calculateCurrentTransits(birthChart, transitDate = new Date()) {
    try {
      // Convert transit date to Julian day
      const year = transitDate.getFullYear();
      const month = transitDate.getMonth() + 1; // JavaScript months are 0-based
      const day = transitDate.getDate();
      const hour = transitDate.getHours();
      const minute = transitDate.getMinutes();
      
      const transitJulianDay = this.swe.swe_julday(
        year, month, day, hour + minute/60, this.swe.SE_GREG_CAL
      );
      
      // Calculate current planetary positions
      const transitPositions = this.calculateTransitPositions(transitJulianDay);
      
      // Calculate aspects between transit and natal planets
      const transitAspects = this.calculateTransitAspects(
        birthChart.planets, transitPositions
      );
      
      // Identify active house transits
      const houseTransits = this.calculateHouseTransits(
        transitPositions, birthChart.houses
      );
      
      // Generate interpretations
      const interpretations = this.generateTransitInterpretations(
        transitPositions, birthChart, transitAspects, houseTransits, transitDate
      );
      
      return {
        transitDate: transitDate.toISOString(),
        transitJulianDay,
        transitPositions,
        transitAspects,
        houseTransits,
        interpretations
      };
    } catch (error) {
      console.error('Error calculating transits:', error);
      throw new ApiError(500, 'Failed to calculate transit chart');
    }
  }
  
  /**
   * Calculate planetary positions for a transit date
   * 
   * @param {number} julianDay - Julian day for transit date
   * @returns {Object} Planetary positions
   */
  calculateTransitPositions(julianDay) {
    const positions = {};
    
    // Calculate position for each transit body
    Object.entries(this.transitBodies).forEach(([name, index]) => {
      try {
        // Calculate position using Swiss Ephemeris
        const { xx } = this.swe.swe_calc_ut(julianDay, index, this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED);
        
        // Normalize longitude to 0-360 range
        const longitude = xx[0] % 360;
        
        // Check if retrograde
        const isRetrograde = xx[3] < 0;
        const sign = this.zodiacSigns[Math.floor(longitude / 30)];
        const signDegree = longitude % 30;
        
        positions[name] = {
          position: longitude,
          retrograde: isRetrograde,
          speed: xx[3],
          sign,
          signDegree: parseFloat(signDegree.toFixed(2))
        };
      } catch (error) {
        console.error(`Error calculating transit position for ${name}:`, error);
        
        // Use fallback position
        const fallbackPosition = this.calculationService.getSimplifiedPlanetPosition(name, julianDay);
        const sign = this.zodiacSigns[Math.floor(fallbackPosition / 30)];
        const signDegree = fallbackPosition % 30;
        
        positions[name] = {
          position: fallbackPosition,
          retrograde: false,
          speed: 0,
          sign,
          signDegree: parseFloat(signDegree.toFixed(2))
        };
      }
    });
    
    return positions;
  }
  
  /**
   * Calculate aspects between transit and natal planets
   * 
   * @param {Object} natalPlanets - Natal planetary positions
   * @param {Object} transitPlanets - Transit planetary positions
   * @returns {Array} Transit aspects
   */
  calculateTransitAspects(natalPlanets, transitPlanets) {
    const aspects = [];
    
    // Check aspects between transit and natal planets
    Object.entries(transitPlanets).forEach(([transitPlanet, transitData]) => {
      const transitPos = transitData.position;
      
      Object.entries(natalPlanets).forEach(([natalPlanet, natalData]) => {
        const natalPos = natalData.position;
        
        // Calculate angle between planets
        let angle = Math.abs(transitPos - natalPos);
        
        // Normalize to 0-180 range
        if (angle > 180) {
          angle = 360 - angle;
        }
        
        // Check if it makes an aspect
        Object.entries(this.transitAspects).forEach(([aspectType, aspectData]) => {
          const orb = Math.abs(angle - aspectData.angle);
          
          if (orb <= aspectData.orb) {
            // Calculate exactness as percentage (100% = exact aspect)
            const exactness = 100 - (orb / aspectData.orb * 100);
            
            // Determine if aspect is applying or separating
            const isApplying = this.isAspectApplying(
              transitPos, natalPos, transitData.speed, aspectData.angle
            );
            
            aspects.push({
              transitPlanet,
              natalPlanet,
              aspectType,
              angle: aspectData.angle,
              orb: parseFloat(orb.toFixed(2)),
              exactness: parseFloat(exactness.toFixed(2)),
              applying: isApplying,
              separating: !isApplying
            });
          }
        });
      });
    });
    
    // Sort aspects by exactness (most exact first)
    return aspects.sort((a, b) => b.exactness - a.exactness);
  }
  
  /**
   * Determine if an aspect is applying (getting closer) or separating
   * 
   * @param {number} transitPos - Transit planet position
   * @param {number} natalPos - Natal planet position
   * @param {number} transitSpeed - Transit planet speed
   * @param {number} aspectAngle - Aspect angle
   * @returns {boolean} True if aspect is applying
   */
  isAspectApplying(transitPos, natalPos, transitSpeed, aspectAngle) {
    // Simplified logic: if transit planet is moving toward aspect, it's applying
    // Note: This is a simplified approach that works for most cases but not all
    
    // For conjunction (0°), planets are moving toward each other if distance is decreasing
    if (aspectAngle === 0) {
      let distance = Math.abs(transitPos - natalPos);
      if (distance > 180) distance = 360 - distance;
      
      // If transit is retrograde, the aspect is applying if transit > natal
      if (transitSpeed < 0) {
        return transitPos > natalPos;
      } else {
        return transitPos < natalPos;
      }
    }
    
    // For opposition (180°), we need to calculate if moving toward 180° difference
    if (aspectAngle === 180) {
      let distance = Math.abs(transitPos - natalPos);
      
      // If transit is retrograde, the aspect is applying if distance is decreasing
      if (transitSpeed < 0) {
        return distance < 180;
      } else {
        return distance > 180;
      }
    }
    
    // For other aspects, this gets complex and would require vector math
    // Using a simplified approach based on relative position
    const targetPos = (natalPos + aspectAngle) % 360;
    
    if (transitSpeed < 0) {
      // Retrograde: applying if transit > target > natal
      return (transitPos > targetPos && targetPos > natalPos) ||
             (transitPos > targetPos && natalPos > transitPos) ||
             (targetPos > natalPos && natalPos > transitPos);
    } else {
      // Direct: applying if transit < target < natal
      return (transitPos < targetPos && targetPos < natalPos) ||
             (transitPos < targetPos && natalPos < transitPos) ||
             (targetPos < natalPos && natalPos < transitPos);
    }
  }
  
  /**
   * Calculate which houses are being transited
   * 
   * @param {Object} transitPositions - Transit planet positions
   * @param {Array} houses - Natal houses
   * @returns {Object} House transits
   */
  calculateHouseTransits(transitPositions, houses) {
    const houseTransits = {};
    
    Object.entries(transitPositions).forEach(([planet, data]) => {
      const position = data.position;
      
      // Find which house contains this position
      let houseIndex = -1;
      
      for (let i = 0; i < houses.length; i++) {
        const currentHouse = houses[i];
        const nextHouse = houses[(i + 1) % houses.length];
        
        // Calculate house span, considering houses that cross 0°
        let start = currentHouse.cusp;
        let end = nextHouse.cusp;
        
        if (end < start) {
          end += 360;
        }
        
        // Normalize position to match house span
        let normalizedPosition = position;
        if (position < start && position < end) {
          normalizedPosition += 360;
        }
        
        // Check if position is in this house
        if (normalizedPosition >= start && normalizedPosition < end) {
          houseIndex = i;
          break;
        }
      }
      
      // Add to house transits
      if (houseIndex !== -1) {
        const houseNumber = houseIndex + 1;
        
        if (!houseTransits[houseNumber]) {
          houseTransits[houseNumber] = [];
        }
        
        houseTransits[houseNumber].push({
          planet,
          position: data.position,
          sign: data.sign,
          retrograde: data.retrograde
        });
      }
    });
    
    return houseTransits;
  }
  
  /**
   * Generate transit forecasts for a specific time period
   * 
   * @param {Object} birthChart - Birth chart data
   * @param {Date} startDate - Start date for forecast
   * @param {Date} endDate - End date for forecast
   * @param {number} [interval=1] - Interval in days
   * @returns {Array} Transit forecast data
   */
  generateTransitForecast(birthChart, startDate, endDate, interval = 1) {
    try {
      const forecast = [];
      const currentDate = new Date(startDate);
      
      // Loop through each day in the time period
      while (currentDate <= endDate) {
        // Calculate transits for this day
        const transits = this.calculateCurrentTransits(birthChart, new Date(currentDate));
        
        // Filter for significant transits only
        const significantTransits = this.filterSignificantTransits(transits.transitAspects);
        
        if (significantTransits.length > 0) {
          forecast.push({
            date: new Date(currentDate).toISOString(),
            transits: significantTransits,
            interpretation: this.generateDailyTransitSummary(significantTransits)
          });
        }
        
        // Move to next interval
        currentDate.setDate(currentDate.getDate() + interval);
      }
      
      return forecast;
    } catch (error) {
      console.error('Error generating transit forecast:', error);
      throw new ApiError(500, 'Failed to generate transit forecast');
    }
  }
  
  /**
   * Filter for significant transits only
   * 
   * @param {Array} aspects - Transit aspects
   * @returns {Array} Significant transits
   */
  filterSignificantTransits(aspects) {
    // Prioritize:
    // 1. Exact aspects (high exactness)
    // 2. Aspects involving personal planets (Sun, Moon, Mercury, Venus, Mars)
    // 3. Major aspects (conjunction, opposition, square)
    
    const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    const majorAspects = ['conjunction', 'opposition', 'square'];
    
    // Filter for significant aspects
    return aspects.filter(aspect => {
      // Include exact aspects
      if (aspect.exactness > 90) return true;
      
      // Include aspects involving personal planets
      if (personalPlanets.includes(aspect.transitPlanet) && 
          personalPlanets.includes(aspect.natalPlanet) &&
          aspect.exactness > 75) return true;
      
      // Include major aspects involving at least one personal planet
      if (majorAspects.includes(aspect.aspectType) &&
          (personalPlanets.includes(aspect.transitPlanet) || 
           personalPlanets.includes(aspect.natalPlanet)) &&
          aspect.exactness > 80) return true;
      
      return false;
    });
  }
  
  /**
   * Calculate transit calendar data for visualization
   * 
   * @param {Object} birthChart - Birth chart data
   * @param {Date} startDate - Start date for calendar
   * @param {number} days - Number of days to include
   * @returns {Object} Transit calendar data
   */
  calculateTransitCalendar(birthChart, startDate, days = 30) {
    try {
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      
      const forecast = this.generateTransitForecast(birthChart, startDate, endDate);
      
      // Group by date for calendar view
      const calendarData = {};
      
      forecast.forEach(day => {
        const dateStr = day.date.split('T')[0]; // YYYY-MM-DD format
        
        if (!calendarData[dateStr]) {
          calendarData[dateStr] = {
            date: dateStr,
            intensity: 0,
            aspects: []
          };
        }
        
        // Add transit data
        calendarData[dateStr].aspects.push(...day.transits);
        
        // Calculate intensity (simplified approach based on number and exactness of aspects)
        const intensity = day.transits.reduce((sum, transit) => sum + (transit.exactness / 20), 0);
        calendarData[dateStr].intensity = Math.min(5, Math.round(intensity)); // Scale 0-5
      });
      
      return Object.values(calendarData);
    } catch (error) {
      console.error('Error calculating transit calendar:', error);
      throw new ApiError(500, 'Failed to calculate transit calendar');
    }
  }
  
  /**
   * Find upcoming significant transits
   * 
   * @param {Object} birthChart - Birth chart data
   * @param {number} [days=90] - Number of days to look ahead
   * @returns {Array} Upcoming significant transits
   */
  findUpcomingTransits(birthChart, days = 90) {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      // Generate forecast for the period
      const forecast = this.generateTransitForecast(birthChart, startDate, endDate);
      
      // Extract significant transits and sort by date and significance
      const upcomingTransits = [];
      forecast.forEach(day => {
        day.transits.forEach(transit => {
          upcomingTransits.push({
            date: day.date,
            ...transit,
            significance: this.calculateTransitSignificance(transit)
          });
        });
      });
      
      // Sort by significance and date
      return upcomingTransits
        .sort((a, b) => b.significance - a.significance)
        .slice(0, 10); // Return top 10 most significant
    } catch (error) {
      console.error('Error finding upcoming transits:', error);
      throw new ApiError(500, 'Failed to find upcoming transits');
    }
  }
  
  /**
   * Calculate the significance of a transit
   * 
   * @param {Object} transit - Transit aspect data
   * @returns {number} Significance score
   */
  calculateTransitSignificance(transit) {
    // Weight factors
    const planetWeights = {
      Sun: 5, Moon: 5, Mercury: 4, Venus: 4, Mars: 4,
      Jupiter: 3, Saturn: 3, Uranus: 2, Neptune: 2, Pluto: 2,
      'North Node': 1
    };
    
    const aspectWeights = {
      conjunction: 5, opposition: 4, square: 4, trine: 3, sextile: 2
    };
    
    // Calculate base significance
    const planetFactor = (planetWeights[transit.transitPlanet] || 1) * 
                         (planetWeights[transit.natalPlanet] || 1);
    const aspectFactor = aspectWeights[transit.aspectType] || 1;
    const exactnessFactor = transit.exactness / 20; // 0-5 range
    
    // Combine factors
    return planetFactor * aspectFactor * exactnessFactor;
  }
  
  /**
   * Generate interpretations for transits
   * 
   * @param {Object} transitPositions - Transit positions
   * @param {Object} birthChart - Birth chart data
   * @param {Array} transitAspects - Transit aspects
   * @param {Object} houseTransits - House transits
   * @param {Date} transitDate - Transit date
   * @returns {Object} Transit interpretations
   */
  generateTransitInterpretations(transitPositions, birthChart, transitAspects, houseTransits, transitDate) {
    const interpretations = {
      overall: this.generateOverallTransitInterpretation(transitPositions, birthChart, transitDate),
      aspects: [],
      houses: {}
    };
    
    // Generate aspect interpretations
    transitAspects.forEach(aspect => {
      const interpretation = this.generateTransitAspectInterpretation(aspect);
      interpretations.aspects.push({
        ...aspect,
        interpretation
      });
    });
    
    // Generate house transit interpretations
    Object.entries(houseTransits).forEach(([house, planets]) => {
      const houseInterpretation = this.generateHouseTransitInterpretation(
        parseInt(house), planets, birthChart
      );
      
      interpretations.houses[house] = {
        planets,
        interpretation: houseInterpretation
      };
    });
    
    return interpretations;
  }
  
  /**
   * Generate overall transit interpretation
   * 
   * @param {Object} transitPositions - Transit positions
   * @param {Object} birthChart - Birth chart data
   * @param {Date} transitDate - Transit date
   * @returns {string} Overall interpretation
   */
  generateOverallTransitInterpretation(transitPositions, birthChart, transitDate) {
    const dateString = transitDate.toDateString();
    const sunSign = transitPositions.Sun.sign;
    const moonSign = transitPositions.Moon.sign;
    
    return `Transit Chart for ${dateString}. The Sun is currently in ${sunSign} and the Moon is in ${moonSign}. This transit chart represents the current planetary energies as they interact with your natal chart.`;
  }
  
  /**
   * Generate interpretation for a transit aspect
   * 
   * @param {Object} aspect - Transit aspect
   * @returns {string} Aspect interpretation
   */
  generateTransitAspectInterpretation(aspect) {
    const { transitPlanet, natalPlanet, aspectType, applying } = aspect;
    const phase = applying ? "building in intensity" : "fading in influence";
    
    const aspectDescriptions = {
      conjunction: "a powerful alignment that intensifies and combines these energies",
      opposition: "a challenging aspect that creates tension and awareness between these areas",
      trine: "a harmonious flow of energy that facilitates ease and opportunity",
      square: "a dynamic aspect that generates action through friction and challenges",
      sextile: "a positive aspect that creates opportunities for growth and cooperation"
    };
    
    const planetMeanings = {
      Sun: "core identity and vitality",
      Moon: "emotions and instinctive reactions",
      Mercury: "communication and thinking",
      Venus: "relationships and values",
      Mars: "action and assertion",
      Jupiter: "growth and expansion",
      Saturn: "structure and limitations",
      Uranus: "change and innovation",
      Neptune: "dreams and spirituality",
      Pluto: "transformation and power",
      "North Node": "life direction and purpose"
    };
    
    const description = aspectDescriptions[aspectType] || "an aspect that connects these energies";
    const transitMeaning = planetMeanings[transitPlanet] || `energy of ${transitPlanet}`;
    const natalMeaning = planetMeanings[natalPlanet] || `your natal ${natalPlanet}`;
    
    return `Transit ${transitPlanet} forms a ${aspectType} with your natal ${natalPlanet}, ${description}. This connects the ${transitMeaning} with ${natalMeaning} in your chart. This influence is currently ${phase}.`;
  }
  
  /**
   * Generate interpretation for house transits
   * 
   * @param {number} houseNumber - House number
   * @param {Array} planets - Planets transiting the house
   * @param {Object} birthChart - Birth chart data
   * @returns {string} House transit interpretation
   */
  generateHouseTransitInterpretation(houseNumber, planets, birthChart) {
    const planetNames = planets.map(p => p.planet).join(', ');
    
    const houseThemes = {
      1: "identity, appearance, and personal initiatives",
      2: "resources, values, and self-worth",
      3: "communication, learning, and immediate environment",
      4: "home, family, and emotional foundations",
      5: "creativity, pleasure, and self-expression",
      6: "work, health, and daily routines",
      7: "partnerships, relationships, and open enemies",
      8: "shared resources, transformation, and deep psychology",
      9: "higher learning, travel, and beliefs",
      10: "career, public reputation, and authority",
      11: "friends, groups, and long-term goals",
      12: "unconscious, hidden matters, and spiritual growth"
    };
    
    const theme = houseThemes[houseNumber] || `matters of the ${houseNumber}th house`;
    
    return `Currently, ${planetNames} ${planets.length === 1 ? 'is' : 'are'} transiting your ${houseNumber}${this.getNumberSuffix(houseNumber)} house, highlighting areas of ${theme} in your life.`;
  }
  
  /**
   * Generate daily transit summary
   * 
   * @param {Array} significantTransits - Significant transits
   * @returns {string} Daily summary
   */
  generateDailyTransitSummary(significantTransits) {
    if (significantTransits.length === 0) {
      return "No significant transits today.";
    }
    
    // Get the most significant transit
    const mainTransit = significantTransits[0];
    
    // Create a brief summary
    return `${mainTransit.transitPlanet} ${mainTransit.aspectType} your natal ${mainTransit.natalPlanet}${significantTransits.length > 1 ? ` and ${significantTransits.length - 1} more significant transits` : ''}.`;
  }
  
  /**
   * Get suffix for number (1st, 2nd, 3rd, etc.)
   * 
   * @param {number} number - Number
   * @returns {string} Suffix
   */
  getNumberSuffix(number) {
    if (number % 100 >= 11 && number % 100 <= 13) {
      return 'th';
    }
    
    switch (number % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
}

module.exports = new TransitService();
