import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include session token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        config.headers.Authorization = `Bearer ${sessionId}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  }
};

// Reports functions
export const reportsAPI = {
  getAll: async () => {
    const response = await api.get('/api/reports');
    return response.data;
  },

  create: async (reportData) => {
    const response = await api.post('/api/reports', reportData);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/reports/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/api/reports/${id}/status`, { status });
    return response.data;
  }
};

// Users functions
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/api/users');
    return response.data;
  }
};

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
