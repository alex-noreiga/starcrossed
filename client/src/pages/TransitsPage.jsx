import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import TransitChartVisualization from '../components/charts/TransitChartVisualization';
import TransitCalendar from '../components/charts/TransitCalendar';
import NotificationSettings from '../components/notifications/NotificationSettings';

const TransitsPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [charts, setCharts] = useState([]);
  const [selectedChartId, setSelectedChartId] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);
  const [currentTransits, setCurrentTransits] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transitDate, setTransitDate] = useState(new Date());
  
  // Fetch user's charts on component mount
  useEffect(() => {
    fetchUserCharts();
  }, []);
  
  // Fetch selected chart data when chart ID changes
  useEffect(() => {
    if (selectedChartId) {
      fetchChartData(selectedChartId);
    }
  }, [selectedChartId]);
  
  // Fetch user's charts
  const fetchUserCharts = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/charts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCharts(response.data.data);
      
      // Auto-select first chart if available
      if (response.data.data.length > 0) {
        setSelectedChartId(response.data.data[0]._id);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching charts:', error);
      setError('Failed to load your charts');
      setLoading(false);
    }
  };
  
  // Fetch chart data
  const fetchChartData = async (chartId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`/api/charts/${chartId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedChart(response.data.data);
      
      // Fetch current transits for the chart
      fetchCurrentTransits(chartId);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('Failed to load chart data');
      setLoading(false);
    }
  };
  
  // Fetch current transits
  const fetchCurrentTransits = async (chartId) => {
    try {
      const dateParam = transitDate ? `?date=${transitDate.toISOString()}` : '';
      
      const response = await axios.get(
        `/api/transits/${chartId}/current${dateParam}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setCurrentTransits(response.data.data);
    } catch (error) {
      console.error('Error fetching current transits:', error);
      setError('Failed to load transit data');
    }
  };
  
  // Handle date change for transit calculation
  const handleDateChange = (date) => {
    setTransitDate(date);
    
    // Refetch transits with new date
    if (selectedChartId) {
      fetchCurrentTransits(selectedChartId);
    }
  };
  
  // Handle chart selection change
  const handleChartChange = (e) => {
    const chartId = e.target.value;
    setSelectedChartId(chartId);
  };
  
  // Render loading state
  if (loading && !selectedChart) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-night-300">Loading...</div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !selectedChart) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </div>
    );
  }
  
  // Render no charts state
  if (charts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-xl text-night-300 mb-4">
            You don't have any birth charts yet
          </div>
          <button
            onClick={() => navigate('/charts/new')}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Create Your First Chart
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-night-100 mb-6">Transit Analysis</h1>
      
      <div className="mb-6 bg-night-700 rounded-lg p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Chart selector */}
          <div className="w-full md:w-1/3">
            <label className="block text-night-300 mb-2">
              Select Birth Chart
            </label>
            <select
              value={selectedChartId || ''}
              onChange={handleChartChange}
              className="w-full p-2 bg-night-600 text-white rounded-md border border-night-500"
            >
              {charts.map(chart => (
                <option key={chart._id} value={chart._id}>
                  {chart.name} ({new Date(chart.birthDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          
          {/* Date selector */}
          <div className="w-full md:w-1/3">
            <label className="block text-night-300 mb-2">
              Transit Date
            </label>
            <input
              type="date"
              value={transitDate.toISOString().split('T')[0]}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="w-full p-2 bg-night-600 text-white rounded-md border border-night-500"
            />
          </div>
          
          {/* Current date button */}
          <div className="w-full md:w-1/3 flex items-end">
            <button
              onClick={() => handleDateChange(new Date())}
              className="w-full md:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Current Date
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-night-600">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 ${
              activeTab === 'chart'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-night-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('chart')}
          >
            Transit Chart
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'calendar'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-night-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('calendar')}
          >
            Transit Calendar
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === 'notifications'
                ? 'text-primary-400 border-b-2 border-primary-400'
                : 'text-night-300 hover:text-white'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notification Settings
          </button>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="bg-night-700 rounded-lg p-4">
        {selectedChart && (
          <>
            {activeTab === 'chart' && (
              <div>
                <TransitChartVisualization
                  birthChart={selectedChart}
                  transitData={currentTransits}
                  chartId={selectedChartId}
                  transitDate={transitDate}
                />
              </div>
            )}
            
            {activeTab === 'calendar' && (
              <div>
                <TransitCalendar chartId={selectedChartId} />
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div>
                <NotificationSettings chartId={selectedChartId} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransitsPage;
