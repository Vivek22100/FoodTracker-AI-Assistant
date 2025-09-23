import axios from 'axios';

const API_URL = '/api/nutrition';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const nutritionAPI = {
  // Search for food items
  searchFood: async (query) => {
    try {
      const response = await api.post('/search', { query });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get nutrition data for a food item
  getNutritionData: async (foodName, quantity = 1, unit = 'g') => {
    try {
      const response = await api.post('/data', {
        foodName,
        quantity,
        unit
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};


