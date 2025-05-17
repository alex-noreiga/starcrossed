import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BirthForm from '../components/BirthForm';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Function to handle birth chart form submission
  const handleBirthFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to generate chart
      const response = await axios.post('/api/charts/generate', formData);
      
      if (currentUser) {
        // If logged in, save chart and redirect to chart page
        const saveResponse = await axios.post('/api/charts', {
          ...formData,
          chartData: response.data
        });
        
        navigate(`/charts/${saveResponse.data.id}`);
      } else {
        // If not logged in, store in session and redirect to chart view
        setChartData(response.data);
        navigate('/chart', { state: { chartData: response.data } });
      }
    } catch (err) {
      console.error('Error generating chart:', err);
      setError('Could not generate chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="home-page min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary-400 mb-4">Starcrossed</h1>
            <p className="text-xl text-night-200">Discover the celestial blueprint of your life</p>
          </div>
          
          <div className="bg-night-800 bg-opacity-90 rounded-xl shadow-xl p-8">
            <BirthForm onSubmit={handleBirthFormSubmit} />
            
            {loading && (
              <div className="text-center mt-6">
                <div className="cosmic-spinner mb-4"></div>
                <p className="text-night-300">Calculating celestial positions...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center mt-6">
                <p className="text-red-400 mb-2">{error}</p>
                <button 
                  className="text-primary-400 underline"
                  onClick={() => setError(null)}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-night-300">
              {currentUser 
                ? "Generate your birth chart above or view your saved charts in your profile."
                : "Create an account to save your birth charts and access more features."}
            </p>
            
            {!currentUser && (
              <div className="mt-4">
                <button
                  onClick={() => navigate("/register")}
                  className="mx-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="mx-2 px-6 py-2 bg-night-700 hover:bg-night-600 text-white font-medium rounded-lg transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
