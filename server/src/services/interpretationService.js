const interpretationData = require('../utils/interpretationData');
const { ApiError } = require('../utils/errorHandler');

/**
 * Generate interpretations for a birth chart
 * @param {Object} chartData - Complete birth chart data
 * @returns {Object} - Interpretations for the chart
 */
const generateChartInterpretation = (chartData) => {
  try {
    const { planets, houses, aspects, points } = chartData;
    
    // Create individual interpretation sections
    const interpretations = {
      ascendant: interpretAscendant(points.ascendant),
      planetaryPositions: interpretPlanetaryPositions(planets),
      houseSystem: interpretHouses(houses, planets),
      aspects: interpretAspects(aspects),
      summary: generateSummary(chartData)
    };
    
    return interpretations;
  } catch (error) {
    console.error('Error generating interpretation:', error);
    throw new ApiError(500, 'Failed to generate chart interpretation');
  }
};

/**
 * Interpret the Ascendant/Rising sign
 */
const interpretAscendant = (ascendant) => {
  const signData = interpretationData.signs[ascendant.sign];
  
  return {
    title: `${ascendant.sign} Rising at ${ascendant.degree.toFixed(1)}°`,
    description: `Your Ascendant is in ${ascendant.sign}, which colors how others perceive you and your natural approach to life. ${signData.description} As a ${signData.element} sign with ${signData.quality} energy, your rising sign gives you ${signData.keywords.join(', ')} as natural traits in your self-presentation.`,
    keywords: signData.keywords,
    element: signData.element,
    quality: signData.quality
  };
};

/**
 * Interpret planetary positions
 */
const interpretPlanetaryPositions = (planets) => {
  return planets.map(planet => {
    const planetData = interpretationData.planets[planet.name];
    const signData = interpretationData.signs[planet.sign];
    const houseData = interpretationData.houses[planet.house];
    
    // Build retrograde text if applicable
    const retrogradeText = planet.isRetrograde 
      ? `Since ${planet.name} is retrograde, these energies may be more internalized or require revisiting past issues.` 
      : '';
    
    return {
      title: `${planet.name} in ${planet.sign} (House ${planet.house})`,
      description: `Your ${planet.name} is in ${planet.sign} at ${planet.degree.toFixed(1)}° in your ${planet.house}${getOrdinalSuffix(planet.house)} house. ${planetData.description} With this placement in ${planet.sign}, ${getPersonalizedPlanetaryInterpretation(planet.name, planet.sign)}. ${retrogradeText} In your ${planet.house}${getOrdinalSuffix(planet.house)} house, this energy expresses through ${houseData.keywords.join(', ')}.`,
      keywords: [...planetData.keywords, ...signData.keywords],
      house: planet.house,
      retrograde: planet.isRetrograde
    };
  });
};

/**
 * Interpret house placements
 */
const interpretHouses = (houses, planets) => {
  // Group planets by house
  const planetsByHouse = {};
  planets.forEach(planet => {
    if (!planetsByHouse[planet.house]) {
      planetsByHouse[planet.house] = [];
    }
    planetsByHouse[planet.house].push(planet);
  });
  
  // Create interpretations for each house
  return houses.map(house => {
    const houseData = interpretationData.houses[house.house];
    const housePlanets = planetsByHouse[house.house] || [];
    
    let planetText = '';
    if (housePlanets.length > 0) {
      const planetNames = housePlanets.map(p => p.name).join(', ');
      planetText = `This house contains ${planetNames}, bringing focus to these areas of life.`;
    } else {
      planetText = 'This house has no planets, suggesting these areas may not be primary focuses.';
    }
    
    return {
      title: `House ${house.house} in ${house.sign}`,
      description: `Your ${house.house}${getOrdinalSuffix(house.house)} house begins in ${house.sign} at ${house.degree.toFixed(1)}°. ${houseData.description} With ${house.sign} influencing this house, these matters are approached with ${interpretationData.signs[house.sign].keywords.join(', ')}. ${planetText}`,
      keywords: houseData.keywords,
      planets: housePlanets.map(p => p.name)
    };
  });
};

