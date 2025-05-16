import { useState } from 'react';
import { BirthData, ChartResponse } from '../types/chart';
import chartService from '../services/chartService';

/**
 * Custom hook to generate a birth chart
 */
const useGenerateChart = () => {
  const [chart, setChart] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateChart = async (birthData: BirthData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await chartService.generateBirthChart(birthData);
      setChart(data);
      return data;
    } catch (err) {
      console.error('Error generating chart:', err);
      setError('Failed to generate birth chart. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateChart, chart, loading, error };
};

export default useGenerateChart;
