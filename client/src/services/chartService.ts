import axios from 'axios';
import { BirthData, ChartResponse } from '../types/chart';

// Base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to generate birth chart
export const generateBirthChart = async (birthData: BirthData): Promise<ChartResponse> => {
  try {
    const response = await api.post('/charts', birthData);
    return response.data;
  } catch (error) {
    console.error('Error generating birth chart:', error);
    throw error;
  }
};

// Function to fetch a specific chart by ID
export const getChartById = async (chartId: string): Promise<ChartResponse> => {
  try {
    const response = await api.get(`/charts/${chartId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chart:', error);
    throw error;
  }
};

// Function to fetch all charts for a user
export const getUserCharts = async (): Promise<ChartResponse[]> => {
  try {
    const response = await api.get('/charts');
    return response.data;
  } catch (error) {
    console.error('Error fetching user charts:', error);
    throw error;
  }
};

// Function to delete a chart
export const deleteChart = async (chartId: string): Promise<void> => {
  try {
    await api.delete(`/charts/${chartId}`);
  } catch (error) {
    console.error('Error deleting chart:', error);
    throw error;
  }
};

export default {
  generateBirthChart,
  getChartById,
  getUserCharts,
  deleteChart,
};
