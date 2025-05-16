import React, { useState, useEffect, useRef } from 'react';
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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Initialize Google Maps Places Autocomplete
  useEffect(() => {
    // Load Google Maps API script if not already loaded
    if (!window.google) {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Handle place input change with debouncing
  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthPlace(value);
    
    // Clear previous timeout
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }
    
    // Set a new timeout for autocomplete
    if (value.length > 2) {
      autocompleteTimeoutRef.current = setTimeout(() => {
        fetchPlaceSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Fetch suggestions from Google Places API
  const fetchPlaceSuggestions = (input: string) => {
    if (window.google && window.google.maps && window.google.maps.places) {
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions(
        {
          input,
          types: ['(cities)']
        },
        (predictions: google.maps.places.AutocompletePrediction[] | null) => {
          if (predictions) {
            const placeNames = predictions.map(p => p.description);
            setSuggestions(placeNames);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } else {
      // Fallback if Google Maps API is not loaded
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setBirthPlace(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
          <p className="text-night-400 text-xs mt-1">
            The more accurate the time, the more accurate your chart will be.
          </p>
        </div>
        
        <div className="relative">
          <label htmlFor="birthPlace" className="block text-sm font-medium text-night-300 mb-1">
            Birth Place
          </label>
          <input
            type="text"
            id="birthPlace"
            value={birthPlace}
            onChange={handlePlaceChange}
            onClick={(e) => e.stopPropagation()}
            placeholder="City, Country"
            className="cosmic-input"
            required
          />
          <p className="text-night-400 text-xs mt-1">
            Example: New York, USA
          </p>
          
          {/* Location suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-night-800 border border-night-600 rounded shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-primary-900 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
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
