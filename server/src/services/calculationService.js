const swisseph = require('swisseph');
const { ApiError } = require('../utils/errorHandler');
const path = require('path');
const fs = require('fs');

/**
 * Service for astronomical calculations related to birth charts
 */
class CalculationService {
  constructor() {
    // Initialize Swiss Ephemeris
    this.swe = swisseph;
    
    // Set ephemeris path
    const ephePath = path.join(process.cwd(), 'ephe');
    this.swe.swe_set_ephe_path(ephePath);
    
    // Check if ephemeris files exist
    this.hasEphemerisFiles = this.checkEphemerisFiles(ephePath);
    
    // Planetary indices (Swiss Ephemeris constants)
    this.planets = {
      Sun: this.swe.SE_SUN,
      Moon: this.swe.SE_MOON,
      Mercury: this.swe.SE_MERCURY,
      Venus: this.swe.SE_VENUS,
      Mars: this.swe.SE_MARS,
      Jupiter: this.swe.SE_JUPITER,
      Saturn: this.swe.SE_SATURN,
      Uranus: this.swe.SE_URANUS,
      Neptune: this.swe.SE_NEPTUNE,
      Pluto: this.swe.SE_PLUTO
    };
    
    // Aspect types and their orbs
    this.aspects = {
      conjunction: { angle: 0, orb: 8 },
      opposition: { angle: 180, orb: 8 },
      trine: { angle: 120, orb: 5 },
      square: { angle: 90, orb: 5 },
      sextile: { angle: 60, orb: 4 }
    };
    
    // Zodiac signs
    this.zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    
    // House systems
    this.houseSystems = {
      placidus: 'P',
      koch: 'K',
      whole_sign: 'W',
      equal: 'E',
      porphyry: 'O',
      regiomontanus: 'R',
      campanus: 'C'
    };
    
    console.log(`Calculation Service Initialized. Using simplified calculations: ${!this.hasEphemerisFiles}`);
  }
  
