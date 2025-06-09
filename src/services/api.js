import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  
  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
    list: '/users',
    getById: (id) => `/users/${id}`,
    update: (id) => `/users/${id}`,
    delete: (id) => `/users/${id}`,
  },
  
  // Doctors
  doctors: {
    list: '/doctors',
    getById: (id) => `/doctors/${id}`,
    create: '/doctors',
    update: (id) => `/doctors/${id}`,
    delete: (id) => `/doctors/${id}`,
    search: '/doctors/search',
    availability: (id) => `/doctors/${id}/availability`,
    schedule: (id) => `/doctors/${id}/schedule`,
  },
  
  // Appointments
  appointments: {
    list: '/appointments',
    getById: (id) => `/appointments/${id}`,
    create: '/appointments',
    update: (id) => `/appointments/${id}`,
    delete: (id) => `/appointments/${id}`,
    byUser: (userId) => `/appointments/user/${userId}`,
    byDoctor: (doctorId) => `/appointments/doctor/${doctorId}`,
    upcoming: '/appointments/upcoming',
    history: '/appointments/history',
    cancel: (id) => `/appointments/${id}/cancel`,
    confirm: (id) => `/appointments/${id}/confirm`,
  },
  
  // Emergency
  emergency: {
    alert: '/emergency/alert',
    list: '/emergency/alerts',
    getById: (id) => `/emergency/${id}`,
    update: (id) => `/emergency/${id}`,
    nearby: '/emergency/nearby',
    track: (id) => `/emergency/${id}/track`,
  },
  
  // Hospitals
  hospitals: {
    list: '/hospitals',
    getById: (id) => `/hospitals/${id}`,
    create: '/hospitals',
    update: (id) => `/hospitals/${id}`,
    delete: (id) => `/hospitals/${id}`,
    search: '/hospitals/search',
    nearby: '/hospitals/nearby',
    departments: (id) => `/hospitals/${id}/departments`,
  },
  
  // Departments
  departments: {
    list: '/departments',
    getById: (id) => `/departments/${id}`,
    create: '/departments',
    update: (id) => `/departments/${id}`,
    delete: (id) => `/departments/${id}`,
    doctors: (id) => `/departments/${id}/doctors`,
  },
  
  // Medical Records
  medicalRecords: {
    list: '/medical-records',
    getById: (id) => `/medical-records/${id}`,
    create: '/medical-records',
    update: (id) => `/medical-records/${id}`,
    delete: (id) => `/medical-records/${id}`,
    byPatient: (patientId) => `/medical-records/patient/${patientId}`,
    export: (patientId) => `/medical-records/patient/${patientId}/export`,
  },
  
  // Ratings and Reviews
  ratings: {
    list: '/ratings',
    create: '/ratings',
    update: (id) => `/ratings/${id}`,
    delete: (id) => `/ratings/${id}`,
    byDoctor: (doctorId) => `/ratings/doctor/${doctorId}`,
    byHospital: (hospitalId) => `/ratings/hospital/${hospitalId}`,
    byUser: (userId) => `/ratings/user/${userId}`,
  },
  
  // Notifications
  notifications: {
    list: '/notifications',
    getById: (id) => `/notifications/${id}`,
    markAsRead: (id) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    delete: (id) => `/notifications/${id}`,
    preferences: '/notifications/preferences',
    updatePreferences: '/notifications/preferences',
  },
  
  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    doctors: '/admin/doctors',
    hospitals: '/admin/hospitals',
    appointments: '/admin/appointments',
    reports: '/admin/reports',
    analytics: '/admin/analytics',
    auditLogs: '/admin/audit-logs',
    settings: '/admin/settings',
  },
  
  // File uploads
  uploads: {
    single: '/uploads/single',
    multiple: '/uploads/multiple',
    avatar: '/uploads/avatar',
    documents: '/uploads/documents',
  },
};

// Generic API methods
const apiMethods = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Upload file
  upload: async (url, formData, config = {}) => {
    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers,
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.message || 'An error occurred',
      errors: data.errors || [],
    };
  } else if (error.request) {
    // Request made but no response received
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      errors: [],
    };
  } else {
    // Something else happened
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      errors: [],
    };
  }
};

// Utility functions for common API patterns
const apiUtils = {
  // Get paginated data
  getPaginated: async (url, params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...params.filters,
    });
    return apiMethods.get(`${url}?${queryParams}`);
  },
  
  // Search with filters
  search: async (url, searchTerm, filters = {}) => {
    const queryParams = new URLSearchParams({
      q: searchTerm,
      ...filters,
    });
    return apiMethods.get(`${url}?${queryParams}`);
  },
  
  // Bulk operations
  bulkOperation: async (url, operation, ids) => {
    return apiMethods.post(`${url}/bulk`, {
      operation,
      ids,
    });
  },
  
  // Health check
  healthCheck: async () => {
    return apiMethods.get('/health');
  },
};

// Auth token management
const tokenManager = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  isTokenValid: () => {
    const token = tokenManager.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

// Export everything
export {
  api,
  endpoints,
  apiMethods,
  apiUtils,
  tokenManager,
  handleApiError,
};

export default {
  ...apiMethods,
  endpoints,
  utils: apiUtils,
  token: tokenManager,
};