const swisseph = require('swisseph');
const { ApiError } = require('../utils/errorHandler');
const calculationService = require('./calculationService');
const transitService = require('./transitService');
const progressionService = require('./progressionService');

/**
 * Service for advanced predictive astrological tools
 */
class PredictiveToolsService {
  constructor() {
    // Reference the calculation and transit services for shared functionality
    this.calculationService = calculationService;
    this.transitService = transitService;
    this.progressionService = progressionService;
    
    // Planetary hours configuration
    this.planetaryRulers = {
      // Traditional rulership of days
      days: {
        0: 'Sun',     // Sunday
        1: 'Moon',    // Monday
        2: 'Mars',    // Tuesday
        3: 'Mercury', // Wednesday
        4: 'Jupiter', // Thursday
        5: 'Venus',   // Friday
        6: 'Saturn'   // Saturday
      },
      
      // Chaldean order for planetary hours
      hours: [
        'Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'
      ]
    };
    
    // Eclipse data for recent and upcoming eclipses
    // In a full implementation, this would be calculated or retrieved from an ephemeris
    this.eclipseData = [
      {
        date: '2024-10-02',
        type: 'Solar',
        degree: 10,
        sign: 'Libra',
        sarosNumber: 145,
        impact: {
          duration: 6,  // Impact duration in months
          intensity: 3  // Intensity level (1-5)
        }
      },
      {
        date: '2024-10-17',
        type: 'Lunar',
        degree: 24,
        sign: 'Aries',
        sarosNumber: 137,
        impact: {
          duration: 3,  // Impact duration in months
          intensity: 2  // Intensity level (1-5)
        }
      },
      {
        date: '2025-03-29',
        type: 'Solar',
        degree: 9,
        sign: 'Aries',
        sarosNumber: 139,
        impact: {
          duration: 6,  // Impact duration in months
          intensity: 4  // Intensity level (1-5)
        }
      },
      {
        date: '2025-04-12',
        type: 'Lunar',
        degree: 23,
        sign: 'Libra',
        sarosNumber: 132,
        impact: {
          duration: 3,  // Impact duration in months
          intensity: 2  // Intensity level (1-5)
        }
      }
    ];
    
    // Retrograde data
    this.retrogradeData = {
      Mercury: [
        { startDate: '2024-08-05', endDate: '2024-08-28', sign: 'Leo/Virgo' },
        { startDate: '2024-11-25', endDate: '2024-12-15', sign: 'Sagittarius' },
        { startDate: '2025-03-22', endDate: '2025-04-13', sign: 'Aries' },
        { startDate: '2025-07-17', endDate: '2025-08-11', sign: 'Leo' },
        { startDate: '2025-11-16', endDate: '2025-12-06', sign: 'Sagittarius' }
      ],
      Venus: [
        { startDate: '2025-07-22', endDate: '2025-09-03', sign: 'Virgo' }
      ],
      Mars: [
        { startDate: '2024-12-06', endDate: '2025-02-23', sign: 'Leo' }
      ],
      Jupiter: [
        { startDate: '2024-10-09', endDate: '2025-02-04', sign: 'Gemini' }
      ],
      Saturn: [
        { startDate: '2025-04-29', endDate: '2025-09-15', sign: 'Pisces' }
      ],
      Uranus: [
        { startDate: '2024-08-30', endDate: '2025-01-30', sign: 'Taurus' }
      ],
      Neptune: [
        { startDate: '2024-07-02', endDate: '2024-12-08', sign: 'Aries' }
      ],
      Pluto: [
        { startDate: '2024-05-02', endDate: '2024-10-11', sign: 'Aquarius' }
      ]
    };
    
    console.log('Predictive Tools Service Initialized');
  }
}

