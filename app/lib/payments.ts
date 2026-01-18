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
    paymentStatus?: string;
    amount: number;
    currency: string;
  };
  timestamp: string;
}

export const confirmPayment = async (
  bookingId: string, 
  paymentIntentId?: string, 
  paymentMethodId?: string,
  returnUrl?: string
): Promise<PaymentConfirmationResponse> => {
  try {
    // Get token using the auth system
    const token = getAuthToken();
    
    if (!token) {
      console.error('❌ NO TOKEN FOUND - User not authenticated');
      throw new Error('Authentication required. Please log in first.');
    }
    
    // Decode token to check user ID
    let tokenUserId = 'unknown';
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      tokenUserId = decoded.userId || decoded.id || decoded.sub || 'unknown';
      console.log('✓ Token decoded - User ID:', tokenUserId);
    } catch (e) {
      console.warn('⚠ Could not decode token');
    }
    
    console.log('🔄 Confirming payment with:', { 
      bookingId, 
      paymentIntentId, 
      paymentMethodId,
      tokenUserId,
      timestamp: new Date().toISOString()
    });
    console.log('✓ Token present:', !!token);
    console.log('✓ Token length:', token?.length);
    
    const requestData: any = { bookingId };
    if (paymentIntentId) requestData.paymentIntentId = paymentIntentId;
    if (paymentMethodId) requestData.paymentMethodId = paymentMethodId;
    if (returnUrl) requestData.returnUrl = returnUrl;
    
    console.log('📤 Request data:', requestData);
    
    const response = await api.post('/payments/confirm', requestData);
    
    console.log('✅ Payment confirmation successful:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Payment confirmation error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      timestamp: new Date().toISOString()
    });
    
    console.error('📋 Full error response:', error.response);
    
    // Handle 403 Forbidden - Authorization issue
    if (error.response?.status === 403) {
      const backendMessage = error.response?.data?.message;
      const debugInfo = error.response?.data?.details || {};
      
      console.error('🔐 403 AUTHORIZATION ERROR Details:', {
        message: backendMessage,
        bookingUserIdFromBackend: debugInfo?.bookingUserId,
        tokenUserIdFromBackend: debugInfo?.tokenUserId,
        idMatch: debugInfo?.match
      });
      
      let message = backendMessage || 'Access denied';
      if (debugInfo?.bookingUserId && debugInfo?.tokenUserId) {
        message += ` (Booking user: ${debugInfo.bookingUserId}, Token user: ${debugInfo.tokenUserId})`;
      }
      message += '. Make sure you are logged in and the booking belongs to you.';
      
      throw new Error(message);
    }
    
    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('🔍 404 - Booking not found');
      throw new Error('Booking not found. Booking ID might be invalid.');
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.error('🔑 401 - Session expired');
      throw new Error('Session expired. Please log in again.');
    }
    
    // Handle network errors
    if (error.code === 'ECONNREFUSED') {
      console.error('🌐 Network error - Backend not responding');
      throw new Error('Cannot connect to backend server. Please check if backend is running on localhost:5000');
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Payment confirmation failed';
    throw new Error(errorMessage);
  }
};

export const createPaymentIntent = async (eventId: string, quantity: number): Promise<PaymentIntentResponse> => {
  try {
    // Get token using the auth system
    const token = getAuthToken();
    
    if (!token) {
      console.error('❌ NO TOKEN FOUND - User not authenticated');
      throw new Error('Authentication required. Please log in first.');
    }
    
    // Validate inputs
    if (!eventId || eventId.trim() === '') {
      console.error('❌ INVALID EVENT ID:', eventId);
      throw new Error('Event ID is required and cannot be empty');
    }
    
    if (!quantity || quantity < 1) {
      console.error('❌ INVALID QUANTITY:', quantity);
      throw new Error('Quantity must be at least 1');
    }
    
    // Validate eventId format (should be 24-char MongoDB ObjectId)
    const isValidEventId = /^[0-9a-fA-F]{24}$/.test(eventId);
    if (!isValidEventId) {
      console.error('❌ INVALID EVENT ID FORMAT:', eventId);
      throw new Error('Invalid event ID format. Event ID should be a 24-character hexadecimal string.');
    }
    
    // Decode token to check user ID
    let tokenUserId = 'unknown';
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      tokenUserId = decoded.userId || decoded.id || decoded.sub || 'unknown';
      console.log('✓ Token decoded - User ID:', tokenUserId);
    } catch (e) {
      console.warn('⚠ Could not decode token');
    }
    
    console.log('🔄 Creating payment intent with:', { 
      eventId, 
      quantity,
      tokenUserId,
      tokenPresent: !!token,
      tokenLength: token?.length,
      eventIdValid: isValidEventId,
      timestamp: new Date().toISOString()
    });
    
    const requestData = {
      eventId: eventId.trim(), // Ensure no whitespace
      quantity: parseInt(quantity.toString()) // Ensure it's a number
    };
    
    console.log('📤 Request data:', JSON.stringify(requestData, null, 2));
    console.log('📍 API URL:', '/payments/create-intent');
    console.log('🔑 Authorization:', `Bearer ${token.substring(0, 20)}...`);
    
    const response = await api.post('/payments/create-intent', requestData);
    
    console.log('✅ Payment intent response:', response.data);
    console.log('✅ Response status:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('❌ Error creating payment intent:');
    console.error('   Error type:', error instanceof Error ? 'Error' : typeof error);
    console.error('   Error message:', error.message);
    console.error('   Error response data:', error.response?.data);
    console.error('   Error response status:', error.response?.status);
    console.error('   Error response statusText:', error.response?.statusText);
    console.error('   Error code:', error.code);
    console.error('   Full error object:', error);
    
    // Handle network errors or when backend is not running
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on localhost:5000');
    }
    
    // Handle HTML responses (error pages)
    if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
      throw new Error('Server is not responding correctly. Please try again later.');
    }
    
    // Handle 400 Bad Request errors specifically
    if (error.response?.status === 400) {
      const backendMessage = error.response?.data?.message || 'Bad request';
      const backendError = error.response?.data?.error || '';
      const backendValidation = error.response?.data?.errors || {};
      
      console.error('🔍 400 Bad Request Details:', {
        message: backendMessage,
        error: backendError,
        validationErrors: backendValidation,
        fullData: error.response?.data
      });
      
      // Provide more specific error message
      let errorMessage = 'Invalid request: ';
      if (backendMessage.includes('eventId') || backendMessage.includes('Event')) {
        errorMessage += 'Event ID is invalid or not found';
      } else if (backendMessage.includes('quantity')) {
        errorMessage += 'Quantity is invalid';
      } else if (backendMessage.includes('authentication') || backendMessage.includes('token')) {
        errorMessage += 'Authentication issue - please log in again';
      } else if (backendMessage.includes('already joined')) {
        errorMessage += 'You have already joined this event';
      } else if (backendMessage.includes('event is full')) {
        errorMessage += 'This event is already full';
      } else {
        errorMessage += backendMessage || backendError;
      }
      
      throw new Error(errorMessage);
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }
    
    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      throw new Error('Event not found or payment endpoint not available.');
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
