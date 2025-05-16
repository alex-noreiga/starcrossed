const swisseph = require('swisseph');
const { ApiError } = require('../utils/errorHandler');

// Set the ephemeris path - you would need to download and provide the proper path
swisseph.swe_set_ephe_path('/path/to/ephemeris');

// Helper for converting degrees to zodiac sign
const getZodiacSign = (longitude) => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio', 
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Each sign is 30 degrees, so divide by 30 to get the sign index
  const signIndex = Math.floor(longitude / 30);
  return signs[signIndex];
};

// Helper for calculating the house placement of a planet
const getHousePlacement = (longitude, houses) => {
  // For simplicity in this MVP, we'll use a basic method
  // A real implementation would use proper house systems (Placidus, Koch, etc.)
  for (let i = 0; i < houses.length; i++) {
    const nextHouse = houses[(i + 1) % houses.length];
    if (
      (houses[i].degree <= longitude && longitude < nextHouse.degree) ||
      (houses[i].degree > nextHouse.degree && (longitude >= houses[i].degree || longitude < nextHouse.degree))
    ) {
      return houses[i].house;
    }
  }
  return 1; // Default to first house if not found
};

// Helper for calculating aspects between planets
const calculateAspects = (planets) => {
  const aspects = [];
  const aspectTypes = {
    0: 'Conjunction',   // 0 degrees
    60: 'Sextile',      // 60 degrees
    90: 'Square',       // 90 degrees
    120: 'Trine',       // 120 degrees
    180: 'Opposition'   // 180 degrees
  };
  
  // Orb allowances for each aspect type
  const orbs = {
    'Conjunction': 8,
    'Sextile': 6,
    'Square': 8,
    'Trine': 8,
    'Opposition': 8
  };
  
  // Check each planet pair for aspects
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      // Calculate the angle between the planets
      let angle = Math.abs(planet1.degree - planet2.degree);
      if (angle > 180) angle = 360 - angle;
      
      // Check if angle matches any aspect type within allowed orb
      for (const [aspectAngle, aspectType] of Object.entries(aspectTypes)) {
        const orb = orbs[aspectType];
        const diff = Math.abs(angle - parseInt(aspectAngle));
        
        if (diff <= orb) {
          aspects.push({
            planet1: planet1.name,
            planet2: planet2.name,
            type: aspectType,
            orb: diff
          });
          break;
        }
      }
    }
  }
  
  return aspects;
};

const calculateBirthChart = async (birthData) => {
  try {
    const { birthDate, birthTime, birthPlace } = birthData;
    
    // Parse birth date and time
    const birthDateTime = new Date(`${birthDate}T${birthTime}`);
    
    // For a real app, you would use a geocoding API to get latitude/longitude
    // For this MVP, we'll use placeholder values
    const latitude = 40.7128; // New York latitude
    const longitude = -74.0060; // New York longitude
    
    // Julian day number for the birth date and time
    const julianDay = swisseph.swe_julday(
      birthDateTime.getUTCFullYear(),
      birthDateTime.getUTCMonth() + 1, // Month is 0-indexed in JS
      birthDateTime.getUTCDate(),
      birthDateTime.getUTCHours() + birthDateTime.getUTCMinutes() / 60,
      swisseph.SE_GREG_CAL
    );
    
    // Calculate planet positions
    const planets = [];
    const planetBodies = [
      { id: swisseph.SE_SUN, name: 'Sun' },
      { id: swisseph.SE_MOON, name: 'Moon' },
      { id: swisseph.SE_MERCURY, name: 'Mercury' },
      { id: swisseph.SE_VENUS, name: 'Venus' },
      { id: swisseph.SE_MARS, name: 'Mars' },
      { id: swisseph.SE_JUPITER, name: 'Jupiter' },
      { id: swisseph.SE_SATURN, name: 'Saturn' },
      { id: swisseph.SE_URANUS, name: 'Uranus' },
      { id: swisseph.SE_NEPTUNE, name: 'Neptune' },
      { id: swisseph.SE_PLUTO, name: 'Pluto' }
    ];
    
    // Calculate house cusps
    // For MVP, we'll create a simplified calculation
    // A complete implementation would use the swisseph.swe_houses function
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      const offset = (i - 1) * 30;
      houses.push({
        house: i,
        sign: getZodiacSign(offset),
        degree: offset % 30
      });
    }
    
    // Calculate planet positions and their house placements
    for (const planet of planetBodies) {
      const result = swisseph.swe_calc_ut(julianDay, planet.id, swisseph.SEFLG_SPEED);
      const longitude = result.longitude;
      
      planets.push({
        name: planet.name,
        degree: longitude % 30, // Position within the sign
        sign: getZodiacSign(longitude),
        house: getHousePlacement(longitude, houses)
      });
    }
    
    // Calculate aspects between planets
    const aspects = calculateAspects(planets);
    
    // Return the complete chart data
    return {
      planets,
      houses,
      aspects
    };
  } catch (error) {
    console.error("Error calculating birth chart:", error);
    throw new ApiError(500, "Error calculating birth chart");
  }
};

module.exports = {
  calculateBirthChart
};
