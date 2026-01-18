import api from './api';

export interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  date: string;
  time: string;
  duration: number;
  hostId: string | {
    _id: string;
    fullName: string;
    profileImage: string;
    averageRating?: number;
    totalReviews?: number;
    bio?: string;
  };
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  paymentType: 'free' | 'paid';
  image: string;
  images: string[];
  requirements: string[];
  tags: string[];
  status: string;
  isPublic: boolean;
  participants: (string | {
    _id: string;
    fullName: string;
    profileImage?: string;
    rating?: number;
  })[];
  waitingList: string[];
  location: {
    venue: string;
    address: string;
    city: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface JoinEventResponse {
  success: boolean;
  message: string;
  data: Event;
  timestamp: string;
}

export interface MyEventsResponse {
  success: boolean;
  message: string;
  data: Event[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  timestamp: string;
}

export const joinEvent = async (eventId: string): Promise<JoinEventResponse> => {
  try {
    console.log('🔗 Joining Event:');
    console.log('  - Event ID:', eventId);
    console.log('  - Type:', typeof eventId);
    console.log('  - Length:', eventId.length);
    console.log('  - Is 24-char hex:', /^[0-9a-fA-F]{24}$/.test(eventId));
    
    // Use the API instance with proper authentication
    const response = await api.post(`/events/${eventId}/join`);
    console.log('Join event response:', response.data);
    
    // Validate response data to ensure participant count is reasonable
    if (response.data.data && response.data.data.currentParticipants < 0) {
      console.warn('⚠️ Backend returned negative participant count after join:', response.data.data.currentParticipants);
      response.data.data.currentParticipants = 1; // Fix on client side - at least the current user
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error joining event:', error);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Event ID that failed:', eventId);
    
    // Handle specific validation errors
    if (error.response?.data?.message?.includes('currentParticipants')) {
      throw new Error('Event participant count error. Please refresh the page and try again.');
    }
    
    throw error;
  }
};

export const leaveEvent = async (eventId: string): Promise<JoinEventResponse> => {
  try {
    console.log('🚪 Leaving Event:');
    console.log('  - Event ID:', eventId);
    console.log('  - Type:', typeof eventId);
    console.log('  - Length:', eventId.length);
    console.log('  - Is 24-char hex:', /^[0-9a-fA-F]{24}$/.test(eventId));
    
    // Use the API instance with proper authentication
    const response = await api.post(`/events/${eventId}/leave`);
    console.log('Leave event response:', response.data);
    
    // Validate response data to prevent negative participant counts
    if (response.data.data && response.data.data.currentParticipants < 0) {
      console.warn('⚠️ Backend returned negative participant count:', response.data.data.currentParticipants);
      response.data.data.currentParticipants = 0; // Fix on client side
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error leaving event:', error);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Event ID that failed:', eventId);
    
    // Handle specific validation errors
    if (error.response?.data?.message?.includes('currentParticipants') && 
        error.response?.data?.message?.includes('less than minimum')) {
      throw new Error('Cannot leave event: Participant count would become negative. Please refresh the page.');
    }
    
    throw error;
  }
};

export const getEvents = async (params?: {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isFree?: boolean;
  search?: string;
}): Promise<Event[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.isFree !== undefined) queryParams.append('isFree', params.isFree.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const response = await api.get(`/events${queryString ? '?' + queryString : ''}`);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const getEventById = async (eventId: string): Promise<Event> => {
  // Validate event ID format
  if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
    throw new Error('Event ID is required and must be a string');
  }

  console.log('🔍 Event ID Validation:');
  console.log('  - Raw ID:', eventId);
  console.log('  - Type:', typeof eventId);
  console.log('  - Length:', eventId.length);
  console.log('  - Trimmed:', `"${eventId.trim()}"`);
  console.log('  - Is 24-char hex:', /^[0-9a-fA-F]{24}$/.test(eventId));

  // Check for valid ObjectId format (24-character hex string)
  // If it's not a valid ObjectId, we'll still try the request but handle the error gracefully
  if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
    console.warn('⚠️ Invalid event ID format:', eventId);
    console.warn('  Expected: 24-character hexadecimal string (MongoDB ObjectId)');
    console.warn('  Example: 507f1f77bcf86cd799439011');
    // Don't throw error here - let the backend handle validation
  }

  try {
    console.log('Making request to:', `/events/${eventId}`);
    const response = await api.get(`/events/${eventId}`);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    if (!response.data.data) {
      throw new Error('Event not found');
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error('API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message || error.message,
      url: `/events/${eventId}`
    });
    
    // Provide more specific error messages
    if (error.response?.status === 400) {
      throw new Error('Invalid event ID or event not found');
    } else if (error.response?.status === 404) {
      throw new Error('Event not found');
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later');
    }
    
    throw error;
  }
};

export const getMyEvents = async (): Promise<MyEventsResponse> => {
  try {
    const response = await api.get('/events/my-events');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getHostedEvents = async (params?: {
  type?: string;
  location?: string;
  status?: string;
}): Promise<MyEventsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.set('type', params.type);
    if (params?.location) queryParams.set('location', params.location);
    if (params?.status) queryParams.set('status', params.status);
    
    const queryString = queryParams.toString();
    const response = await api.get(`/events/hosted-events${queryString ? '?' + queryString : ''}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  try {
    const response = await api.post('/events', eventData);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<Event> => {
  try {
    const response = await api.put(`/events/${eventId}`, eventData);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  try {
    await api.delete(`/events/${eventId}`);
  } catch (error: any) {
    throw error;
  }
};
