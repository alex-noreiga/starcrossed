import React, { useState } from 'react';

const BirthForm = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!birthDate) newErrors.birthDate = 'Birth date is required';
    if (!birthTime) newErrors.birthTime = 'Birth time is required';
    if (!birthPlace.trim()) newErrors.birthPlace = 'Birth place is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit({
        name,
        birthDate,
        birthTime,
        birthPlace
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold text-primary-400 mb-4 text-center">
        Create Your Birth Chart
      </h2>
      
      <div>
        <label htmlFor="name" className="block text-night-300 mb-1">Name</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg bg-night-700 border ${
            errors.name ? 'border-red-500' : 'border-night-600'
          } text-white`}
          placeholder="Your name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="birthDate" className="block text-night-300 mb-1">Birth Date</label>
        <input
          type="date"
          id="birthDate"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg bg-night-700 border ${
            errors.birthDate ? 'border-red-500' : 'border-night-600'
          } text-white`}
        />
        {errors.birthDate && (
          <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="birthTime" className="block text-night-300 mb-1">Birth Time</label>
        <input
          type="time"
          id="birthTime"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg bg-night-700 border ${
            errors.birthTime ? 'border-red-500' : 'border-night-600'
          } text-white`}
        />
        {errors.birthTime && (
          <p className="text-red-500 text-xs mt-1">{errors.birthTime}</p>
        )}
        <p className="text-night-400 text-xs mt-1">If unknown, use 12:00</p>
      </div>
      
      <div>
        <label htmlFor="birthPlace" className="block text-night-300 mb-1">Birth Place</label>
        <input
          type="text"
          id="birthPlace"
          value={birthPlace}
          onChange={(e) => setBirthPlace(e.target.value)}
          className={`w-full px-4 py-2 rounded-lg bg-night-700 border ${
            errors.birthPlace ? 'border-red-500' : 'border-night-600'
          } text-white`}
          placeholder="City, Country"
        />
        {errors.birthPlace && (
          <p className="text-red-500 text-xs mt-1">{errors.birthPlace}</p>
        )}
      </div>
      
      <button
        type="submit"
        className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
      >
        Generate Chart
      </button>
    </form>
  );
};

export default BirthForm;
