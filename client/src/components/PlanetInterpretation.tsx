import React, { useState } from 'react';

interface PlanetInterpretationProps {
  interpretations: {
    ascendant: {
      title: string;
      description: string;
      keywords: string[];
      element: string;
      quality: string;
    };
    planetaryPositions: Array<{
      title: string;
      description: string;
      keywords: string[];
      house: number;
      retrograde?: boolean;
    }>;
    houseSystem: Array<{
      title: string;
      description: string;
      keywords: string[];
      planets: string[];
    }>;
    aspects: Array<{
      title: string;
      description: string;
      nature: string;
      orb: number;
      symbol: string;
    }>;
    summary: {
      title: string;
      description: string;
      dominantElements: string[];
      dominantModality: string;
      elementBalance: Record<string, number>;
      modalityBalance: Record<string, number>;
    };
  };
}

const PlanetInterpretation: React.FC<PlanetInterpretationProps> = ({ interpretations }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'planets' | 'houses' | 'aspects'>('summary');
  
  // Format percentages for element and modality charts
  const getPercentage = (value: number, total: number) => {
    return Math.round((value / total) * 100) || 0;
  };
  
  // Calculate totals
  const totalElements = Object.values(interpretations.summary.elementBalance).reduce((sum, count) => sum + count, 0);
  const totalModalities = Object.values(interpretations.summary.modalityBalance).reduce((sum, count) => sum + count, 0);
  
  return (
    <div className="planet-interpretation bg-night-800 rounded-xl shadow-xl p-6">
      {/* Tabs Navigation */}
      <div className="flex border-b border-night-600 mb-6">
        <button
          className={`pb-3 px-4 font-medium ${activeTab === 'summary' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-night-300'}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`pb-3 px-4 font-medium ${activeTab === 'planets' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-night-300'}`}
          onClick={() => setActiveTab('planets')}
        >
          Planets
        </button>
        <button
          className={`pb-3 px-4 font-medium ${activeTab === 'houses' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-night-300'}`}
          onClick={() => setActiveTab('houses')}
        >
          Houses
        </button>
        <button
          className={`pb-3 px-4 font-medium ${activeTab === 'aspects' ? 'text-primary-400 border-b-2 border-primary-400' : 'text-night-300'}`}
          onClick={() => setActiveTab('aspects')}
        >
          Aspects
        </button>
      </div>
      
      {/* Summary Tab Content */}
      {activeTab === 'summary' && (
        <div className="summary-tab">
          <h2 className="text-2xl font-serif mb-4">{interpretations.summary.title}</h2>
          <p className="mb-6 text-night-200">{interpretations.summary.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ascendant information */}
            <div className="bg-night-700 rounded-lg p-4">
              <h3 className="text-xl font-medium mb-2">{interpretations.ascendant.title}</h3>
              <p className="mb-3">{interpretations.ascendant.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {interpretations.ascendant.keywords.map((keyword, index) => (
                  <span key={index} className="bg-primary-900 text-primary-100 px-2 py-1 rounded text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Element & Modality Balance */}
            <div className="bg-night-700 rounded-lg p-4">
              <h3 className="text-xl font-medium mb-3">Element & Modality Balance</h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2 text-night-300">ELEMENTS</h4>
                <div className="w-full bg-night-800 rounded-full h-4 mb-1">
                  <div className="flex h-full rounded-full overflow-hidden">
                    <div 
                      className="bg-red-500" 
                      style={{width: `${getPercentage(interpretations.summary.elementBalance['Fire'], totalElements)}%`}}
                      title={`Fire: ${interpretations.summary.elementBalance['Fire']} planets`}
                    ></div>
                    <div 
                      className="bg-green-700" 
                      style={{width: `${getPercentage(interpretations.summary.elementBalance['Earth'], totalElements)}%`}}
                      title={`Earth: ${interpretations.summary.elementBalance['Earth']} planets`}
                    ></div>
                    <div 
                      className="bg-yellow-300" 
                      style={{width: `${getPercentage(interpretations.summary.elementBalance['Air'], totalElements)}%`}}
                      title={`Air: ${interpretations.summary.elementBalance['Air']} planets`}
                    ></div>
                    <div 
                      className="bg-blue-500" 
                      style={{width: `${getPercentage(interpretations.summary.elementBalance['Water'], totalElements)}%`}}
                      title={`Water: ${interpretations.summary.elementBalance['Water']} planets`}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-night-400">
                  <span>Fire: {interpretations.summary.elementBalance['Fire'] || 0}</span>
                  <span>Earth: {interpretations.summary.elementBalance['Earth'] || 0}</span>
                  <span>Air: {interpretations.summary.elementBalance['Air'] || 0}</span>
                  <span>Water: {interpretations.summary.elementBalance['Water'] || 0}</span>
                </div>
              </div>
              
              <div className="mb-2">
                <h4 className="text-sm font-medium mb-2 text-night-300">MODALITIES</h4>
                <div className="w-full bg-night-800 rounded-full h-4 mb-1">
                  <div className="flex h-full rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-500" 
                      style={{width: `${getPercentage(interpretations.summary.modalityBalance['Cardinal'], totalModalities)}%`}}
                      title={`Cardinal: ${interpretations.summary.modalityBalance['Cardinal']} planets`}
                    ></div>
                    <div 
                      className="bg-orange-500" 
                      style={{width: `${getPercentage(interpretations.summary.modalityBalance['Fixed'], totalModalities)}%`}}
                      title={`Fixed: ${interpretations.summary.modalityBalance['Fixed']} planets`}
                    ></div>
                    <div 
                      className="bg-teal-500" 
                      style={{width: `${getPercentage(interpretations.summary.modalityBalance['Mutable'], totalModalities)}%`}}
                      title={`Mutable: ${interpretations.summary.modalityBalance['Mutable']} planets`}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-night-400">
                  <span>Cardinal: {interpretations.summary.modalityBalance['Cardinal'] || 0}</span>
                  <span>Fixed: {interpretations.summary.modalityBalance['Fixed'] || 0}</span>
                  <span>Mutable: {interpretations.summary.modalityBalance['Mutable'] || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Planets Tab Content */}
      {activeTab === 'planets' && (
        <div className="planets-tab">
          <h2 className="text-2xl font-serif mb-4">Planetary Positions</h2>
          <p className="mb-6 text-night-200">
            Your planetary placements reveal how different energies express in your life. Each planet in your chart
            represents a different facet of your personality and life experience.
          </p>
          
          <div className="space-y-6">
            {interpretations.planetaryPositions.map((planet, index) => (
              <div key={index} className="bg-night-700 rounded-lg p-4">
                <h3 className="text-xl font-medium mb-2">{planet.title}
                  {planet.retrograde && <span className="text-red-400 ml-2">(Retrograde)</span>}
                </h3>
                <p className="mb-3">{planet.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {planet.keywords.map((keyword, idx) => (
                    <span key={idx} className="bg-primary-900 text-primary-100 px-2 py-1 rounded text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Houses Tab Content */}
      {activeTab === 'houses' && (
        <div className="houses-tab">
          <h2 className="text-2xl font-serif mb-4">House Placements</h2>
          <p className="mb-6 text-night-200">
            The twelve houses represent different areas of life. The sign on each house cusp indicates 
            how you approach these life areas, while planets within a house bring focus to it.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interpretations.houseSystem.map((house, index) => (
              <div key={index} className="bg-night-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-2">{house.title}</h3>
                <p className="mb-3 text-sm">{house.description}</p>
                {house.planets.length > 0 && (
                  <div className="text-xs text-night-300 mt-2">
                    Planets: <span className="text-primary-300">{house.planets.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Aspects Tab Content */}
      {activeTab === 'aspects' && (
        <div className="aspects-tab">
          <h2 className="text-2xl font-serif mb-4">Planetary Aspects</h2>
          <p className="mb-6 text-night-200">
            Aspects are the angular relationships between planets. They reveal how different parts of your
            psyche interact, showing harmonious flows and productive tensions.
          </p>
          
          <div className="space-y-4">
            {interpretations.aspects.map((aspect, index) => (
              <div key={index} className={`border-l-4 rounded-lg p-4 ${
                aspect.nature === 'harmonious' ? 'border-green-500 bg-green-900 bg-opacity-20' :
                aspect.nature === 'challenging' ? 'border-red-500 bg-red-900 bg-opacity-20' :
                aspect.nature === 'polarizing' ? 'border-purple-500 bg-purple-900 bg-opacity-20' :
                'border-yellow-500 bg-yellow-900 bg-opacity-20'
              }`}>
                <h3 className="text-lg font-medium mb-2">
                  {aspect.title} <span className="text-2xl ml-1">{aspect.symbol}</span>
                  <span className="text-sm font-normal ml-2 text-night-300">(orb: {aspect.orb.toFixed(1)}°)</span>
                </h3>
                <p className="text-sm">{aspect.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanetInterpretation;