// Add methods to prototype
PredictiveToolsService.prototype.createPersonalizedForecast = function(birthChart, startDate, duration = 30) {
  try {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    // Get transit forecast data
    const transitForecast = this.transitService.generateTransitForecast(
      birthChart, startDate, endDate
    );
    
    // Calculate key dates within the period
    const keyDates = this.identifyKeyDates(birthChart, startDate, endDate);
    
    // Get eclipse impact analysis
    const eclipseImpacts = this.analyzeEclipseImpacts(birthChart, startDate, endDate);
    
    // Get retrograde impact analysis
    const retrogradeImpacts = this.analyzeRetrogradeImpacts(birthChart, startDate, endDate);
    
    // Generate daily forecasts
    const dailyForecasts = this.generateDailyForecasts(
      birthChart, transitForecast, eclipseImpacts, retrogradeImpacts, startDate, duration
    );
    
    // Generate weekly trends
    const weeklyTrends = this.generateWeeklyTrends(dailyForecasts);
    
    // Generate monthly overview
    const monthlyOverview = this.generateMonthlyOverview(
      birthChart, startDate, endDate, keyDates, eclipseImpacts, retrogradeImpacts
    );
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration,
      name: birthChart.name,
      keyDates,
      eclipseImpacts,
      retrogradeImpacts,
      dailyForecasts,
      weeklyTrends,
      monthlyOverview
    };
  } catch (error) {
    console.error('Error creating personalized forecast:', error);
    throw new ApiError(500, 'Failed to create personalized forecast');
  }
};

PredictiveToolsService.prototype.analyzeEclipseImpact = function(birthChart, targetDate = new Date()) {
  try {
    // Calculate date range (6 months before and after target date)
    const startRange = new Date(targetDate);
    startRange.setMonth(startRange.getMonth() - 6);
    
    const endRange = new Date(targetDate);
    endRange.setMonth(endRange.getMonth() + 6);
    
    // Get eclipses within range
    const relevantEclipses = this.getEclipsesInRange(startRange, endRange);
    
    // Analyze impact for each eclipse
    const impacts = relevantEclipses.map(eclipse => {
      // Convert eclipse degree to absolute zodiac position
      const signIndex = this.zodiacSignToIndex(eclipse.sign);
      const eclipsePosition = (signIndex * 30) + eclipse.degree;
      
      // Find aspects to natal planets
      const aspectedPlanets = [];
      
      Object.entries(birthChart.planets).forEach(([planet, data]) => {
        const orb = eclipse.type === 'Solar' ? 8 : 6; // Wider orb for solar eclipses
        
        // Check for conjunction or opposition
        let angle = Math.abs(data.position - eclipsePosition);
        if (angle > 180) angle = 360 - angle;
        
        if (angle < orb || Math.abs(angle - 180) < orb) {
          const aspectType = angle < orb ? 'conjunction' : 'opposition';
          aspectedPlanets.push({
            planet,
            aspectType,
            orb: aspectType === 'conjunction' ? angle : Math.abs(angle - 180)
          });
        }
      });
      
      // Check if eclipse aspects house cusps
      const aspectedHouses = [];
      
      birthChart.houses.forEach(house => {
        const orb = eclipse.type === 'Solar' ? 5 : 3;
        
        let angle = Math.abs(house.cusp - eclipsePosition);
        if (angle > 180) angle = 360 - angle;
        
        if (angle < orb) {
          aspectedHouses.push({
            house: house.number,
            orb: angle
          });
        }
      });
      
      // Calculate personal impact score (0-10)
      const impactScore = this.calculateEclipseImpactScore(
        eclipse, aspectedPlanets, aspectedHouses
      );
      
      // Generate interpretation based on eclipse contacts
      const interpretation = this.generateEclipseInterpretation(
        eclipse, aspectedPlanets, aspectedHouses, birthChart
      );
      
      return {
        eclipse,
        aspectedPlanets,
        aspectedHouses,
        impactScore,
        interpretation
      };
    });
    
    // Sort by impact score (highest first)
    impacts.sort((a, b) => b.impactScore - a.impactScore);
    
    return {
      impacts,
      overallInterpretation: this.generateOverallEclipseInterpretation(impacts)
    };
  } catch (error) {
    console.error('Error analyzing eclipse impact:', error);
    throw new ApiError(500, 'Failed to analyze eclipse impact');
  }
};

PredictiveToolsService.prototype.generateOverallEclipseInterpretation = function(impacts) {
  if (impacts.length === 0) {
    return 'No significant eclipse impacts during this period.';
  }
  
  return `During this period, you are experiencing ${impacts.length} eclipse impact${impacts.length > 1 ? 's' : ''}, with the most significant being the ${impacts[0].eclipse.type} Eclipse in ${impacts[0].eclipse.sign}. Eclipses often correlate with periods of accelerated change, revelations, and shifts in perspective.`;
};

