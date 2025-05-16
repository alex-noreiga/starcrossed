import React from 'react';
import { getPlanetSymbol } from '../utils/astrologyUtils';

interface PlanetInterpretationProps {
  planet: string;
  sign: string;
  house: number;
}

const PlanetInterpretation: React.FC<PlanetInterpretationProps> = ({ planet, sign, house }) => {
  // Basic interpretations for demo purposes
  // In a real app, these would be more comprehensive and possibly from a database
  const interpretations: {[key: string]: {[key: string]: string}} = {
    'Sun': {
      'Aries': 'Your core identity is expressed through bold leadership and pioneering spirit.',
      'Taurus': 'You express yourself through practicality, reliability, and an appreciation for beauty.',
      'Gemini': 'Your essence shines through communication, curiosity, and adaptability.',
      'Cancer': 'Your identity is centered around nurturing, emotions, and creating security.',
      'Leo': 'Your core self expresses through creativity, generosity, and natural leadership.',
      'Virgo': 'You express yourself through analysis, practicality, and helping others.',
      'Libra': 'Your identity revolves around harmony, relationships, and a sense of fairness.',
      'Scorpio': 'Your essence is expressed through intensity, depth, and transformation.',
      'Sagittarius': 'You express yourself through optimism, exploration, and philosophical thinking.',
      'Capricorn': 'Your core self is expressed through ambition, discipline, and responsibility.',
      'Aquarius': 'Your identity shines through innovation, humanitarian ideals, and independence.',
      'Pisces': 'You express yourself through imagination, compassion, and spiritual connection.'
    },
    'Moon': {
      'Aries': 'Your emotional nature is direct, quick to react, and needs freedom.',
      'Taurus': 'Your emotional needs center around stability, comfort, and sensory pleasures.',
      'Gemini': 'You process emotions through talking, writing, and mental analysis.',
      'Cancer': 'Your emotional nature is deeply sensitive, nurturing, and tied to memories.',
      'Leo': 'You need emotional drama, warmth, and recognition for emotional satisfaction.',
      'Virgo': 'Your emotional nature seeks order, routine, and practical solutions.',
      'Libra': 'You find emotional balance through relationships and harmony with others.',
      'Scorpio': 'Your emotions run deep, intense, and transformative.',
      'Sagittarius': 'Your emotional nature craves freedom, adventure, and meaning.',
      'Capricorn': 'Your emotions are controlled, serious, and tied to achievement.',
      'Aquarius': 'You process emotions intellectually and value emotional independence.',
      'Pisces': 'Your emotional nature is empathic, fluid, and spiritually attuned.'
    }
  };

  // Default interpretation if specific combination not found
  const defaultInterpretation = `Your ${planet} in ${sign} expresses in the ${house}th house of your chart, influencing that area of life.`;
  
  // Get interpretation or use default
  const interpretation = interpretations[planet]?.[sign] || defaultInterpretation;

  // House meanings for basic context
  const houseMeanings: {[key: number]: string} = {
    1: 'identity and self-expression',
    2: 'values and resources',
    3: 'communication and learning',
    4: 'home and foundations',
    5: 'creativity and pleasure',
    6: 'work and health',
    7: 'relationships and partnerships',
    8: 'transformation and shared resources',
    9: 'expansion and higher learning',
    10: 'career and public standing',
    11: 'community and future vision',
    12: 'spirituality and the unconscious'
  };

  const houseContext = houseMeanings[house] || `the ${house}th house`;

  return (
    <div className="bg-night-800 p-5 rounded-lg">
      <h3 className="text-xl font-medium flex items-center mb-3">
        <span className="text-2xl mr-2">{getPlanetSymbol(planet)}</span>
        <span>{planet} in {sign}</span>
      </h3>
      
      <p className="text-night-300 mb-3">
        {interpretation}
      </p>
      
      <p className="text-night-300">
        This placement falls in your {house}th house of {houseContext}, 
        suggesting its influence manifests in this area of your life.
      </p>
    </div>
  );
};

export default PlanetInterpretation;
