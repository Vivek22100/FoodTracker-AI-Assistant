import axios from 'axios';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : (typeof window !== 'undefined' ? window.location.origin : '');

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE}/api/ai`,
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

export const aiAPI = {
  // Send message to AI agent
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chat', { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get AI suggestions
  getSuggestions: async (context) => {
    try {
      const response = await api.post('/suggestions', context);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

