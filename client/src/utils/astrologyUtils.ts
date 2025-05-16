/**
 * Get zodiac sign based on degrees
 */
export const getZodiacSign = (longitude: number): string => {
  const signs = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 
    'Leo', 'Virgo', 'Libra', 'Scorpio', 
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Each sign is 30 degrees, so divide by 30 to get the sign index
  const signIndex = Math.floor(longitude / 30) % 12;
  return signs[signIndex];
};

/**
 * Get sign element
 */
export const getSignElement = (sign: string): string => {
  const fireSign = ['Aries', 'Leo', 'Sagittarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
  
  if (fireSign.includes(sign)) return 'Fire';
  if (earthSigns.includes(sign)) return 'Earth';
  if (airSigns.includes(sign)) return 'Air';
  if (waterSigns.includes(sign)) return 'Water';
  
  return '';
};

/**
 * Get planet symbol
 */
export const getPlanetSymbol = (planet: string): string => {
  const symbols: {[key: string]: string} = {
    'Sun': '☉',
    'Moon': '☽',
    'Mercury': '☿',
    'Venus': '♀',
    'Mars': '♂',
    'Jupiter': '♃',
    'Saturn': '♄',
    'Uranus': '♅',
    'Neptune': '♆',
    'Pluto': '♇'
  };
  
  return symbols[planet] || planet;
};

/**
 * Get aspect symbol
 */
export const getAspectSymbol = (aspectType: string): string => {
  const symbols: {[key: string]: string} = {
    'Conjunction': '☌',
    'Sextile': '⚹',
    'Square': '□',
    'Trine': '△',
    'Opposition': '☍'
  };
  
  return symbols[aspectType] || aspectType;
};

/**
 * Format date
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time
 */
export const formatTime = (timeString: string): string => {
  // Input format is "HH:MM"
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Format as "12:34 PM"
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

/**
 * Get sign color for chart visualization
 */
export const getSignColor = (sign: string): string => {
  const colors: {[key: string]: string} = {
    'Aries': '#FF4136',
    'Taurus': '#2ECC40',
    'Gemini': '#FFDC00',
    'Cancer': '#B10DC9',
    'Leo': '#FF851B',
    'Virgo': '#7FDBFF',
    'Libra': '#F012BE',
    'Scorpio': '#111111',
    'Sagittarius': '#01FF70',
    'Capricorn': '#0074D9',
    'Aquarius': '#85144b',
    'Pisces': '#39CCCC'
  };
  
  return colors[sign] || '#AAAAAA';
};
