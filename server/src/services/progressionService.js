// Import dependencies
const swisseph = require('swisseph');
const { ApiError } = require('../utils/errorHandler');
const calculationService = require('./calculationService');

// Create ProgressionService class
class ProgressionService {
  constructor() {
    // Reference the main calculation service for shared functionality
    this.calculationService = calculationService;
    this.swe = calculationService.swe;
    this.planets = calculationService.planets;
    this.aspects = calculationService.aspects;
    this.zodiacSigns = calculationService.zodiacSigns;
    
    console.log('Progression Service Initialized');
  }
}

// Add method for calculating secondary progressions
ProgressionService.prototype.calculateSecondaryProgressions = function(birthChart, progressedDate) {
  try {
    // Calculate Julian day for the progressed date
    const year = progressedDate.getFullYear();
    const month = progressedDate.getMonth() + 1;
    const day = progressedDate.getDate();
    const hour = progressedDate.getHours();
    const minute = progressedDate.getMinutes();
    
    const progressedJulianDay = this.swe.swe_julday(
      year, month, day, hour + minute/60, this.swe.SE_GREG_CAL
    );
    
    // Calculate time difference in days
    const dayDifference = progressedJulianDay - birthChart.julianDay;
    
    // Secondary progressions: 1 day = 1 year
    // Calculate progressed Julian day by adding days equal to years since birth
    const secondaryProgressedJD = birthChart.julianDay + (dayDifference * (1/365.25));
    
    // Calculate progressed positions
    const progressedPositions = this.calculateProgressedPositions(secondaryProgressedJD);
    
    // Calculate aspects between progressed and natal planets
    const progressedNatalAspects = this.calculateProgressedNatalAspects(
      birthChart.planets, progressedPositions
    );
    
    // Calculate aspects between progressed planets
    const progressedAspects = this.calculationService.calculateAspects(progressedPositions);
    
    // Generate interpretations
    const interpretations = this.generateProgressionInterpretations(
      progressedPositions, birthChart, progressedNatalAspects, progressedDate
    );
    
    return {
      progressedDate: progressedDate.toISOString(),
      progressedJulianDay: secondaryProgressedJD,
      progressedPositions,
      progressedNatalAspects,
      progressedAspects,
      interpretations
    };
  } catch (error) {
    console.error('Error calculating secondary progressions:', error);
    throw new ApiError(500, 'Failed to calculate secondary progressions');
  }
};

// Method for generating interpretations for progressions
ProgressionService.prototype.generateProgressionInterpretations = function(progressedPositions, birthChart, progressedNatalAspects, progressedDate) {
  // Create base interpretations object
  const interpretations = {
    overall: this.generateOverallProgressionInterpretation(birthChart, progressedDate),
    planets: {},
    aspects: []
  };
  
  // Add planet interpretations
  Object.entries(progressedPositions).forEach(([planet, data]) => {
    const natalPosition = birthChart.planets[planet];
    const signChanged = natalPosition.sign !== data.sign;
    
    let interpretation = `Your progressed ${planet} is at ${data.position.toFixed(2)}° ${data.sign}.`;
    
    if (signChanged) {
      interpretation += ` This has moved from your natal ${planet} in ${natalPosition.sign}, representing a significant developmental shift in the ${planet}'s energy in your life.`;
    } else {
      interpretation += ` This progression builds upon your natal ${planet} in ${natalPosition.sign}, showing ongoing development in this area of your life.`;
    }
    
    if (data.retrograde && !natalPosition.retrograde) {
      interpretation += ` Your progressed ${planet} has turned retrograde, suggesting a period of internalization and review of ${planet} matters.`;
    } else if (!data.retrograde && natalPosition.retrograde) {
      interpretation += ` Your progressed ${planet} has turned direct, suggesting a more externally expressed ${planet} energy now.`;
    }
    
    interpretations.planets[planet] = interpretation;
  });
  
  // Add aspect interpretations
  progressedNatalAspects.forEach(aspect => {
    const interpretation = `Progressed ${aspect.progressedPlanet} ${aspect.aspectType} your natal ${aspect.natalPlanet}. ${this.getProgressedAspectInterpretation(aspect)}`;
    
    interpretations.aspects.push({
      ...aspect,
      interpretation
    });
  });
  
  return interpretations;
};

