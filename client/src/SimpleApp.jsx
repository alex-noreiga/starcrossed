import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './index.css';
import StarBackground from './StarBackground';

// Home component with form
function Home() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    birthPlace: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save form data to localStorage (in a real app, this would go to the backend)
    localStorage.setItem('birthChartData', JSON.stringify(formData));
    navigate('/chart');
  };

  return (
    <div className="text-center max-w-md w-full p-8">
      <h1 className="text-4xl font-bold mb-4">Starcrossed</h1>
      <p className="text-xl text-night-300 mb-8">Birth Chart Generator</p>
      
      <form onSubmit={handleSubmit} className="bg-night-800 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-night-300 mb-1">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-night-700 border border-night-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="birthDate" className="block text-sm font-medium text-night-300 mb-1">Birth Date</label>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-night-700 border border-night-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="birthTime" className="block text-sm font-medium text-night-300 mb-1">Birth Time</label>
          <input
            type="time"
            id="birthTime"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-md bg-night-700 border border-night-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="birthPlace" className="block text-sm font-medium text-night-300 mb-1">Birth Place</label>
          <input
            type="text"
            id="birthPlace"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleChange}
            placeholder="City, Country"
            required
            className="w-full px-4 py-2 rounded-md bg-night-700 border border-night-600 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full cosmic-gradient px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          Generate Chart
        </button>
      </form>
    </div>
  );
}

// Chart component
function Chart() {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('birthChartData');
    return saved ? JSON.parse(saved) : null;
  });

  if (!userData) {
    return (
      <div className="text-center p-8">
        <p>No chart data found. Please complete the form first.</p>
        <Link 
          to="/" 
          className="cosmic-gradient px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity inline-block mt-4"
        >
          Back to Form
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center p-8 max-w-4xl w-full">
      <h1 className="text-3xl font-bold mb-2">{userData.name}'s Birth Chart</h1>
      <p className="text-night-300 mb-6">
        Born on {new Date(userData.birthDate).toLocaleDateString()} at {userData.birthTime} in {userData.birthPlace}
      </p>
      
      <div className="bg-night-800 p-6 rounded-lg mb-6">
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-night-600 rounded-full max-w-xs mx-auto">
          <p className="text-night-400">Chart Visualization</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-left">
          <div className="bg-night-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-primary-400">Sun Sign</h3>
            <p>Your Sun is in Leo, giving you creative expression and leadership qualities.</p>
          </div>
          <div className="bg-night-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-primary-400">Moon Sign</h3>
            <p>Your Moon is in Cancer, indicating emotional sensitivity and nurturing instincts.</p>
          </div>
          <div className="bg-night-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-primary-400">Rising Sign</h3>
            <p>Your Ascendant is in Virgo, showing analytical approach to new situations.</p>
          </div>
        </div>
      </div>
      
      <Link 
        to="/" 
        className="text-cosmic-400 hover:text-cosmic-300 transition-colors"
      >
        ← Generate Another Chart
      </Link>
    </div>
  );
}

// App component with routes
function SimpleApp() {
  return (
    <BrowserRouter>
      <StarBackground />
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chart" element={<Chart />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default SimpleApp;