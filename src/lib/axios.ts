import axios from 'axios';
import { clearAuthTokens } from './auth';

// API URL from environment variables with fallback
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create a custom axios instance with configured defaults
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData/multipart requests
    // as the browser needs to set the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error('Authentication error:', error.response.data?.error || 'Unauthorized');
      
      // Check if it's a token expiration issue
      const errorMessage = error.response.data?.error || '';
      if (errorMessage.includes('expired') || errorMessage.includes('Invalid token')) {
        console.log('Token expired or invalid, clearing auth data');
        // Clear authentication data
        clearAuthTokens();
        
        // Redirect to login after a short delay if not already there
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 