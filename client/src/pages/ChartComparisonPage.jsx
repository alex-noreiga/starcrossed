import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChartComparisonView from '../components/charts/ChartComparisonView';

const ChartComparisonPage = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchSelectedCharts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get selected chart IDs from localStorage
        const chartIds = JSON.parse(localStorage.getItem('comparisonCharts') || '[]');
        
        if (chartIds.length < 2) {
          setError('Please select 2 charts to compare');
          setLoading(false);
          return;
        }
        
        // Fetch chart data for each ID
        const chartDataPromises = chartIds.map(id => 
          axios.get(`/api/charts/${id}`)
        );
        
        const responses = await Promise.all(chartDataPromises);
        const chartsData = responses.map(res => res.data);
        
        setCharts(chartsData);
      } catch (err) {
        console.error('Error fetching charts for comparison:', err);
        setError('Failed to load charts for comparison');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSelectedCharts();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-night-800 bg-opacity-90 rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-400">Chart Comparison</h1>
          
          <div className="flex items-center">
            <Link
              to="/charts"
              className="mx-2 px-4 py-2 bg-night-600 hover:bg-night-500 text-white font-medium rounded-lg transition-colors"
            >
              Back to Charts
            </Link>
          </div>
        </div>
        
        {loading && (
          <div className="flex justify-center my-12">
            <div className="cosmic-spinner"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900 bg-opacity-50 text-red-200 p-4 rounded-lg mb-6">
            <p>{error}</p>
            {error === 'Please select 2 charts to compare' && (
              <Link
                to="/charts"
                className="inline-block mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Select Charts
              </Link>
            )}
          </div>
        )}
        
        {!loading && charts.length === 2 && (
          <ChartComparisonView chartA={charts[0]} chartB={charts[1]} />
        )}
      </div>
    </div>
  );
};

export default ChartComparisonPage;