// Method for overall progression interpretation
ProgressionService.prototype.generateOverallProgressionInterpretation = function(birthChart, progressedDate) {
  const birthDate = new Date(birthChart.birthDate);
  const progYear = progressedDate.getFullYear();
  const birthYear = birthDate.getFullYear();
  const age = progYear - birthYear;
  
  return `Secondary progressions represent your developmental path and internal evolution. This chart shows your progressed positions for age ${age}, highlighting the unfolding of your potential from birth to present day. The progressed chart reveals psychological development and the maturation of your natal potential.`;
};

// Method for progressed aspect interpretation
ProgressionService.prototype.getProgressedAspectInterpretation = function(aspect) {
  const { progressedPlanet, natalPlanet, aspectType } = aspect;
  
  const aspectMeanings = {
    conjunction: "a powerful activation and alignment of these energies",
    opposition: "a significant culmination or awareness involving these planets",
    trine: "a harmonious flowing development between these energies",
    square: "a dynamic tension and growth opportunity between these planets",
    sextile: "an opportunity for creative growth involving these energies"
  };
  
  return `This represents ${aspectMeanings[aspectType] || "an interaction between these planets"} in your developmental journey.`;
};

// Method for solar arc directions
ProgressionService.prototype.calculateSolarArcDirections = function(birthChart, directedDate) {
  try {
    // Calculate Julian day for the directed date
    const year = directedDate.getFullYear();
    const month = directedDate.getMonth() + 1;
    const day = directedDate.getDate();
    
    const directedJulianDay = this.swe.swe_julday(
      year, month, day, 12, this.swe.SE_GREG_CAL
    );
    
    // Calculate time difference in years
    const yearDifference = (directedJulianDay - birthChart.julianDay) / 365.25;
    
    // Calculate solar arc (Sun's progressed distance from natal position)
    // For simplicity, using mean solar motion of approximately 1° per year
    const solarArc = yearDifference;
    
    // Calculate directed positions
    const directedPositions = this.calculateSolarArcPositions(birthChart.planets, solarArc);
    
    // Calculate aspects between directed and natal planets
    const directedNatalAspects = this.calculateDirectedNatalAspects(
      birthChart.planets, directedPositions
    );
    
    // Calculate aspects between directed planets
    const directedAspects = this.calculationService.calculateAspects(directedPositions);
    
    // Generate interpretations
    const interpretations = this.generateSolarArcInterpretations(
      directedPositions, birthChart, directedNatalAspects, yearDifference
    );
    
    return {
      directedDate: directedDate.toISOString(),
      yearDifference,
      solarArc,
      directedPositions,
      directedNatalAspects,
      directedAspects,
      interpretations
    };
  } catch (error) {
    console.error('Error calculating solar arc directions:', error);
    throw new ApiError(500, 'Failed to calculate solar arc directions');
  }
};

// Method for solar arc interpretations
ProgressionService.prototype.generateSolarArcInterpretations = function(directedPositions, birthChart, directedNatalAspects, yearDifference) {
  // Create base interpretations object
  const interpretations = {
    overall: `Solar Arc Directions show your development with all planets moving at the same rate as the progressed Sun, approximately ${yearDifference.toFixed(2)} degrees from their natal positions. These symbolize key developmental themes and often correlate with significant life events and changes in consciousness.`,
    planets: {},
    aspects: []
  };
  
  // Add planet interpretations
  Object.entries(directedPositions).forEach(([planet, data]) => {
    const natalPosition = birthChart.planets[planet];
    const signChanged = natalPosition.sign !== data.sign;
    
    let interpretation = `Your directed ${planet} is at ${data.position.toFixed(2)}° ${data.sign}.`;
    
    if (signChanged) {
      interpretation += ` This has moved from your natal ${planet} in ${natalPosition.sign}, representing a significant shift in the expression of this energy in your life.`;
    } else {
      interpretation += ` This builds upon your natal ${planet} in ${natalPosition.sign}.`;
    }
    
    interpretations.planets[planet] = interpretation;
  });
  
  // Add aspect interpretations
  directedNatalAspects.forEach(aspect => {
    const interpretation = `Directed ${aspect.directedPlanet} ${aspect.aspectType} your natal ${aspect.natalPlanet}. ${this.getSolarArcAspectInterpretation(aspect)}`;
    
    interpretations.aspects.push({
      ...aspect,
      interpretation
    });
  });
  
  return interpretations;
};