PredictiveToolsService.prototype.analyzeRetrogradeImpacts = function(birthChart, startDate, endDate) {
  // Get retrograde periods within range
  const retrogradePeriods = this.getRetrogradePeriods(startDate, endDate);
  
  // Analyze impacts for each retrograde period
  const impacts = retrogradePeriods.map(period => {
    // Check if natal planet is in the same sign
    const natalPlanetsInSign = [];
    
    Object.entries(birthChart.planets).forEach(([planet, data]) => {
      // Extract sign name from "sign1/sign2" format if needed
      const retroSigns = period.sign.split('/');
      
      if (retroSigns.includes(data.sign)) {
        natalPlanetsInSign.push({
          planet,
          sign: data.sign,
          position: data.position
        });
      }
    });
    
    // Check if retrograde planet is retrograde in natal chart
    const natallyRetrograde = birthChart.planets[period.planet] ? 
      birthChart.planets[period.planet].retrograde : false;
    
    // Calculate impact score
    const impactScore = this.calculateRetrogradeImpactScore(
      period, natalPlanetsInSign, natallyRetrograde
    );
    
    // Generate interpretation
    const interpretation = this.generateRetrogradeInterpretation(
      period, birthChart, natalPlanetsInSign, natallyRetrograde
    );
    
    return {
      ...period,
      retrogradeStartDate: period.startDate,
      retrogradeEndDate: period.endDate,
      natalPlanetsInSign,
      natallyRetrograde,
      impactScore,
      interpretation
    };
  });
  
  // Sort by impact score (highest first)
  return impacts.sort((a, b) => b.impactScore - a.impactScore);
};

PredictiveToolsService.prototype.getEclipsesInRange = function(startDate, endDate) {
  return this.eclipseData.filter(eclipse => {
    const eclipseDate = new Date(eclipse.date);
    return eclipseDate >= startDate && eclipseDate <= endDate;
  });
};

PredictiveToolsService.prototype.getRetrogradePeriods = function(startDate, endDate) {
  const periods = [];
  
  Object.entries(this.retrogradeData).forEach(([planet, planetPeriods]) => {
    planetPeriods.forEach(period => {
      const retroStart = new Date(period.startDate);
      const retroEnd = new Date(period.endDate);
      
      // Check if period overlaps with our date range
      if ((retroStart <= endDate && retroEnd >= startDate)) {
        periods.push({
          planet,
          startDate: period.startDate,
          endDate: period.endDate,
          sign: period.sign
        });
      }
    });
  });
  
  return periods;
};

PredictiveToolsService.prototype.calculateEclipseImpactScore = function(eclipse, aspectedPlanets, aspectedHouses) {
  let score = 0;
  
  // Base score from eclipse type
  score += eclipse.type === 'Solar' ? 5 : 3;
  
  // Add points for personal planets (Sun, Moon, Mercury, Venus, Mars)
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  aspectedPlanets.forEach(aspect => {
    if (personalPlanets.includes(aspect.planet)) {
      score += aspect.aspectType === 'conjunction' ? 2 : 1;
    } else {
      score += aspect.aspectType === 'conjunction' ? 1 : 0.5;
    }
    
    // Reduce score based on orb
    score -= aspect.orb / 10;
  });
  
  // Add points for angular houses (1, 4, 7, 10)
  const angularHouses = [1, 4, 7, 10];
  aspectedHouses.forEach(house => {
    if (angularHouses.includes(house.house)) {
      score += 1;
    } else {
      score += 0.5;
    }
    
    // Reduce score based on orb
    score -= house.orb / 10;
  });
  
  // Factor in eclipse intensity from data
  score = score * (eclipse.impact.intensity / 3);
  
  // Cap at 10
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};

PredictiveToolsService.prototype.calculateRetrogradeImpactScore = function(period, natalPlanetsInSign, natallyRetrograde) {
  let score = 0;
  
  // Base score by planet importance
  const planetScores = {
    Mercury: 3,
    Venus: 4,
    Mars: 4,
    Jupiter: 3,
    Saturn: 3,
    Uranus: 2,
    Neptune: 2,
    Pluto: 2
  };
  
  score += planetScores[period.planet] || 2;
  
  // Add points if natal planets are in the same sign
  natalPlanetsInSign.forEach(natalPlanet => {
    const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
    if (personalPlanets.includes(natalPlanet.planet)) {
      score += 2;
    } else {
      score += 1;
    }
  });
  
  // Add points if planet is retrograde in natal chart
  if (natallyRetrograde) {
    score += 1.5;
  }
  
  // Adjust based on duration (longer = more impact)
  const retroStart = new Date(period.startDate);
  const retroEnd = new Date(period.endDate);
  const durationDays = (retroEnd - retroStart) / (1000 * 60 * 60 * 24);
  
  score += (durationDays / 30); // Add 1 point per month
  
  // Cap at 10
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};

