import { useState, useEffect } from 'react';
import { ChartResponse } from '../types/chart';
import chartService from '../services/chartService';

/**
 * Custom hook to fetch a birth chart by ID
 */
const useChart = (chartId: string | null) => {
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartId) return;

    const fetchChart = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await chartService.getChartById(chartId);
        setChart(data);
      } catch (err) {
        console.error('Error fetching chart:', err);
        setError('Failed to load birth chart. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChart();
  }, [chartId]);

  return { chart, loading, error };
};

export default useChart;
