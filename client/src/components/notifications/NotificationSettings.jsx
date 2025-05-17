import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

/**
 * NotificationSettings component
 * 
 * @param {Object} props - Component props
 * @param {string} props.chartId - Chart ID for notification settings
 */
const NotificationSettings = ({ chartId }) => {
  const { token } = useAuth();
  const [settings, setSettings] = useState({
    enabled: true,
    frequency: 'daily',
    channels: ['email'],
    planetFilters: [],
    aspectFilters: [],
    minSignificance: 70
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Planet options
  const planetOptions = [
    { value: 'Sun', label: 'Sun' },
    { value: 'Moon', label: 'Moon' },
    { value: 'Mercury', label: 'Mercury' },
    { value: 'Venus', label: 'Venus' },
    { value: 'Mars', label: 'Mars' },
    { value: 'Jupiter', label: 'Jupiter' },
    { value: 'Saturn', label: 'Saturn' },
    { value: 'Uranus', label: 'Uranus' },
    { value: 'Neptune', label: 'Neptune' },
    { value: 'Pluto', label: 'Pluto' }
  ];
  
  // Aspect options
  const aspectOptions = [
    { value: 'conjunction', label: 'Conjunction' },
    { value: 'opposition', label: 'Opposition' },
    { value: 'trine', label: 'Trine' },
    { value: 'square', label: 'Square' },
    { value: 'sextile', label: 'Sextile' }
  ];
  
  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'important_only', label: 'Important Only' }
  ];
  
  // Fetch notification settings on component mount
  useEffect(() => {
    if (chartId) {
      fetchSettings();
    }
  }, [chartId]);
  
  // Fetch notification settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(
        `/api/notifications/settings/${chartId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const fetchedSettings = response.data.data;
      
      // Format settings to match component state
      setSettings({
        enabled: fetchedSettings.enabled !== undefined ? fetchedSettings.enabled : true,
        frequency: fetchedSettings.frequency || 'daily',
        channels: fetchedSettings.channels || ['email'],
        planetFilters: fetchedSettings.filters?.planets || [],
        aspectFilters: fetchedSettings.filters?.aspects || [],
        minSignificance: fetchedSettings.filters?.minSignificance || 70
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      setError('Failed to load notification settings');
      setLoading(false);
    }
  };
  
  // Save notification settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Format settings for API
      const formattedSettings = {
        enabled: settings.enabled,
        frequency: settings.frequency,
        channels: settings.channels,
        planetFilters: settings.planetFilters,
        aspectFilters: settings.aspectFilters,
        minSignificance: settings.minSignificance
      };
      
      // Update settings
      await axios.put(
        `/api/notifications/settings/${chartId}`,
        formattedSettings,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess('Notification settings saved successfully');
      setSaving(false);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      setError('Failed to save notification settings');
      setSaving(false);
    }
  };
  
  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    saveSettings();
  };
  
  // Handle toggle change
  const handleToggleChange = (e) => {
    setSettings({
      ...settings,
      enabled: e.target.checked
    });
  };
  
  // Handle select change
  const handleSelectChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle multi-select change
  const handleMultiSelectChange = (e, filterName) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    
    setSettings({
      ...settings,
      [filterName]: selectedOptions
    });
  };
  
  // Handle slider change
  const handleSliderChange = (e) => {
    setSettings({
      ...settings,
      minSignificance: parseInt(e.target.value, 10)
    });
  };
  
  return (
    <div className="notification-settings">
      <h2>Transit Notification Settings</h2>
      
      {loading ? (
        <div className="loading">Loading settings...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Enable/Disable toggle */}
          <div className="form-group">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={handleToggleChange}
              />
              <span className="toggle-text">
                {settings.enabled ? 'Notifications Enabled' : 'Notifications Disabled'}
              </span>
            </label>
          </div>
          
          {/* Notification frequency */}
          <div className="form-group">
            <label htmlFor="frequency">Notification Frequency</label>
            <select
              id="frequency"
              name="frequency"
              value={settings.frequency}
              onChange={handleSelectChange}
              disabled={!settings.enabled}
            >
              {frequencyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Planet filters */}
          <div className="form-group">
            <label htmlFor="planetFilters">
              Planet Filters (leave empty for all planets)
            </label>
            <select
              id="planetFilters"
              multiple
              value={settings.planetFilters}
              onChange={(e) => handleMultiSelectChange(e, 'planetFilters')}
              disabled={!settings.enabled}
              className="multi-select"
            >
              {planetOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="help-text">
              Hold Ctrl/Cmd to select multiple planets
            </small>
          </div>
          
          {/* Aspect filters */}
          <div className="form-group">
            <label htmlFor="aspectFilters">
              Aspect Filters (leave empty for all aspects)
            </label>
            <select
              id="aspectFilters"
              multiple
              value={settings.aspectFilters}
              onChange={(e) => handleMultiSelectChange(e, 'aspectFilters')}
              disabled={!settings.enabled}
              className="multi-select"
            >
              {aspectOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <small className="help-text">
              Hold Ctrl/Cmd to select multiple aspects
            </small>
          </div>
          
          {/* Significance threshold */}
          <div className="form-group">
            <label htmlFor="minSignificance">
              Minimum Significance Threshold: {settings.minSignificance}%
            </label>
            <input
              type="range"
              id="minSignificance"
              min="0"
              max="100"
              value={settings.minSignificance}
              onChange={handleSliderChange}
              disabled={!settings.enabled}
              className="slider"
            />
            <div className="slider-labels">
              <span>Less Significant</span>
              <span>More Significant</span>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="form-actions">
            <button
              type="submit"
              className="save-button"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          
          {/* Success message */}
          {success && (
            <div className="success-message">{success}</div>
          )}
        </form>
      )}
      
      <style jsx>{`
        .notification-settings {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        h2 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .toggle-text {
          margin-left: 8px;
          font-weight: 500;
        }
        
        select, input[type="text"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
          font-size: 14px;
        }
        
        .multi-select {
          height: 120px;
        }
        
        .help-text {
          display: block;
          margin-top: 5px;
          color: #666;
          font-size: 12px;
        }
        
        .slider {
          width: 100%;
          margin: 10px 0;
        }
        
        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
        }
        
        .form-actions {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        
        .save-button {
          background-color: #6c5ce7;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        
        .save-button:hover {
          background-color: #5649c0;
        }
        
        .save-button:disabled {
          background-color: #a29bfe;
          cursor: not-allowed;
        }
        
        .loading, .error {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        
        .error {
          color: #ff4757;
        }
        
        .success-message {
          margin-top: 15px;
          padding: 10px;
          background-color: #2ecc71;
          color: white;
          border-radius: 4px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;
