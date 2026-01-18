/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse, AxiosError } from 'axios';
import { getAuthToken, removeAuthToken, removeUserData } from './auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Log base URL for debugging
if (typeof window !== 'undefined') {
  console.log('API Base URL:', api.defaults.baseURL);
  console.log('Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('Using:', process.env.NEXT_PUBLIC_API_URL ? 'External Backend' : 'Local Next.js API Routes');
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log request details for debugging only in development
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.log('🔗 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL || 'undefined',
      fullURL: (config.baseURL || '') + (config.url || ''),
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      headers: config.headers
    });
  }
  
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if response is HTML instead of JSON
    if (response.data && typeof response.data === 'string' && response.data.includes('<!DOCTYPE')) {
      console.warn('Received HTML instead of JSON - Backend server may not be running or API endpoint not found');
      console.warn('Response data (first 200 chars):', response.data.substring(0, 200));
      // Create a synthetic error for HTML responses
      const error = new Error('Received HTML instead of JSON');
      (error as any).response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: response.data,
        config: response.config
      };
      (error as any).code = 'HTML_RESPONSE';
      throw error;
    }
    return response;
  },
  (error: AxiosError) => {
    // Check if we received HTML instead of JSON
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      console.warn('Received HTML instead of JSON - Backend server may not be running or API endpoint not found');
      console.warn('Response data (first 200 chars):', error.response.data.substring(0, 200));
      (error as any).code = 'HTML_RESPONSE';
    }
    
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
      console.warn('Network Error - Check if server is running and accessible');
      (error as any).code = 'NETWORK_ERROR';
    }
    
    if (errorDetails.isTimeout) {
      console.warn('Timeout Error - Request took too long');
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.warn('Connection Refused - Backend server is not running');
      (error as any).code = 'NETWORK_ERROR';
    }
    
    if (errorDetails.status && errorDetails.status === 401) {
      console.warn('Authentication Error - Redirecting to login');
      removeAuthToken();
      removeUserData();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } else if (errorDetails.status && errorDetails.status === 403) {
      console.warn('Authorization Error - User does not have permission');
      // Don't automatically redirect for 403, let the component handle it
      // This is important for payment authorization errors
    } else if (errorDetails.status && errorDetails.status >= 500) {
      console.warn('Server Error - Backend issue, using fallback data');
    } else if (errorDetails.status && errorDetails.status >= 400) {
      console.warn('Client Error - Request issue, using fallback data');
    }
    
    // Don't reject the promise for admin endpoints, let them handle fallback
    if (errorDetails.url?.includes('/admin/')) {
      return Promise.reject(error);
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

// User Events API
export const getUserEvents = async (userId: string, params?: {
  page?: number;
  limit?: number;
  status?: 'upcoming' | 'past' | 'cancelled';
  type?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);

  const response = await api.get(`/users/${userId}/events?${queryParams}`);
  return response.data;
};

// My Bookings API
export const getMyBookings = async (params?: {
  page?: number;
  limit?: number;
  status?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  startDate?: string;
  endDate?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);

  const response = await api.get(`/bookings/my-bookings?${queryParams.toString()}`);
  return response.data;
};

// Payment Confirmation API
export const confirmPayment = async (bookingId: string, paymentIntentId?: string, paymentMethodId?: string, returnUrl?: string) => {
  console.log('🔄 Confirming payment with backend:', {
    bookingId,
    paymentIntentId,
    paymentMethodId,
    returnUrl
  });
  
  const response = await api.post('/payments/confirm', {
    bookingId,
    paymentIntentId,
    paymentMethodId,
    returnUrl
  });
  
  console.log('✅ Payment confirmation response:', response.data);
  console.log('📊 Response details:', {
    success: response.data?.success,
    message: response.data?.message,
    bookingStatus: response.data?.data?.booking?.status,
    paymentStatus: response.data?.data?.booking?.paymentStatus
  });
  
  return response.data;
};

// Create Payment Intent API
export const createPaymentIntent = async (eventId: string, quantity: number = 1) => {
  const response = await api.post('/payments/create-intent', {
    eventId,
    quantity
  });
  return response.data;
};

