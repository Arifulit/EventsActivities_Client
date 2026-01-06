import axios from 'axios';
import { getAuthToken } from '@/app/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const fetchEvents = async (params = {}) => {
  try {
    const response = await api.get('/events', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

const fetchUserBookings = async () => {
  try {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

const fetchUserJoinedEvents = async (userId: string, params = {}) => {
  try {
    const response = await api.get(`/users/${userId}/events`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user joined events:', error);
    throw error;
  }
};

const fetchBookingDetails = async (bookingId: string) => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    console.log('Booking details response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching booking details:', error);
    console.error('Error response data:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch booking details';
    throw new Error(errorMessage);
  }
};

const createPaymentIntent = async (bookingId: string) => {
  try {
    const response = await api.post('/payments/create-intent', { bookingId });
    console.log('Payment intent created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    console.error('Error response data:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment intent';
    throw new Error(errorMessage);
  }
};

const confirmPayment = async (bookingId: string, paymentIntentId?: string, paymentMethodId?: string) => {
  try {
    const payload: any = { bookingId };
    if (paymentIntentId) payload.paymentIntentId = paymentIntentId;
    if (paymentMethodId) payload.paymentMethodId = paymentMethodId;
    
    console.log('Payment confirmation payload:', payload);
    
    const response = await api.post('/payments/confirm', payload);
    console.log('Payment confirmation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    // Provide more detailed error information
    const errorMessage = error.response?.data?.message || error.message || 'Payment confirmation failed';
    throw new Error(errorMessage);
  }
};

const joinEvent = async (eventId: string) => {
  try {
    const response = await api.post(`/events/${eventId}/join`);
    console.log('Event joined response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error joining event:', error);
    console.error('Error response data:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to join event';
    throw new Error(errorMessage);
  }
};

const createReview = async (eventId: string, rating: number, comment: string) => {
  try {
    const response = await api.post('/reviews', { eventId, rating, comment });
    console.log('Review created response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating review:', error);
    console.error('Error response data:', error.response?.data);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create review';
    throw new Error(errorMessage);
  }
};

// Admin API functions
const fetchAdminStats = async () => {
  try {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch admin statistics';
    throw new Error(errorMessage);
  }
};

const fetchSystemAlerts = async () => {
  try {
    // Mock alerts data since we don't have a dedicated alerts endpoint
    return [
      {
        id: '1',
        title: 'High Server Load',
        description: 'Server CPU usage is above 80%',
        severity: 'high' as const,
        timestamp: new Date().toISOString(),
        actionRequired: true,
        icon: '⚠️'
      },
      {
        id: '2',
        title: 'New User Milestone',
        description: 'Platform has reached 15,000 users',
        severity: 'low' as const,
        timestamp: new Date().toISOString(),
        actionRequired: false,
        icon: '🎉'
      }
    ];
  } catch (error: any) {
    console.error('Error fetching system alerts:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch system alerts';
    throw new Error(errorMessage);
  }
};

const fetchUserGrowthData = async () => {
  try {
    const response = await api.get('/admin/analytics/users?period=30days');
    return response.data.data.chartData;
  } catch (error: any) {
    console.error('Error fetching user growth data:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user growth data';
    throw new Error(errorMessage);
  }
};

const fetchRevenueData = async () => {
  try {
    const response = await api.get('/admin/analytics/revenue?period=30days');
    return response.data.data.chartData;
  } catch (error: any) {
    console.error('Error fetching revenue data:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch revenue data';
    throw new Error(errorMessage);
  }
};

const fetchTopPerformers = async () => {
  try {
    // Mock top performers data since we don't have a dedicated performers endpoint
    return [
      {
        id: '1',
        name: 'Sarah Johnson',
        events: 12,
        revenue: 45000,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Michael Chen',
        events: 8,
        revenue: 32000,
        rating: 4.9
      },
      {
        id: '3',
        name: 'Emily Davis',
        events: 6,
        revenue: 28000,
        rating: 4.7
      }
    ];
  } catch (error: any) {
    console.error('Error fetching top performers:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch top performers';
    throw new Error(errorMessage);
  }
};

export { 
  fetchEvents, 
  fetchUserBookings, 
  fetchUserJoinedEvents, 
  confirmPayment, 
  createPaymentIntent, 
  fetchBookingDetails, 
  createReview, 
  joinEvent,
  fetchAdminStats,
  fetchSystemAlerts,
  fetchUserGrowthData,
  fetchRevenueData,
  fetchTopPerformers
};
export default api;