  /**
   * Check if ephemeris files exist
   */
  checkEphemerisFiles(ephePath) {
    const requiredFiles = ['seas_18.se1', 'semo_18.se1', 'sepl_18.se1'];
    const missingFiles = [];
    
    requiredFiles.forEach(file => {
      const filePath = path.join(ephePath, file);
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file);
      }
    });
    
    if (missingFiles.length > 0) {
      console.warn(`Warning: Missing ephemeris files: ${missingFiles.join(', ')}`);
      console.warn('Using simplified calculations (less accurate but works without files)');
      return false;
    }
    
    return true;
  }
  
  /**
   * Calculate a birth chart
   * 
   * @param {Object} data - Birth data
   * @param {string} data.name - Name of the person
   * @param {string} data.birthDate - Birth date in YYYY-MM-DD format
   * @param {string} data.birthTime - Birth time in HH:MM format
   * @param {string} data.birthPlace - Birth place in "City, Country" format
   * @param {Object} [data.coordinates] - Geographic coordinates (optional)
   * @param {number} data.coordinates.latitude - Latitude
   * @param {number} data.coordinates.longitude - Longitude
   * @param {string} [data.houseSystem='placidus'] - House system
   * @returns {Object} Birth chart data
   */
  async calculateBirthChart(data) {
    try {
      const { name, birthDate, birthTime, birthPlace, coordinates, houseSystem = 'placidus' } = data;
      
      // Parse birth date and time
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      
      // Calculate Julian day
      const julianDay = this.swe.swe_julday(year, month, day, hour + minute/60, this.swe.SE_GREG_CAL);
      
      // Use provided coordinates or geocode the birth place
      const coords = coordinates || await this.geocodeBirthPlace(birthPlace);
      
      let planets, houses, aspects;
      
      if (this.hasEphemerisFiles) {
        // Use Swiss Ephemeris for precise calculations
        houses = this.calculateHouses(julianDay, coords, houseSystem);
        planets = this.calculatePlanetPositions(julianDay);
        aspects = this.calculateAspects(planets);
      } else {
        // Use simplified calculations when ephemeris files are missing
        houses = this.calculateSimplifiedHouses(julianDay, coords, houseSystem);
        planets = this.calculateSimplifiedPlanetPositions(julianDay);
        aspects = this.calculateAspects(planets);
      }
      
      // Generate interpretations
      const interpretations = this.generateInterpretations(planets, houses, aspects);
      
      return {
        name,
        birthDate,
        birthTime,
        birthPlace,
        coordinates: coords,
        julianDay,
        houses,
        planets,
        aspects,
        interpretations,
        ascendant: houses[0].cusp
      };
    } catch (error) {
      console.error('Error calculating birth chart:', error);
      throw new ApiError(500, 'Failed to calculate birth chart');
    }
  }
  
  /**
   * Calculate synastry between two charts
   * 
   * @param {Object} chartA - First chart data
   * @param {Object} chartB - Second chart data
   * @returns {Object} Synastry data
   */
  calculateSynastry(chartA, chartB) {
    try {
      // Calculate cross-chart aspects
      const aspects = this.calculateSynastryAspects(chartA.planets, chartB.planets);
      
      // Calculate compatibility score
      const compatibility = this.calculateCompatibilityScore(aspects);
      
      return {
        aspects,
        compatibility
      };
    } catch (error) {
      console.error('Error calculating synastry:', error);
      throw new ApiError(500, 'Failed to calculate synastry');
    }
  }
  
  /**
   * Geocode birth place to get coordinates
   * 
   * @param {string} birthPlace - Birth place in "City, Country" format
   * @returns {Object} Coordinates
   */
  async geocodeBirthPlace(birthPlace) {
    // In a real implementation, you would call a geocoding API like Google Maps
    // For now, return dummy coordinates (New York City)
    return {
      latitude: 40.7128,
      longitude: -74.0060
    };
  }
  
  /**
   * Calculate house cusps using Swiss Ephemeris
   * 
   * @param {number} julianDay - Julian day
   * @param {Object} coords - Coordinates
   * @param {string} houseSystem - House system
   * @returns {Array} House cusps
   */
  calculateHouses(julianDay, coords, houseSystem) {
    try {
      // Get house system code
      const hsys = this.houseSystems[houseSystem] || 'P';
      
      // Calculate houses
      const { house_cusps } = this.swe.swe_houses(
        julianDay,
        coords.latitude,
        coords.longitude,
        hsys
      );
      
      // Format house data
      return house_cusps.map((cusp, index) => ({
        number: index + 1,
        cusp,
        sign: this.zodiacSigns[Math.floor(cusp / 30)]
      }));
    } catch (error) {
      console.error('Error calculating houses:', error);
      return this.calculateSimplifiedHouses(julianDay, coords, houseSystem);
    }
  }
  
  /**
   * Calculate simplified house cusps when ephemeris is not available
   * 
   * @param {number} julianDay - Julian day
   * @param {Object} coords - Coordinates
   * @param {string} houseSystem - House system
   * @returns {Array} House cusps
   */
  calculateSimplifiedHouses(julianDay, coords, houseSystem) {
    console.log('Using simplified house calculation');
    const houses = [];
    
    // Calculate a simple Ascendant based on time of day
    // This is a very simplified approach for demo purposes
    const timeOfDay = (julianDay % 1) * 24; // Hour of day (0-24)
    const baseAscendant = (timeOfDay * 15) % 360; // Simple rotation of ascendant
    
    for (let i = 0; i < 12; i++) {
      // Start from ascendant and create 12 equal houses
      const cusp = (baseAscendant + i * 30) % 360;
      houses.push({
        number: i + 1,
        cusp,
        sign: this.zodiacSigns[Math.floor(cusp / 30)]
      });
    }
    
    return houses;
  }
  
  /**
   * Calculate planetary positions using Swiss Ephemeris
   * 
   * @param {number} julianDay - Julian day
   * @returns {Object} Planetary positions
   */
  calculatePlanetPositions(julianDay) {
    const positions = {};
    
    // Calculate position for each planet
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
        console.error(`Error calculating position for ${name}:`, error);
        
        // Use fallback position
        const fallbackPosition = this.getSimplifiedPlanetPosition(name, julianDay);
        positions[name] = {
          position: fallbackPosition,
          retrograde: false,
          speed: 0,
          sign: this.zodiacSigns[Math.floor(fallbackPosition / 30)]
        };
      }
    });
    
    return positions;
  }
  
  /**
   * Calculate simplified planetary positions when ephemeris is not available
   * 
   * @param {number} julianDay - Julian day
   * @returns {Object} Planetary positions
   */
  calculateSimplifiedPlanetPositions(julianDay) {
    console.log('Using simplified planetary calculations');
    const positions = {};
    
    // Calculate position for each planet using simplified approach
    Object.entries(this.planets).forEach(([name, index]) => {
      const position = this.getSimplifiedPlanetPosition(name, julianDay);
      
      positions[name] = {
        position,
        retrograde: false, // Simplified calculation doesn't determine retrograde
        speed: 0,
        sign: this.zodiacSigns[Math.floor(position / 30)]
      };
    });
    
    return positions;
  }
  
  /**
   * Get simplified position for a planet
   * This is a very simplified approach for demo purposes
   * 
   * @param {string} planet - Planet name
   * @param {number} julianDay - Julian day
   * @returns {number} Position in degrees (0-360)
   */
  getSimplifiedPlanetPosition(planet, julianDay) {
    // Estimated orbital periods in days
    const orbitalPeriods = {
      Sun: 365.25, // Earth's orbital period
      Moon: 27.32,
      Mercury: 87.97,
      Venus: 224.7,
      Mars: 686.98,
      Jupiter: 4332.59,
      Saturn: 10759.22,
      Uranus: 30688.5,
      Neptune: 60182,
      Pluto: 90560
    };
    
    // Reference Julian day (J2000.0 = January 1, 2000, at 12:00 TT)
    const j2000 = 2451545.0;
    
    // Calculate days since J2000.0
    const daysSinceJ2000 = julianDay - j2000;
    
    // Calculate angle based on orbital period (simplified)
    // For each planet, we use a different starting position and rotation rate
    let position;
    
    if (planet === 'Sun') {
      // The Sun's position is actually Earth's orbit, starting from 280 degrees at J2000
      position = (280 + (daysSinceJ2000 / orbitalPeriods.Sun) * 360) % 360;
    } else {
      // Random but consistent starting position for each planet
      const startingPosition = (this.planets[planet] * 30) % 360;
      // Position based on orbital period
      position = (startingPosition + (daysSinceJ2000 / orbitalPeriods[planet]) * 360) % 360;
    }
    
    return position;
  }
  
  /**
   * Calculate aspects between planets
   * 
   * @param {Object} planets - Planetary positions
   * @returns {Array} Aspects
   */
  calculateAspects(planets) {
    const aspects = [];
    const planetNames = Object.keys(planets);
    
    // Check aspects between each planet pair
    for (let i = 0; i < planetNames.length; i++) {
      const planet1 = planetNames[i];
      const pos1 = planets[planet1].position;
      
      for (let j = i + 1; j < planetNames.length; j++) {
        const planet2 = planetNames[j];
        const pos2 = planets[planet2].position;
        
        // Calculate angle between planets
        let angle = Math.abs(pos1 - pos2);
        
        // Normalize to 0-180 range
        if (angle > 180) {
          angle = 360 - angle;
        }
        
        // Check if it makes an aspect
        Object.entries(this.aspects).forEach(([aspectType, aspectData]) => {
          const orb = Math.abs(angle - aspectData.angle);
          
          if (orb <= aspectData.orb) {
            aspects.push({
              planet1,
              planet2,
              aspectType,
              angle: aspectData.angle,
              orb
            });
          }
        });
      }
    }
    
    return aspects;
  }
  
  /**
   * Calculate synastry aspects between two charts
   * 
   * @param {Object} planetsA - First chart planets
   * @param {Object} planetsB - Second chart planets
   * @returns {Array} Synastry aspects
   */
  calculateSynastryAspects(planetsA, planetsB) {
    const aspects = [];
    
    // Check aspects between planets from chart A and B
    Object.entries(planetsA).forEach(([planet1, data1]) => {
      const pos1 = data1.position;
      
      Object.entries(planetsB).forEach(([planet2, data2]) => {
        const pos2 = data2.position;
        
        // Calculate angle between planets
        let angle = Math.abs(pos1 - pos2);
        
        // Normalize to 0-180 range
        if (angle > 180) {
          angle = 360 - angle;
        }
        
        // Check if it makes an aspect
        Object.entries(this.aspects).forEach(([aspectType, aspectData]) => {
          const orb = Math.abs(angle - aspectData.angle);
          
          if (orb <= aspectData.orb) {
            // Generate interpretation
            let interpretation = '';
            
            switch (aspectType) {
              case 'conjunction':
                interpretation = `Strong connection between ${planet1} and ${planet2} energies`;
                break;
              case 'opposition':
                interpretation = `Potential tension between ${planet1} and ${planet2} energies`;
                break;
              case 'trine':
                interpretation = `Harmonious flow between ${planet1} and ${planet2} energies`;
                break;
              case 'square':
                interpretation = `Dynamic challenge between ${planet1} and ${planet2} energies`;
                break;
              case 'sextile':
                interpretation = `Opportunity for growth between ${planet1} and ${planet2} energies`;
                break;
            }
            
            aspects.push({
              planetA: planet1,
              planetB: planet2,
              aspect: aspectType,
              angle: aspectData.angle,
              orb,
              interpretation
            });
          }
        });
      });
    });
    
    return aspects;
  }
  
  /**
   * Calculate compatibility score from synastry aspects
   * 
   * @param {Array} aspects - Synastry aspects
   * @returns {number} Compatibility score (0-100)
   */
  calculateCompatibilityScore(aspects) {
    if (!aspects.length) return 50;
    
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
    
    aspects.forEach(aspect => {
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
  }
  
  /**
   * Generate interpretations for chart elements
   * 
   * @param {Object} planets - Planetary positions
   * @param {Array} houses - House cusps
   * @param {Array} aspects - Aspects
   * @returns {Object} Interpretations
   */
  generateInterpretations(planets, houses, aspects) {
    // Very simplified interpretations for demo purposes
    const interpretations = {
      overall: "This birth chart reveals your unique celestial blueprint at the moment of birth.",
    };
    
    // Planet in sign interpretations
    Object.entries(planets).forEach(([planet, data]) => {
      const sign = this.zodiacSigns[Math.floor(data.position / 30)];
      const key = `${planet.toLowerCase()}_${sign.toLowerCase()}`;
      
      // Basic planet-sign interpretations
      switch (planet) {
        case 'Sun':
          interpretations[key] = `Your Sun in ${sign} represents your core identity and ego. ${this.getSunInterpretation(sign)}`;
          break;
        case 'Moon':
          interpretations[key] = `Your Moon in ${sign} represents your emotional nature. ${this.getMoonInterpretation(sign)}`;
          break;
        case 'Mercury':
          interpretations[key] = `Your Mercury in ${sign} represents how you think and communicate. ${this.getMercuryInterpretation(sign)}`;
          break;
        case 'Venus':
          interpretations[key] = `Your Venus in ${sign} represents how you approach love and value. ${this.getVenusInterpretation(sign)}`;
          break;
        case 'Mars':
          interpretations[key] = `Your Mars in ${sign} represents your drive and assertiveness. ${this.getMarsInterpretation(sign)}`;
          break;
        default:
          interpretations[key] = `Your ${planet} in ${sign} influences certain aspects of your personality and life path.`;
      }
      
      // Add retrograde interpretation if applicable
      if (data.retrograde) {
        interpretations[`${planet.toLowerCase()}_retrograde`] = 
          `With ${planet} retrograde, you may experience its energy in a more internalized way.`;
      }
    });
    
    // Add aspect interpretations
    aspects.forEach(aspect => {
      const aspectKey = `${aspect.planet1}_${aspect.aspectType}_${aspect.planet2}`;
      
      let interpretation = '';
      
      switch (aspect.aspectType) {
        case 'conjunction':
          interpretation = `Your ${aspect.planet1} conjunct ${aspect.planet2} indicates a powerful blending of these energies.`;
          break;
        case 'opposition':
          interpretation = `Your ${aspect.planet1} opposition ${aspect.planet2} suggests a tension that requires balance.`;
          break;
        case 'trine':
          interpretation = `Your ${aspect.planet1} trine ${aspect.planet2} represents a harmonious flow of energy.`;
          break;
        case 'square':
          interpretation = `Your ${aspect.planet1} square ${aspect.planet2} indicates dynamic tension that can motivate growth.`;
          break;
        case 'sextile':
          interpretation = `Your ${aspect.planet1} sextile ${aspect.planet2} represents opportunities for growth.`;
          break;
      }
      
      aspect.interpretation = interpretation;
      interpretations[aspectKey] = interpretation;
    });
    
    return interpretations;
  }
  
  // Simplified interpretations for Sun in each sign
  getSunInterpretation(sign) {
    const interpretations = {
      'Aries': 'You are energetic, pioneering, and have a strong independent streak.',
      'Taurus': 'You are reliable, patient, and have a strong appreciation for beauty and comfort.',
      'Gemini': 'You are curious, adaptable, and have a quick and versatile mind.',
      'Cancer': 'You are nurturing, emotionally sensitive, and have strong protective instincts.',
      'Leo': 'You are creative, generous, and have a natural flair for leadership and drama.',
      'Virgo': 'You are analytical, practical, and have a strong attention to detail.',
      'Libra': 'You are diplomatic, fair-minded, and have a strong need for harmony and balance.',
      'Scorpio': 'You are intense, passionate, and have a deep emotional nature.',
      'Sagittarius': 'You are optimistic, adventurous, and have a love for freedom and exploration.',
      'Capricorn': 'You are ambitious, disciplined, and have a strong sense of responsibility.',
      'Aquarius': 'You are innovative, humanitarian, and have an independent and original mind.',
      'Pisces': 'You are compassionate, intuitive, and have a strong spiritual and artistic sensitivity.'
    };
    
    return interpretations[sign] || '';
  }
  
  // Simplified interpretations for Moon in each sign
  getMoonInterpretation(sign) {
    const interpretations = {
      'Aries': 'Your emotional responses are quick, direct, and you need independence to feel secure.',
      'Taurus': 'Your emotional nature seeks stability, comfort, and security in the material world.',
      'Gemini': 'Your emotional nature is adaptable, and you process feelings through communication.',
      'Cancer': 'Your emotions run deep, and you have strong nurturing instincts and need for belonging.',
      'Leo': 'Your emotional nature is warm, generous, and you need recognition and appreciation.',
      'Virgo': 'Your emotional nature is analytical, and you process feelings through practical activity.',
      'Libra': 'Your emotional nature seeks harmony and balance in relationships with others.',
      'Scorpio': 'Your emotional nature is intense and deep, with strong transformative potential.',
      'Sagittarius': 'Your emotional nature is optimistic and seeks meaning and adventure in life.',
      'Capricorn': 'Your emotional nature is reserved, and you seek security through achievement.',
      'Aquarius': 'Your emotional nature is detached, and you process feelings through intellect.',
      'Pisces': 'Your emotional nature is sensitive and compassionate, with deep empathy for others.'
    };
    
    return interpretations[sign] || '';
  }
  
  // Simplified interpretations for Mercury in each sign
  getMercuryInterpretation(sign) {
    const interpretations = {
      'Aries': 'Your thinking is quick, direct, and you express ideas with enthusiasm and initiative.',
      'Taurus': 'Your thinking is practical, methodical, and you prefer concrete, tangible information.',
      'Gemini': 'Your thinking is versatile, curious, and you communicate with adaptability and wit.',
      'Cancer': 'Your thinking is intuitive, and you communicate with empathy and emotional sensitivity.',
      'Leo': 'Your thinking is creative, expressive, and you communicate with warmth and drama.',
      'Virgo': 'Your thinking is analytical, precise, and you communicate with attention to detail.',
      'Libra': 'Your thinking seeks balance, and you communicate with diplomacy and fairness.',
      'Scorpio': 'Your thinking is penetrating, and you communicate with depth and intensity.',
      'Sagittarius': 'Your thinking is expansive, and you communicate with enthusiasm and directness.',
      'Capricorn': 'Your thinking is structured, and you communicate with precision and authority.',
      'Aquarius': 'Your thinking is innovative, and you communicate with originality and detachment.',
      'Pisces': 'Your thinking is intuitive, and you communicate with imagination and sensitivity.'
    };
    
    return interpretations[sign] || '';
  }
  
  // Simplified interpretations for Venus in each sign
  getVenusInterpretation(sign) {
    const interpretations = {
      'Aries': 'In love and aesthetics, you value directness, excitement, and independent expression.',
      'Taurus': 'In love and aesthetics, you value sensuality, comfort, and tangible expressions of affection.',
      'Gemini': 'In love and aesthetics, you value mental connection, variety, and playful communication.',
      'Cancer': 'In love and aesthetics, you value emotional security, nurturing, and close family bonds.',
      'Leo': 'In love and aesthetics, you value dramatic expression, generosity, and passionate devotion.',
      'Virgo': 'In love and aesthetics, you value thoughtfulness, practical assistance, and meaningful service.',
      'Libra': 'In love and aesthetics, you value harmony, balance, and partnership in relationships.',
      'Scorpio': 'In love and aesthetics, you value intensity, depth, and transformative connections.',
      'Sagittarius': 'In love and aesthetics, you value freedom, adventure, and philosophical connection.',
      'Capricorn': 'In love and aesthetics, you value commitment, traditional values, and lasting bonds.',
      'Aquarius': 'In love and aesthetics, you value friendship, intellectual connection, and uniqueness.',
      'Pisces': 'In love and aesthetics, you value spiritual connection, compassion, and romantic idealism.'
    };
    
    return interpretations[sign] || '';
  }
  
  // Simplified interpretations for Mars in each sign
  getMarsInterpretation(sign) {
    const interpretations = {
      'Aries': 'You assert yourself directly, with courage and a pioneering spirit.',
      'Taurus': 'You assert yourself steadily, with determination and practical persistence.',
      'Gemini': 'You assert yourself through communication, wit, and versatile approaches.',
      'Cancer': 'You assert yourself through emotional sensitivity, nurturing, and protection.',
      'Leo': 'You assert yourself dramatically, with confidence and creative leadership.',
      'Virgo': 'You assert yourself methodically, with precise analysis and practical efficiency.',
      'Libra': 'You assert yourself diplomatically, seeking fairness and harmony in action.',
      'Scorpio': 'You assert yourself intensely, with strategic thinking and emotional power.',
      'Sagittarius': 'You assert yourself expansively, with optimism and philosophical drive.',
      'Capricorn': 'You assert yourself methodically, with discipline and long-term ambition.',
      'Aquarius': 'You assert yourself independently, with innovative and humanitarian goals.',
      'Pisces': 'You assert yourself subtly, with compassion and intuitive timing.'
    };
    
    return interpretations[sign] || '';
  }
}

module.exports = new CalculationService();
