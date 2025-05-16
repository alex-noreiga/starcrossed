const swisseph = require('swisseph');
const { ApiError } = require('../utils/errorHandler');
const interpretationService = require('./interpretationService');
const locationService = require('./locationService');

// Set the ephemeris path
const path = require('path');
const ephePath = process.env.EPHE_PATH || path.join(__dirname, '../../ephe');
swisseph.swe_set_ephe_path(ephePath);
console.log(`Swiss Ephemeris path set to: ${ephePath}`);

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
const getHousePlacement = (longitude, houses, houseSystem = 'placidus') => {
  // For Whole Sign houses, placement is simply based on the sign
  if (houseSystem.toLowerCase() === 'whole-sign') {
    // Each sign corresponds to one house, starting with the Ascendant sign as the 1st house
    // For simplicity here, we'll just use the longitude directly
    return Math.floor(longitude / 30) + 1;
  }
  
  // For Placidus or other house systems, use the house cusps
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    // Handle the case when a house crosses 0° Aries (360° -> 0°)
    if (currentHouse.longitude > nextHouse.longitude) {
      if (longitude >= currentHouse.longitude || longitude < nextHouse.longitude) {
        return currentHouse.house;
      }
    } else if (longitude >= currentHouse.longitude && longitude < nextHouse.longitude) {
      return currentHouse.house;
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
    const { birthDate, birthTime, birthPlace, houseSystem = 'placidus' } = birthData;
    
    // Get location data using geocoding
    const location = await locationService.getGeocoding(birthPlace);
    const { latitude, longitude } = location;
    
    // Get timezone data for the location and birth date
    const timezone = await locationService.getTimezone(latitude, longitude, birthDate);
    
    // Adjust time for DST if needed
    const adjustedTime = locationService.adjustForDST(birthDate, birthTime, timezone);
    
    // Calculate UTC time
    const utcDateTime = locationService.calculateUtcTime(
      adjustedTime.dateStr,
      adjustedTime.timeStr,
      adjustedTime.gmtOffset
    );
    
    // Calculate Julian day from UTC time
    const julianDay = swisseph.swe_julday(
      utcDateTime.getUTCFullYear(),
      utcDateTime.getUTCMonth() + 1, // Month is 0-indexed in JS
      utcDateTime.getUTCDate(),
      utcDateTime.getUTCHours() + utcDateTime.getUTCMinutes() / 60,
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
      { id: swisseph.SE_PLUTO, name: 'Pluto' },
      // Add North Node (Mean)
      { id: swisseph.SE_MEAN_NODE, name: 'North Node' },
      // Chiron 
      { id: swisseph.SE_CHIRON, name: 'Chiron' }
    ];
    
    // Determine house system flag based on the requested system
    let houseSystemFlag;
    switch (houseSystem.toLowerCase()) {
      case 'placidus':
        houseSystemFlag = swisseph.SE_HSYS_PLACIDUS;
        break;
      case 'koch':
        houseSystemFlag = swisseph.SE_HSYS_KOCH;
        break;
      case 'whole-sign':
        houseSystemFlag = swisseph.SE_HSYS_WHOLE_SIGN;
        break;
      case 'equal':
        houseSystemFlag = swisseph.SE_HSYS_EQUAL;
        break;
      default:
        houseSystemFlag = swisseph.SE_HSYS_PLACIDUS;
    }
    
    // Calculate house cusps using Swiss Ephemeris
    // Properly calculate Ascendant, MC, and house cusps
    const { house_cusps, ascendant, mc } = swisseph.swe_houses(
      julianDay,
      latitude,
      longitude,
      houseSystemFlag
    );
    
    // Transform house cusps into our data format
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      const longitude = house_cusps[i];
      houses.push({
        house: i,
        longitude,
        sign: getZodiacSign(longitude),
        degree: longitude % 30
      });
    }
    
    // Calculate planet positions and their house placements
    for (const planet of planetBodies) {
      const result = swisseph.swe_calc_ut(julianDay, planet.id, swisseph.SEFLG_SPEED);
      const longitude = result.longitude;
      
      planets.push({
        name: planet.name,
        longitude,
        degree: longitude % 30, // Position within the sign
        sign: getZodiacSign(longitude),
        house: getHousePlacement(longitude, houses, houseSystem),
        speed: result.speed, // Retrograde if negative
        isRetrograde: result.speed < 0
      });
    }
    
    // Calculate aspects between planets
    const aspects = calculateAspects(planets);
    
    // Prepare the complete chart data
    const chartData = {
      info: {
        date: birthDate,
        time: birthTime,
        location: location.formattedAddress,
        timezone: timezone.zoneName,
        isDST: timezone.dst,
        latitude,
        longitude,
        houseSystem
      },
      points: {
        ascendant: {
          longitude: ascendant,
          sign: getZodiacSign(ascendant),
          degree: ascendant % 30
        },
        mc: {
          longitude: mc,
          sign: getZodiacSign(mc),
          degree: mc % 30
        }
      },
      planets,
      houses,
      aspects
    };
    
    // Generate interpretations
    const interpretations = interpretationService.generateChartInterpretation(chartData);
    
    // Return the complete chart data with interpretations
    return {
      ...chartData,
      interpretations
    };
  } catch (error) {
    console.error("Error calculating birth chart:", error);
    throw new ApiError(500, "Error calculating birth chart");
  }
};

module.exports = {
  calculateBirthChart
};
