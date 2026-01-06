import axios, { AxiosResponse, AxiosError } from 'axios';
import { getAuthToken, removeAuthToken, removeUserData } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Log the base URL for debugging
console.log('API Base URL:', api.defaults.baseURL);
console.log('Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request details for debugging
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    hasToken: !!token,
    baseURL: config.baseURL
  });
  
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Commented out verbose logging for cleaner console
    // console.error('=== API Error Intercepted ===');
    // console.error('Error object:', error);
    // console.error('Error type:', typeof error);
    // console.error('Error constructor:', error?.constructor?.name);
    
    const errorDetails = {
      message: error?.message || 'Unknown error',
      code: error?.code || 'UNKNOWN',
      status: error?.response?.status || null,
      statusText: error?.response?.statusText || '',
      url: error?.config?.url || '',
      method: error?.config?.method || '',
      baseURL: error?.config?.baseURL || '',
      data: error?.response?.data || null,
      headers: error?.config?.headers || {},
      isNetworkError: !error?.response,
      isTimeout: error?.code === 'ECONNABORTED',
      isCancel: axios.isCancel(error),
      stack: error?.stack || ''
    };
    
    // console.error('API Error Details:', errorDetails);
    
    // Check for specific error types
    if (errorDetails.isNetworkError) {
      console.error('Network Error - Check if server is running and accessible');
    }
    
    if (errorDetails.isTimeout) {
      console.error('Timeout Error - Request took too long');
    }
    
    if (errorDetails.status && errorDetails.status === 401) {
      console.error('Authentication Error - Redirecting to login');
      removeAuthToken();
      removeUserData();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (errorDetails.status && errorDetails.status >= 500) {
      console.error('Server Error - Backend issue');
    } else if (errorDetails.status && errorDetails.status >= 400) {
      console.error('Client Error - Request issue');
    }
    
    return Promise.reject(error);
  }
);

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('=== Global Error Caught ===');
    console.error('Error message:', event.message);
    console.error('Error filename:', event.filename);
    console.error('Error lineno:', event.lineno);
    console.error('Error colno:', event.colno);
    console.error('Error object:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('=== Unhandled Promise Rejection ===');
    console.error('Reason:', event.reason);
    console.error('Promise:', event.promise);
  });
}

export default api;