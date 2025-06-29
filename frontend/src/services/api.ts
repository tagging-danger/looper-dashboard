import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.error || 'An error occurred';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  setToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (username: string, email: string, password: string, role = 'viewer') => {
    const response = await api.post('/auth/register', { username, email, password, role });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: { username?: string; email?: string; role?: string }) => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get('/auth/users');
    return response.data;
  },

  getActivityLog: async () => {
    const response = await api.get('/auth/activity-log');
    return response.data;
  },

  setupAdmin: async () => {
    const response = await api.post('/auth/setup-admin');
    return response.data;
  },
};

// Transactions API
export const transactionsAPI = {
  getTransactions: async (params: any = {}) => {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  getTransaction: async (id: number) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: any) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  updateTransaction: async (id: number, data: any) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: number) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  getFilterValues: async () => {
    const response = await api.get('/transactions/filters/values');
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getSummary: async (params: any = {}) => {
    const response = await api.get('/analytics/summary', { params });
    return response.data;
  },

  getTrends: async (params: any = {}) => {
    const response = await api.get('/analytics/trends', { params });
    return response.data;
  },

  getCategories: async (params: any = {}) => {
    const response = await api.get('/analytics/categories', { params });
    return response.data;
  },

  getUsers: async (params: any = {}) => {
    const response = await api.get('/analytics/users', { params });
    return response.data;
  },

  getMonthlyComparison: async () => {
    const response = await api.get('/analytics/monthly-comparison');
    return response.data;
  },
};

// Export API
export const exportAPI = {
  getColumns: async () => {
    const response = await api.get('/export/columns');
    return response.data;
  },

  exportCSV: async (data: any) => {
    const response = await api.post('/export/csv', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportAnalyticsCSV: async (data: any) => {
    const response = await api.post('/export/analytics-csv', data, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api; 