/**
 * Interpret aspects between planets
 */
const interpretAspects = (aspects) => {
  return aspects.map(aspect => {
    const aspectData = interpretationData.aspects[aspect.type];
    
    return {
      title: `${aspect.planet1} ${aspect.type} ${aspect.planet2}`,
      description: `Your ${aspect.planet1} forms a ${aspect.type.toLowerCase()} (${aspectData.symbol}) to your ${aspect.planet2} with an orb of ${aspect.orb.toFixed(1)}°. ${aspectData.description} This ${aspectData.nature} aspect indicates ${getPersonalizedAspectInterpretation(aspect.planet1, aspect.planet2, aspect.type)}.`,
      nature: aspectData.nature,
      orb: aspect.orb,
      symbol: aspectData.symbol
    };
  });
};

/**
 * Generate a personalized summary of the chart
 */
const generateSummary = (chartData) => {
  const { planets, houses, aspects, points, info } = chartData;
  
  // Count elements to determine chart emphasis
  const elementCount = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };
  
  planets.forEach(planet => {
    const sign = planet.sign;
    const element = interpretationData.signs[sign].element;
    elementCount[element]++;
  });
  
  // Determine dominant elements
  const dominantElements = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .filter(([_, count]) => count > 0)
    .map(([element]) => element);
  
  // Count modalities to determine action style
  const modalityCount = {
    Cardinal: 0,
    Fixed: 0,
    Mutable: 0
  };
  
  planets.forEach(planet => {
    const sign = planet.sign;
    const quality = interpretationData.signs[sign].quality;
    modalityCount[quality]++;
  });
  
  // Determine dominant modality
  const dominantModality = Object.entries(modalityCount)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  // Identify important aspects
  const significantAspects = aspects
    .filter(aspect => 
      (aspect.planet1 === 'Sun' || aspect.planet2 === 'Sun' || 
       aspect.planet1 === 'Moon' || aspect.planet2 === 'Moon' || 
       aspect.planet1 === 'Ascendant' || aspect.planet2 === 'Ascendant') && 
      (aspect.type === 'Conjunction' || aspect.type === 'Opposition')
    );
  
  // Generate the summary text
  let summaryText = `Your birth chart with ${points.ascendant.sign} Rising shows `;
  
  if (dominantElements.length > 0) {
    summaryText += `a strong emphasis on ${dominantElements.join(' and ')} energy, `;
  }
  
  summaryText += `with a predominantly ${dominantModality.toLowerCase()} approach to life. `;
  
  // Add sun and moon info
  const sun = planets.find(p => p.name === 'Sun');
  const moon = planets.find(p => p.name === 'Moon');
  
  if (sun) {
    summaryText += `With your Sun in ${sun.sign} in the ${sun.house}${getOrdinalSuffix(sun.house)} house, your core identity and purpose centers around ${interpretationData.houses[sun.house].keywords.join(', ')}. `;
  }
  
  if (moon) {
    summaryText += `Your Moon in ${moon.sign} in the ${moon.house}${getOrdinalSuffix(moon.house)} house reflects emotional needs related to ${interpretationData.houses[moon.house].keywords.join(', ')}. `;
  }
  
  // Add aspect patterns if significant
  if (significantAspects.length > 0) {
    summaryText += 'Particularly notable in your chart is ';
    significantAspects.forEach((aspect, index) => {
      if (index > 0) {
        summaryText += index === significantAspects.length - 1 ? ' and ' : ', ';
      }
      summaryText += `the ${aspect.type.toLowerCase()} between your ${aspect.planet1} and ${aspect.planet2}`;
    });
    summaryText += '. ';
  }
  
  // Add closing statement
  summaryText += `This birth chart reflects your unique cosmic blueprint, with both strengths to express and challenges that offer growth.`;
  
  return {
    title: 'Birth Chart Summary',
    description: summaryText,
    dominantElements,
    dominantModality,
    elementBalance: elementCount,
    modalityBalance: modalityCount
  };
};

