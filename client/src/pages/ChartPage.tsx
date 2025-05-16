import React, { useState } from 'react';
import ChartVisualization from '../components/ChartVisualization';
import PlanetInterpretation from '../components/PlanetInterpretation';
import axios from 'axios';

interface ChartPageProps {
  chartData?: any;
}

const ChartPage: React.FC<ChartPageProps> = ({ chartData: initialChartData }) => {
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Example function to fetch chart data
  const fetchChartData = async (chartId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/charts/${chartId}`);
      setChartData(response.data);
    } catch (err) {
      console.error('Error fetching chart:', err);
      setError('Could not load chart data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // If no data is provided, show a placeholder or error
  if (!chartData && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-night-900 text-white p-6">
        <div className="max-w-4xl w-full bg-night-800 rounded-xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-serif mb-6">Chart Not Found</h2>
          <p className="mb-6">
            The birth chart you're looking for could not be loaded. Please return to the home page to generate a new chart.
          </p>
          <a 
            href="/" 
            className="cosmic-button py-3 px-6 inline-block text-lg font-medium"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-night-900 text-white">
        <div className="cosmic-spinner mb-4"></div>
        <p className="text-night-300">Calculating celestial positions...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-night-900 text-white p-6">
        <div className="max-w-4xl w-full bg-night-800 rounded-xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-serif mb-6">Error Loading Chart</h2>
          <p className="mb-6 text-red-400">
            {error}
          </p>
          <a 
            href="/" 
            className="cosmic-button py-3 px-6 inline-block text-lg font-medium"
          >
            Try Again
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chart-page bg-night-900 text-white min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Chart Info Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif mb-2">Birth Chart</h1>
          <div className="text-primary-400 text-lg mb-1">
            {chartData.info?.date} at {chartData.info?.time}
          </div>
          <div className="text-night-400">
            {chartData.info?.location}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Chart Visualization */}
          <div className="chart-wheel bg-night-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-serif text-center mb-6">Natal Chart Wheel</h2>
            <ChartVisualization chartData={chartData} />
          </div>
          
          {/* Planets Table */}
          <div className="planets-table bg-night-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-2xl font-serif text-center mb-6">Planetary Positions</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-night-700">
                    <th className="text-left pb-3 pl-2">Planet</th>
                    <th className="text-left pb-3">Sign</th>
                    <th className="text-left pb-3">Position</th>
                    <th className="text-left pb-3">House</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.planets.map((planet: any, index: number) => (
                    <tr key={index} className="border-b border-night-700 hover:bg-night-700">
                      <td className="py-3 pl-2 flex items-center">
                        <span className={planet.isRetrograde ? 'text-red-400' : 'text-white'}>
                          {planet.name}
                        </span>
                        {planet.isRetrograde && <span className="text-xs ml-1 text-red-400">℞</span>}
                      </td>
                      <td className="py-3">{planet.sign}</td>
                      <td className="py-3">{planet.degree.toFixed(2)}°</td>
                      <td className="py-3">{planet.house}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-night-700 hover:bg-night-700 bg-night-700 bg-opacity-40">
                    <td className="py-3 pl-2">Ascendant</td>
                    <td className="py-3">{chartData.points.ascendant.sign}</td>
                    <td className="py-3">{chartData.points.ascendant.degree.toFixed(2)}°</td>
                    <td className="py-3">1</td>
                  </tr>
                  <tr className="border-b border-night-700 hover:bg-night-700 bg-night-700 bg-opacity-40">
                    <td className="py-3 pl-2">Midheaven (MC)</td>
                    <td className="py-3">{chartData.points.mc.sign}</td>
                    <td className="py-3">{chartData.points.mc.degree.toFixed(2)}°</td>
                    <td className="py-3">10</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Aspect Grid (simplified version) */}
            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4">Aspects</h3>
              <div className="space-y-2">
                {chartData.aspects.slice(0, 10).map((aspect: any, index: number) => (
                  <div key={index} className="flex justify-between bg-night-700 p-2 rounded text-sm">
                    <span>{aspect.planet1} - {aspect.planet2}</span>
                    <span>{aspect.type} ({aspect.orb.toFixed(1)}°)</span>
                  </div>
                ))}
                {chartData.aspects.length > 10 && (
                  <div className="text-center text-night-400 text-sm mt-2">
                    + {chartData.aspects.length - 10} more aspects
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Interpretations Section */}
        <div className="interpretations-section mb-12">
          <PlanetInterpretation interpretations={chartData.interpretations} />
        </div>
        
        {/* Actions */}
        <div className="flex justify-center space-x-4 mb-8">
          <button className="cosmic-button py-3 px-6 text-lg font-medium">
            Save Chart
          </button>
          <button className="cosmic-button-outline py-3 px-6 text-lg font-medium">
            Print Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
