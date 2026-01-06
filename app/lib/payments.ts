import api from './api';

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

export const confirmPayment = async (bookingId: string, paymentIntentId: string): Promise<PaymentConfirmationResponse> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        paymentIntentId
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to confirm payment');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const createPaymentIntent = async (eventId: string, quantity: number): Promise<PaymentIntentResponse> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        quantity
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment intent');
    }
    
    return data;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmBooking = async (data: PaymentConfirmationRequest): Promise<BookingResponse> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch('/api/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to confirm booking');
    }
    
    return responseData;
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
