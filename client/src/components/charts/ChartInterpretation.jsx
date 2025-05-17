import React from 'react';

const ChartInterpretation = ({ chartData, name }) => {
  // If there are no interpretations, show a default message
  if (!chartData.interpretations) {
    return (
      <div className="bg-night-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-night-200 mb-4">Chart Interpretation</h3>
        <p className="text-night-300">
          Detailed interpretations are being developed for this chart. 
          Please check back later for a complete analysis.
        </p>
      </div>
    );
  }
  
  const { interpretations } = chartData;
  
  // Helper function to get the element of a zodiac sign
  const getElement = (sign) => {
    const elements = {
      Aries: 'Fire',
      Leo: 'Fire',
      Sagittarius: 'Fire',
      Taurus: 'Earth',
      Virgo: 'Earth',
      Capricorn: 'Earth',
      Gemini: 'Air',
      Libra: 'Air',
      Aquarius: 'Air',
      Cancer: 'Water',
      Scorpio: 'Water',
      Pisces: 'Water'
    };
    return elements[sign] || '';
  };
  
  // Helper function to get the sign from a position
  const getSign = (position) => {
    const zodiacSigns = [
      'Aries', 'Taurus', 'Gemini', 'Cancer',
      'Leo', 'Virgo', 'Libra', 'Scorpio',
      'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return zodiacSigns[Math.floor(position / 30)];
  };
  
  // Count elements to determine elemental balance
  const countElements = () => {
    const elementCounts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
    
    Object.values(chartData.planets).forEach(planet => {
      const sign = getSign(planet.position);
      const element = getElement(sign);
      elementCounts[element]++;
    });
    
    return elementCounts;
  };
  
  const elementCounts = countElements();
  
  // Find the dominant element
  const dominantElement = Object.entries(elementCounts).reduce(
    (max, [element, count]) => count > max.count ? { element, count } : max, 
    { element: '', count: 0 }
  ).element;
  
  // Check if there's a lack of any element
  const lackingElements = Object.entries(elementCounts)
    .filter(([_, count]) => count === 0)
    .map(([element]) => element);
  
  return (
    <div className="space-y-6">
      <div className="bg-night-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-night-200 mb-4">Overall Profile</h3>
        <p className="text-night-300 mb-4">
          {name}'s birth chart reveals a personality with {dominantElement ? `strong ${dominantElement} element influences` : 'a balanced elemental makeup'}.
          {lackingElements.length > 0 && ` There may be less emphasis on the ${lackingElements.join(' and ')} elements.`}
        </p>
        
        {interpretations.overall && (
          <div className="mt-4">
            <h4 className="text-lg font-medium text-primary-300 mb-2">Key Themes</h4>
            <p className="text-night-200">{interpretations.overall}</p>
          </div>
        )}
        
        <div className="mt-6 grid grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${elementCounts.Fire > 0 ? 'bg-red-900' : 'bg-night-800'}`}>
            <h5 className="font-medium text-white mb-1">Fire</h5>
            <div className="text-xl font-bold">{elementCounts.Fire}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${elementCounts.Earth > 0 ? 'bg-green-900' : 'bg-night-800'}`}>
            <h5 className="font-medium text-white mb-1">Earth</h5>
            <div className="text-xl font-bold">{elementCounts.Earth}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${elementCounts.Air > 0 ? 'bg-blue-900' : 'bg-night-800'}`}>
            <h5 className="font-medium text-white mb-1">Air</h5>
            <div className="text-xl font-bold">{elementCounts.Air}</div>
          </div>
          <div className={`p-3 rounded-lg text-center ${elementCounts.Water > 0 ? 'bg-purple-900' : 'bg-night-800'}`}>
            <h5 className="font-medium text-white mb-1">Water</h5>
            <div className="text-xl font-bold">{elementCounts.Water}</div>
          </div>
        </div>
      </div>
      
      {/* Planet interpretations */}
      <div className="bg-night-700 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-night-200 mb-4">Planetary Influences</h3>
        
        <div className="space-y-4">
          {Object.entries(chartData.planets).map(([planet, data]) => {
            const sign = getSign(data.position);
            const interpretationKey = `${planet.toLowerCase()}_${sign.toLowerCase()}`;
            const interpretation = interpretations[interpretationKey] || 
                                 interpretations[`${planet.toLowerCase()}_in_${sign.toLowerCase()}`] ||
                                 null;
            
            if (!interpretation) return null;
            
            return (
              <div key={planet} className="bg-night-800 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-primary-300 mb-2">
                  {planet} in {sign}
                  {data.retrograde && <span className="ml-2 text-sm text-indigo-400">(Retrograde)</span>}
                </h4>
                <p className="text-night-200">{interpretation}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Aspect interpretations */}
      {chartData.aspects && chartData.aspects.length > 0 && (
        <div className="bg-night-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-night-200 mb-4">Key Aspects</h3>
          
          <div className="space-y-4">
            {chartData.aspects.filter(aspect => aspect.interpretation).slice(0, 5).map((aspect, index) => (
              <div key={index} className="bg-night-800 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-primary-300 mb-2">
                  {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                </h4>
                <p className="text-night-200">{aspect.interpretation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* House interpretations */}
      {interpretations.houses && (
        <div className="bg-night-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-night-200 mb-4">Houses</h3>
          
          <div className="space-y-4">
            {Object.entries(interpretations.houses).map(([house, text]) => (
              <div key={house} className="bg-night-800 p-4 rounded-lg">
                <h4 className="text-lg font-medium text-primary-300 mb-2">
                  House {house}
                </h4>
                <p className="text-night-200">{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartInterpretation;
