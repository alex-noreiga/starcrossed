import React, { useEffect, useState } from 'react';
import BirthChart from '../components/BirthChart';
import { useNavigate } from 'react-router-dom';

const ChartPage: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  
  // Sample chart data for MVP
  // In a real app, this would come from the backend calculation
  const chartData = {
    planets: [
      { name: 'Sun', degree: 15.5, sign: 'Leo', house: 5 },
      { name: 'Moon', degree: 3.2, sign: 'Cancer', house: 4 },
      { name: 'Mercury', degree: 20.1, sign: 'Leo', house: 5 },
      { name: 'Venus', degree: 8.7, sign: 'Virgo', house: 6 },
      { name: 'Mars', degree: 12.3, sign: 'Scorpio', house: 8 },
      { name: 'Jupiter', degree: 5.5, sign: 'Taurus', house: 2 },
      { name: 'Saturn', degree: 28.9, sign: 'Aquarius', house: 11 },
      { name: 'Uranus', degree: 17.2, sign: 'Pisces', house: 12 },
      { name: 'Neptune', degree: 22.8, sign: 'Capricorn', house: 10 },
      { name: 'Pluto', degree: 10.5, sign: 'Sagittarius', house: 9 },
    ],
    houses: [
      { house: 1, sign: 'Aries', degree: 5.2 },
      { house: 2, sign: 'Taurus', degree: 3.1 },
      { house: 3, sign: 'Gemini', degree: 1.5 },
      { house: 4, sign: 'Cancer', degree: 2.8 },
      { house: 5, sign: 'Leo', degree: 5.6 },
      { house: 6, sign: 'Virgo', degree: 7.9 },
      { house: 7, sign: 'Libra', degree: 5.2 },
      { house: 8, sign: 'Scorpio', degree: 3.1 },
      { house: 9, sign: 'Sagittarius', degree: 1.5 },
      { house: 10, sign: 'Capricorn', degree: 2.8 },
      { house: 11, sign: 'Aquarius', degree: 5.6 },
      { house: 12, sign: 'Pisces', degree: 7.9 },
    ],
    aspects: [
      { planet1: 'Sun', planet2: 'Mercury', type: 'Conjunction', orb: 4.6 },
      { planet1: 'Moon', planet2: 'Venus', type: 'Square', orb: 5.5 },
      { planet1: 'Mars', planet2: 'Jupiter', type: 'Trine', orb: 6.8 },
      { planet1: 'Saturn', planet2: 'Uranus', type: 'Opposition', orb: 11.7 },
      { planet1: 'Venus', planet2: 'Neptune', type: 'Sextile', orb: 14.1 },
    ]
  };

  useEffect(() => {
    // Get user data from localStorage
    const storedData = localStorage.getItem('birthChartData');
    
    if (storedData) {
      setUserData(JSON.parse(storedData));
    } else {
      // If no data, navigate back to home
      navigate('/');
    }
  }, [navigate]);

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-3xl text-primary-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          {userData.name}'s Birth Chart
        </h1>
        <p className="text-night-300">
          Born on {new Date(userData.birthDate).toLocaleDateString()} at {userData.birthTime} in {userData.birthPlace}
        </p>
      </div>

      <div className="mb-12">
        <BirthChart chartData={chartData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-night-800 p-6 rounded-lg">
          <h2 className="text-2xl font-serif mb-4 text-primary-400">Your Sun Sign: Leo</h2>
          <p className="text-night-300 mb-4">
            With your Sun in Leo, you have a natural flair for the dramatic and a warm, generous spirit. 
            You're likely to be creative, confident, and have a strong desire to express yourself.
          </p>
          <p className="text-night-300">
            Your core identity revolves around themes of self-expression, creativity, and leadership. 
            You have a natural ability to inspire others with your enthusiasm and charisma.
          </p>
        </div>

        <div className="bg-night-800 p-6 rounded-lg">
          <h2 className="text-2xl font-serif mb-4 text-cosmic-400">Your Moon Sign: Cancer</h2>
          <p className="text-night-300 mb-4">
            With your Moon in Cancer, you have deep emotional sensitivity and a strong connection to 
            home and family. You're naturally nurturing and protective of those you care about.
          </p>
          <p className="text-night-300">
            Your emotional needs center around feeling secure, being nurtured, and having a sense 
            of belonging. You may be deeply influenced by your past and childhood experiences.
          </p>
        </div>
      </div>

      <div className="text-center mb-10">
        <button 
          onClick={() => navigate('/')}
          className="cosmic-button"
        >
          Generate Another Chart
        </button>
      </div>
    </div>
  );
};

export default ChartPage;