PredictiveToolsService.prototype.generateRetrogradeInterpretation = function(period, birthChart, natalPlanetsInSign, natallyRetrograde) {
  let interpretation = `${period.planet} retrograde in ${period.sign} `;
  
  // Add general interpretation based on planet
  switch (period.planet) {
    case 'Mercury':
      interpretation += 'brings a period of review and reflection in communication, travel, and technology. Be mindful of potential misunderstandings, travel delays, and technological issues.';
      break;
    case 'Venus':
      interpretation += 'invites reassessment of relationships, values, and creative pursuits. This is a time to reconsider what and who you truly value.';
      break;
    case 'Mars':
      interpretation += 'suggests a time to redirect energy inward, revise strategies, and reconsider how you assert yourself. Direct action may meet resistance during this period.';
      break;
    case 'Jupiter':
      interpretation += 'prompts review of beliefs, educational pursuits, and expansion plans. This is a time to realign with your authentic path of growth.';
      break;
    case 'Saturn':
      interpretation += 'calls for reassessment of responsibilities, structures, and long-term goals. This is a time to reconsider your commitments and adjust as needed.';
      break;
    case 'Uranus':
      interpretation += 'brings a period of internal awakening and reassessment of where you need freedom and change. Sudden insights may lead to revised plans.';
      break;
    case 'Neptune':
      interpretation += 'invites deeper connection with your spiritual and creative sources. Dreams, intuition, and artistic inspiration may be heightened and reveal new insights.';
      break;
    case 'Pluto':
      interpretation += 'intensifies internal transformation processes and may bring buried material to the surface for healing and integration.';
      break;
    default:
      interpretation += 'suggests a period of review and introspection related to the themes of this planet.';
  }
  
  // Add personalized interpretation if natal planets are in the same sign
  if (natalPlanetsInSign.length > 0) {
    interpretation += ' This retrograde has particular significance for you because your natal ';
    
    if (natalPlanetsInSign.length === 1) {
      interpretation += natalPlanetsInSign[0].planet;
    } else {
      interpretation += natalPlanetsInSign.map(p => p.planet).join(' and ');
    }
    
    interpretation += ` is in ${period.sign.split('/')[0]}, suggesting a time of significant personal review and potential renewal in this area of life.`;
  }
  
  // Add interpretation if the planet is retrograde in the natal chart
  if (natallyRetrograde) {
    interpretation += ` Since ${period.planet} is also retrograde in your birth chart, you may find this period more comfortable or productive than others do, as it aligns with your natural way of working with this energy.`;
  }
  
  return interpretation;
};

PredictiveToolsService.prototype.identifyKeyDates = function(birthChart, startDate, endDate) {
  return []; // Implement later
};

PredictiveToolsService.prototype.generateEclipseInterpretation = function(eclipse, aspectedPlanets, aspectedHouses, birthChart) {
  let interpretation = `The ${eclipse.type} Eclipse at ${eclipse.degree}° ${eclipse.sign} `;
  
  if (aspectedPlanets.length === 0 && aspectedHouses.length === 0) {
    interpretation += `has a general influence on your chart, highlighting themes of ${this.getSignThemes(eclipse.sign)}.`;
    return interpretation;
  }
  
  // Add aspected planets interpretation
  if (aspectedPlanets.length > 0) {
    interpretation += 'makes significant contact with ';
    
    if (aspectedPlanets.length === 1) {
      const aspect = aspectedPlanets[0];
      interpretation += `your natal ${aspect.planet} by ${aspect.aspectType}`;
    } else {
      interpretation += 'your natal ';
      interpretation += aspectedPlanets.map(a => 
        `${a.planet} by ${a.aspectType}`
      ).join(' and ');
    }
    
    interpretation += '.';
  }
  
  return interpretation;
};

// Export the service
module.exports = new PredictiveToolsService();