/**
 * Helper function to generate personalized planetary interpretations
 */
const getPersonalizedPlanetaryInterpretation = (planet, sign) => {
  // This would ideally be a large database of specific interpretations
  // For now, we'll use a simpler approach with templates
  
  const templates = {
    'Sun': {
      'Aries': 'your core identity expresses through leadership, courage, and pioneering energy',
      'Taurus': 'your essential self values stability, sensuality, and material security',
      'Gemini': 'your identity centers around communication, curiosity, and mental agility',
      'Cancer': 'your core self is emotionally sensitive, nurturing, and protective',
      'Leo': 'your essential nature radiates creativity, self-expression, and natural leadership',
      'Virgo': 'your identity focuses on analysis, improvement, and practical service',
      'Libra': 'your core self seeks harmony, fairness, and balanced relationships',
      'Scorpio': 'your essential nature is intense, transformative, and psychologically deep',
      'Sagittarius': 'your identity embodies exploration, optimism, and philosophical meaning',
      'Capricorn': 'your core self is ambitious, disciplined, and focused on achievement',
      'Aquarius': 'your essential nature is innovative, humanitarian, and independent',
      'Pisces': 'your identity is compassionate, imaginative, and spiritually oriented'
    },
    'Moon': {
      'Aries': 'you emotionally respond with immediacy, directness, and a need for independence',
      'Taurus': 'your emotional needs center around security, comfort, and sensory pleasure',
      'Gemini': 'you process feelings through conversation, mental analysis, and variety',
      'Cancer': 'your emotions run deep, with strong nurturing instincts and sensitivity',
      'Leo': 'you emotionally thrive on warmth, recognition, and creative expression',
      'Virgo': 'your emotional wellbeing requires order, routine, and useful purpose',
      'Libra': 'you emotionally need harmony, beauty, and balanced relationships',
      'Scorpio': 'your emotional life is intense, private, and transformational',
      'Sagittarius': 'you emotionally thrive with freedom, optimism, and meaningful experiences',
      'Capricorn': 'your emotional security comes through achievement, structure, and responsibility',
      'Aquarius': 'you emotionally detach, valuing intellectual connection and social ideals',
      'Pisces': 'your emotional nature is fluid, empathic, and spiritually receptive'
    }
  };
  
  // If we have a specific template for this planet-sign combination, use it
  if (templates[planet] && templates[planet][sign]) {
    return templates[planet][sign];
  }
  
  // Otherwise, generate a generic interpretation
  return `these energies express through ${interpretationData.signs[sign].keywords.join(', ')}`;
};

/**
 * Helper function to generate personalized aspect interpretations
 */
const getPersonalizedAspectInterpretation = (planet1, planet2, aspectType) => {
  // This would ideally be a large database of specific interpretations
  // For now, we'll generate based on planet keywords and aspect nature
  
  const planet1Keywords = interpretationData.planets[planet1].keywords;
  const planet2Keywords = interpretationData.planets[planet2].keywords;
  const aspectNature = interpretationData.aspects[aspectType].nature;
  
  let interpretation = '';
  
  if (aspectNature === 'harmonious') {
    interpretation = `a supportive connection between your ${planet1Keywords[0]} and ${planet2Keywords[0]}`;
  } else if (aspectNature === 'challenging') {
    interpretation = `tension between your ${planet1Keywords[0]} and ${planet2Keywords[0]} that can motivate growth`;
  } else if (aspectNature === 'blending') {
    interpretation = `an intensification of both ${planet1Keywords[0]} and ${planet2Keywords[0]} in your life`;
  } else if (aspectNature === 'polarizing') {
    interpretation = `a need to balance your ${planet1Keywords[0]} with your ${planet2Keywords[0]}`;
  }
  
  return interpretation;
};

/**
 * Helper function to get ordinal suffix
 */
const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  
  return 'th';
};

module.exports = {
  generateChartInterpretation
};
