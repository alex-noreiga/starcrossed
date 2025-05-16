import React from 'react';
import BirthForm from '../components/BirthForm';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleFormSubmit = (data: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  }) => {
    // In a real application, we would send this data to the backend
    // For the MVP, we'll just store it in localStorage and navigate to the results
    localStorage.setItem('birthChartData', JSON.stringify(data));
    navigate('/chart');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <section className="text-center mb-16 pt-12">
        <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
          Discover Your Cosmic Blueprint
        </h1>
        <p className="text-xl text-night-300 max-w-3xl mx-auto leading-relaxed">
          Your birth chart is a snapshot of the sky at the exact moment you were born. 
          Generate your personalized astrological profile and unlock insights about your 
          personality, relationships, career path, and life purpose.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-20">
        <div className="order-2 md:order-1">
          <BirthForm onSubmit={handleFormSubmit} />
        </div>
        
        <div className="order-1 md:order-2 text-center">
          <div className="relative p-6 inline-block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-cosmic-500/30 rounded-full blur-2xl"></div>
            <div className="relative text-8xl">
              ✧ ★ ✦ ✧
            </div>
          </div>
          <h2 className="text-3xl font-serif mt-6 mb-4">Your Celestial Identity</h2>
          <p className="text-night-300">
            Understanding your birth chart provides deep insights into your strengths, 
            challenges, and potential. It's your personal cosmic roadmap.
          </p>
        </div>
      </div>

      <section className="py-12 mb-16">
        <h2 className="text-3xl font-serif text-center mb-10">What You'll Discover</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-night-800 p-6 rounded-lg">
            <div className="text-3xl text-primary-400 mb-4">☉</div>
            <h3 className="text-xl font-medium mb-2">Planetary Positions</h3>
            <p className="text-night-300">
              Learn how the positions of the Sun, Moon, and planets at your birth 
              influence your personality and life journey.
            </p>
          </div>
          
          <div className="bg-night-800 p-6 rounded-lg">
            <div className="text-3xl text-cosmic-400 mb-4">⌂</div>
            <h3 className="text-xl font-medium mb-2">House Placements</h3>
            <p className="text-night-300">
              Discover which areas of life are highlighted in your chart through 
              the 12 houses of astrology.
            </p>
          </div>
          
          <div className="bg-night-800 p-6 rounded-lg">
            <div className="text-3xl text-primary-400 mb-4">△</div>
            <h3 className="text-xl font-medium mb-2">Aspects & Patterns</h3>
            <p className="text-night-300">
              Uncover the dynamic relationships between planets that reveal 
              your unique challenges and gifts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
