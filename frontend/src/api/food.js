import axios from 'axios';

const viteBase = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : undefined;
const originFallback = (typeof window !== 'undefined' ? window.location.origin : '');
const API_BASE = viteBase || originFallback;

const api = axios.create({
  baseURL: `${API_BASE}/api/food`,
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

export const foodAPI = {
  // Get all food items
  getAllFoodItems: async () => {
    try {
      const response = await api.get('/');
      // Backend returns { foodItems, pagination }. Normalize to an array for consumers.
      return response.data?.foodItems ?? response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get food item by ID
  getFoodItem: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new food item
  createFoodItem: async (foodData) => {
    try {
      const response = await api.post('/', foodData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update food item
  updateFoodItem: async (id, foodData) => {
    try {
      const response = await api.put(`/${id}`, foodData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete food item
  deleteFoodItem: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get food items by category
  getFoodItemsByCategory: async (category) => {
    try {
      const response = await api.get(`/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get expiring food items
  getExpiringItems: async (days = 7) => {
    try {
      const response = await api.get(`/expiring?days=${days}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get expired food items
  getExpiredItems: async () => {
    try {
      const response = await api.get('/expired');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

