import axios from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
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
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // User registration
  registerUser: (userData) => api.post('/auth/register/user', userData),
  
  // Doctor registration
  registerDoctor: (doctorData) => api.post('/auth/register/doctor', doctorData),
  
  // Admin registration
  registerAdmin: (adminData) => api.post('/auth/register/admin', adminData),
  
  // User login
  loginUser: (credentials) => api.post('/auth/login/user', credentials),
  
  // Doctor login
  loginDoctor: (credentials) => api.post('/auth/login/doctor', credentials),
  
  // Admin login
  loginAdmin: (credentials) => api.post('/auth/login/admin', credentials),
  
  // Logout
  logout: () => api.post('/auth/logout'),
};

// User API endpoints
export const userAPI = {
  // Get user profile
  getProfile: () => api.get('/user/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/user/profile', userData),
  
  // Get appointments
  getAppointments: (params) => api.get('/user/appointments', { params }),
  
  // Book appointment
  bookAppointment: (appointmentData) => api.post('/user/appointments', appointmentData),
  
  // Search doctors
  searchDoctors: (searchParams) => api.get('/user/search/doctors', { params: searchParams }),
};

// Doctor API endpoints
export const doctorAPI = {
  // Get doctor profile
  getProfile: () => api.get('/doctor/profile'),
  
  // Get appointment requests
  getAppointmentRequests: () => api.get('/doctor/appointment-requests'),
  
  // Get scheduled appointments
  getAppointments: (params) => api.get('/doctor/appointments', { params }),
};

// Admin API endpoints
export const adminAPI = {
  // Get admin profile
  getProfile: () => api.get('/admin/profile'),
  
  // Get dashboard analytics
  getDashboardAnalytics: () => api.get('/admin/dashboard/analytics'),
  
  // Manage staff
  getStaff: (params) => api.get('/admin/staff', { params }),
};

export default api;