// Other helper methods
ProgressionService.prototype.calculateProgressedPositions = function(julianDay) {
  const positions = {};
  
  // Calculate position for each planet using Swiss Ephemeris
  Object.entries(this.planets).forEach(([name, index]) => {
    try {
      // Calculate position using Swiss Ephemeris
      const { xx } = this.swe.swe_calc_ut(julianDay, index, this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SPEED);
      
      // Normalize longitude to 0-360 range
      const longitude = xx[0] % 360;
      
      // Check if retrograde
      const isRetrograde = xx[3] < 0;
      
      positions[name] = {
        position: longitude,
        retrograde: isRetrograde,
        speed: xx[3],
        sign: this.zodiacSigns[Math.floor(longitude / 30)]
      };
    } catch (error) {
      console.error(`Error calculating progressed position for ${name}:`, error);
      
      // Use fallback position
      const fallbackPosition = this.calculationService.getSimplifiedPlanetPosition(name, julianDay);
      positions[name] = {
        position: fallbackPosition,
        retrograde: false,
        speed: 0,
        sign: this.zodiacSigns[Math.floor(fallbackPosition / 30)]
      };
    }
  });
  
  return positions;
};

ProgressionService.prototype.calculateSolarArcPositions = function(natalPlanets, arc) {
  const positions = {};
  
  // Add solar arc to each planet's position
  Object.entries(natalPlanets).forEach(([planet, data]) => {
    // Calculate directed position
    const directedPos = (data.position + arc) % 360;
    
    positions[planet] = {
      position: directedPos,
      sign: this.zodiacSigns[Math.floor(directedPos / 30)],
      retrograde: data.retrograde
    };
  });
  
  return positions;
};

ProgressionService.prototype.calculateProgressedNatalAspects = function(natalPlanets, progressedPlanets) {
  const aspects = [];
  
  // Check aspects between progressed and natal planets
  Object.entries(progressedPlanets).forEach(([progressedPlanet, progressedData]) => {
    const progressedPos = progressedData.position;
    
    Object.entries(natalPlanets).forEach(([natalPlanet, natalData]) => {
      const natalPos = natalData.position;
      
      // Calculate angle between planets
      let angle = Math.abs(progressedPos - natalPos);
      
      // Normalize to 0-180 range
      if (angle > 180) {
        angle = 360 - angle;
      }
      
      // Check if it makes an aspect
      Object.entries(this.aspects).forEach(([aspectType, aspectData]) => {
        const orb = Math.abs(angle - aspectData.angle);
        
        if (orb <= aspectData.orb) {
          aspects.push({
            progressedPlanet,
            natalPlanet,
            aspectType,
            angle: aspectData.angle,
            orb: parseFloat(orb.toFixed(2))
          });
        }
      });
    });
  });
  
  return aspects;
};

ProgressionService.prototype.calculateDirectedNatalAspects = function(natalPlanets, directedPlanets) {
  const aspects = [];
  
  // Check aspects between directed and natal planets
  Object.entries(directedPlanets).forEach(([directedPlanet, directedData]) => {
    const directedPos = directedData.position;
    
    Object.entries(natalPlanets).forEach(([natalPlanet, natalData]) => {
      const natalPos = natalData.position;
      
      // Calculate angle between planets
      let angle = Math.abs(directedPos - natalPos);
      
      // Normalize to 0-180 range
      if (angle > 180) {
        angle = 360 - angle;
      }
      
      // Check if it makes an aspect
      Object.entries(this.aspects).forEach(([aspectType, aspectData]) => {
        const orb = Math.abs(angle - aspectData.angle);
        
        if (orb <= aspectData.orb) {
          aspects.push({
            directedPlanet,
            natalPlanet,
            aspectType,
            angle: aspectData.angle,
            orb: parseFloat(orb.toFixed(2))
          });
        }
      });
    });
  });
  
  return aspects;
};

ProgressionService.prototype.getSolarArcAspectInterpretation = function(aspect) {
  const { directedPlanet, natalPlanet, aspectType } = aspect;
  
  const aspectMeanings = {
    conjunction: "a powerful activation of this natal point, often correlating with significant life events",
    opposition: "a culmination or awareness involving these planets, potentially manifesting as external events",
    trine: "a harmonious development that may bring opportunities and positive experiences",
    square: "a dynamic period of tension and growth that may correlate with challenges and necessary changes",
    sextile: "an opportunity for growth and positive development in these areas of life"
  };
  
  return `This solar arc aspect indicates ${aspectMeanings[aspectType] || "an interaction between these planets"} in your developmental journey.`;
};

// Export the service
module.exports = new ProgressionService();
