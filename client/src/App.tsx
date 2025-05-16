import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import BirthForm from './components/BirthForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StarryBackground from './components/StarryBackground';
import ChartPage from './pages/ChartPage';
import axios from 'axios';

const App: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to handle birth chart form submission
  const handleBirthFormSubmit = async (formData: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to generate chart
      const response = await axios.post('/api/charts/generate', formData);
      setChartData(response.data);
      
    } catch (err) {
      console.error('Error generating chart:', err);
      setError('Could not generate chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Home page content
  const HomePage = () => (
    <div className="home-page min-h-screen flex flex-col">
      <div className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-night-800 bg-opacity-90 rounded-xl shadow-xl p-8">
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
      </div>
    </div>
  );

  return (
    <Router>
      <div className="app bg-night-900 text-white min-h-screen relative">
        <StarryBackground />
        <Navbar />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chart" element={<ChartPage chartData={chartData} />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;
