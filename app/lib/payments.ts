import api from './api';

export interface CreatePaymentIntentRequest {
  eventId: string;
  amount: number;
  currency?: string;
  metadata?: {
    eventName?: string;
    userId?: string;
    [key: string]: string | undefined;
  };
}

export interface PaymentIntentResponse {
  success: boolean;
  message: string;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
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

export interface BookingConfirmationRequest {
  bookingId: string;
  paymentIntentId?: string;
}

export const createPaymentIntent = async (data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> => {
  try {
    const response = await api.post('/bookings/create-intent', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const confirmBooking = async (data: BookingConfirmationRequest): Promise<BookingResponse> => {
  try {
    const response = await api.post('/bookings/confirm', data);
    return response.data;
  } catch (error: any) {
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
