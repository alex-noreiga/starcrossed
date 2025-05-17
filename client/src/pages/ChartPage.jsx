import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChartVisualization from '../components/charts/ChartVisualization';
import ChartInterpretation from '../components/charts/ChartInterpretation';
import { useAuth } from '../contexts/AuthContext';

const ChartPage = () => {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('chart');
  
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Check if chart data was passed in location state (from form)
  const locationChart = location.state?.chartData;
  
  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // If we have chart data from location state (form submission)
        if (locationChart) {
          setChart(locationChart);
          setLoading(false);
          return;
        }
        
        // Otherwise fetch chart by ID from API
        if (id) {
          const response = await axios.get(`/api/charts/${id}`);
          setChart(response.data);
        } else {
          setError('No chart data available');
        }
      } catch (err) {
        console.error('Error fetching chart:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchChart();
  }, [id, locationChart]);
  
  const handleSaveChart = async () => {
    if (!currentUser) {
      navigate('/login', { state: { redirectTo: '/chart', chartData: chart } });
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Extract relevant data from chart for saving
      const chartData = {
        name: chart.name,
        birthDate: chart.birthDate,
        birthTime: chart.birthTime,
        birthPlace: chart.birthPlace,
        chartData: chart
      };
      
      const response = await axios.post('/api/charts', chartData);
      
      setSaveStatus('saved');
      
      // Redirect to the saved chart after a short delay
      setTimeout(() => {
        navigate(`/charts/${response.data.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error saving chart:', err);
      setSaveStatus('error');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="cosmic-spinner"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-lg text-center">
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!chart) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-night-800 bg-opacity-90 p-8 rounded-xl shadow-xl text-center">
          <p className="text-night-300 mb-4">No chart data available</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            Create a Chart
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-night-800 bg-opacity-90 rounded-xl shadow-xl p-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary-400 mb-2">{chart.name}'s Birth Chart</h1>
              <p className="text-night-300">
                Born on {new Date(chart.birthDate).toLocaleDateString()} at {chart.birthTime} in {chart.birthPlace}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              {!id && currentUser && (
                <button
                  onClick={handleSaveChart}
                  disabled={saveStatus === 'saving'}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {saveStatus === 'saving' ? 'Saving...' : 
                   saveStatus === 'saved' ? 'Saved!' : 
                   saveStatus === 'error' ? 'Error Saving' : 'Save Chart'}
                </button>
              )}
              
              {!id && !currentUser && (
                <button
                  onClick={handleSaveChart}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Login to Save
                </button>
              )}
              
              {id && (
                <div className="relative group">
                  <button
                    onClick={() => window.open(`/api/charts/${id}/pdf`, '_blank')}
                    className="px-4 py-2 bg-night-600 hover:bg-night-500 text-white font-medium rounded-lg transition-colors"
                  >
                    Export
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-night-700 rounded-lg shadow-lg p-2 invisible group-hover:visible z-10">
                    <button
                      onClick={() => window.open(`/api/charts/${id}/pdf`, '_blank')}
                      className="block w-full text-left px-4 py-2 text-night-200 hover:bg-night-600 rounded"
                    >
                      Download as PDF
                    </button>
                    <button
                      onClick={() => window.open(`/api/charts/${id}/image`, '_blank')}
                      className="block w-full text-left px-4 py-2 text-night-200 hover:bg-night-600 rounded"
                    >
                      Download as Image
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs Navigation */}
        <div className="border-b border-night-600 mb-6">
          <nav className="flex -mb-px">
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'chart' 
                  ? 'border-primary-400 text-primary-300' 
                  : 'border-transparent text-night-300 hover:text-night-100'
              }`}
              onClick={() => setActiveTab('chart')}
            >
              Chart Wheel
            </button>
            
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'planets' 
                  ? 'border-primary-400 text-primary-300' 
                  : 'border-transparent text-night-300 hover:text-night-100'
              }`}
              onClick={() => setActiveTab('planets')}
            >
              Planets
            </button>
            
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'aspects' 
                  ? 'border-primary-400 text-primary-300' 
                  : 'border-transparent text-night-300 hover:text-night-100'
              }`}
              onClick={() => setActiveTab('aspects')}
            >
              Aspects
            </button>
            
            <button
              className={`py-3 px-4 text-sm font-medium border-b-2 ${
                activeTab === 'interpretation' 
                  ? 'border-primary-400 text-primary-300' 
                  : 'border-transparent text-night-300 hover:text-night-100'
              }`}
              onClick={() => setActiveTab('interpretation')}
            >
              Interpretation
            </button>
          </nav>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'chart' && (
            <ChartVisualization chartData={chart} />
          )}
          
          {activeTab === 'planets' && (
            <div className="bg-night-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-night-200 mb-4">Planetary Positions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(chart.planets).map(([planet, data]) => {
                  const zodiacSigns = [
                    'Aries', 'Taurus', 'Gemini', 'Cancer',
                    'Leo', 'Virgo', 'Libra', 'Scorpio',
                    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
                  ];
                  
                  const sign = zodiacSigns[Math.floor(data.position / 30)];
                  const degrees = Math.floor(data.position % 30);
                  const minutes = Math.round((data.position % 1) * 60);
                  
                  return (
                    <div key={planet} className="bg-night-800 p-4 rounded-lg">
                      <h4 className="text-lg font-medium text-primary-300 mb-2">{planet}</h4>
                      <p className="text-night-200">
                        {degrees}° {minutes}' {sign}
                      </p>
                      {data.retrograde && (
                        <span className="mt-1 inline-block px-2 py-1 bg-indigo-900 text-indigo-200 text-xs rounded">
                          Retrograde
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeTab === 'aspects' && (
            <div className="bg-night-700 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-night-200 mb-4">Aspects</h3>
              
              {chart.aspects.length === 0 ? (
                <p className="text-night-300">No significant aspects found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chart.aspects.map((aspect, index) => (
                    <div key={index} className="bg-night-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-primary-300 font-medium">{aspect.planet1}</span>
                          <span className="text-night-300 mx-2">→</span>
                          <span className="text-primary-300 font-medium">{aspect.planet2}</span>
                        </div>
                        <div className="text-night-400 text-sm">
                          {aspect.aspectType} ({aspect.orb.toFixed(1)}°)
                        </div>
                      </div>
                      {aspect.interpretation && (
                        <p className="text-night-200">{aspect.interpretation}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'interpretation' && (
            <ChartInterpretation chartData={chart} name={chart.name} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartPage;
