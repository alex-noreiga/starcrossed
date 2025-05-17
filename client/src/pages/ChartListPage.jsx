import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ChartCard from '../components/charts/ChartCard';

const ChartListPage = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchCharts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/charts');
        setCharts(response.data);
      } catch (err) {
        console.error('Error fetching charts:', err);
        setError('Failed to load your charts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUser) {
      fetchCharts();
    }
  }, [currentUser]);
  
  const handleDeleteChart = async (chartId) => {
    if (window.confirm('Are you sure you want to delete this chart?')) {
      try {
        await axios.delete(`/api/charts/${chartId}`);
        
        // Remove chart from state
        setCharts(charts.filter(chart => chart.id !== chartId));
      } catch (err) {
        console.error('Error deleting chart:', err);
        alert('Failed to delete chart. Please try again.');
      }
    }
  };
  
  // Prepare chart for comparison
  const handleSelectForComparison = (chartId) => {
    // Get current comparison charts from localStorage
    const comparisonCharts = JSON.parse(localStorage.getItem('comparisonCharts') || '[]');
    
    // Check if already selected
    if (comparisonCharts.includes(chartId)) {
      // Remove from comparison
      localStorage.setItem('comparisonCharts', JSON.stringify(
        comparisonCharts.filter(id => id !== chartId)
      ));
    } else {
      // Add to comparison (limit to 2 charts)
      if (comparisonCharts.length < 2) {
        localStorage.setItem('comparisonCharts', JSON.stringify(
          [...comparisonCharts, chartId]
        ));
      } else {
        alert('You can only select up to 2 charts for comparison');
      }
    }
    
    // Force re-render
    setCharts([...charts]);
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="bg-night-800 bg-opacity-90 rounded-xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary-400">Your Birth Charts</h1>
          
          <div className="flex items-center">
            <Link
              to="/compare"
              className="mx-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Compare Charts
            </Link>
            
            <Link
              to="/"
              className="mx-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Create New Chart
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
            {error}
          </div>
        )}
        
        {!loading && charts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-night-300 text-lg mb-4">You don't have any saved birth charts yet.</p>
            <Link
              to="/"
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Your First Chart
            </Link>
          </div>
        )}
        
        {charts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charts.map(chart => (
              <ChartCard
                key={chart.id}
                chart={chart}
                onDelete={() => handleDeleteChart(chart.id)}
                onSelectForComparison={() => handleSelectForComparison(chart.id)}
                isSelectedForComparison={
                  JSON.parse(localStorage.getItem('comparisonCharts') || '[]').includes(chart.id)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartListPage;
