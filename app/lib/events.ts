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
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const leaveEvent = async (eventId: string): Promise<JoinEventResponse> => {
  try {
    const response = await api.post(`/events/${eventId}/leave`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await api.get('/events');
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
