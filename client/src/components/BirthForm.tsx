import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BirthFormProps {
  onSubmit: (data: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  }) => void;
}

const BirthForm: React.FC<BirthFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation
    if (!name || !birthDate || !birthTime || !birthPlace) {
      alert('Please fill in all fields');
      return;
    }
    
    onSubmit({
      name,
      birthDate,
      birthTime,
      birthPlace
    });
    
    // In a real app, we'd send this data to the backend and wait for a response
    // For the MVP, we'll just navigate to the chart page
    navigate('/chart');
  };

  return (
    <div className="birth-form">
      <h2 className="text-2xl font-serif text-center mb-6">Generate Your Birth Chart</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-night-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="cosmic-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-night-300 mb-1">
            Birth Date
          </label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="cosmic-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="birthTime" className="block text-sm font-medium text-night-300 mb-1">
            Birth Time (as exact as possible)
          </label>
          <input
            type="time"
            id="birthTime"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="cosmic-input"
            required
          />
        </div>
        
        <div>
          <label htmlFor="birthPlace" className="block text-sm font-medium text-night-300 mb-1">
            Birth Place
          </label>
          <input
            type="text"
            id="birthPlace"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="City, Country"
            className="cosmic-input"
            required
          />
          <p className="text-night-400 text-xs mt-1">
            Example: New York, USA
          </p>
        </div>
        
        <button 
          type="submit" 
          className="w-full mt-6 cosmic-button py-3 text-lg font-medium"
        >
          Generate Birth Chart
        </button>
      </form>
      
      <p className="text-night-400 text-xs text-center mt-6">
        Your data is only used to calculate your birth chart and is never shared with third parties.
      </p>
    </div>
  );
};

export default BirthForm;
