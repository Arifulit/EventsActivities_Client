import api from './api';
import { getAuthToken } from './auth';

export interface CreatePaymentIntentRequest {
  eventId: string;
  quantity: number;
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    paymentId: string;
    bookingId: string;
  };
  timestamp: string;
}

export interface BookingRequest {
  eventId: string;
  paymentIntentId: string;
  participantInfo?: {
    fullName: string;
    email: string;
    phone?: string;
  };
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: {
    bookingId: string;
    eventId: string;
    paymentId: string;
    status: string;
    amount: number;
    createdAt: string;
  };
  timestamp: string;
}

export interface PaymentConfirmationRequest {
  bookingId: string;
  paymentIntentId: string;
  paymentMethodId?: string;
  returnUrl?: string;
}

export interface PaymentConfirmationResponse {
  success: boolean;
  message: string;
  data?: {
    bookingId: string;
    paymentId: string;
    status: string;
    amount: number;
    currency: string;
  };
  timestamp: string;
}

export const confirmPayment = async (
  bookingId: string, 
  paymentIntentId: string, 
  paymentMethodId?: string,
  returnUrl?: string
): Promise<PaymentConfirmationResponse> => {
  try {
    // Get token using the auth system
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const requestData: PaymentConfirmationRequest = {
      bookingId,
      paymentIntentId,
      ...(paymentMethodId && { paymentMethodId }),
      ...(returnUrl && { returnUrl })
    };
    
    const response = await api.post('/payments/confirm', requestData);
    
    return response.data;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const createPaymentIntent = async (eventId: string, quantity: number): Promise<PaymentIntentResponse> => {
  try {
    // Get token using the auth system
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('Creating payment intent with:', { eventId, quantity });
    
    const response = await api.post('/payments/create-intent', {
      eventId,
      quantity
    });
    
    console.log('Payment intent response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error code:', error.code);
    
    // Handle network errors or when backend is not running
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please ensure the backend server is running.');
    }
    
    // Handle HTML responses (error pages)
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      throw new Error('Server is not responding correctly. Please try again later.');
    }
    
    // Handle specific 500 errors
    if (error.response?.status === 500) {
      throw new Error('Server error occurred. Please try again later or contact support.');
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create payment intent';
    throw new Error(errorMessage);
  }
};

export const confirmBooking = async (data: PaymentConfirmationRequest): Promise<BookingResponse> => {
  try {
    // Get token using the auth system
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('Confirming booking with data:', data);
    console.log('Auth token present:', !!token);
    
    const response = await api.post('/payments/confirm', data);
    
    console.log('Booking confirmation response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error confirming booking:', error);
    throw error;
  }
};

export const getBookingDetails = async (bookingId: string): Promise<BookingResponse> => {
  try {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getMyBookings = async () => {
  try {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
