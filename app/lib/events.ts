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
    console.log('Joining event:', eventId);
    
    // Use the API instance with proper authentication
    const response = await api.post(`/events/${eventId}/join`);
    console.log('Join event response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error joining event:', error);
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export const leaveEvent = async (eventId: string): Promise<JoinEventResponse> => {
  try {
    console.log('Leaving event:', eventId);
    
    // Use the API instance with proper authentication
    const response = await api.post(`/events/${eventId}/leave`);
    console.log('Leave event response:', response.data);
    
    return response.data;
  } catch (error: any) {
    console.error('Error leaving event:', error);
    console.error('Error response data:', error.response?.data);
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
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data.data;
  } catch (error: any) {
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
