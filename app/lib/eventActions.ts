import api from './api';

export interface JoinEventResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export interface LeaveEventResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export const joinEvent = async (eventId: string): Promise<JoinEventResponse> => {
  try {
    console.log('Joining event:', eventId);
    const response = await api.post(`/events/${eventId}/join`);
    console.log('Event joined successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error joining event:', error);
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export const leaveEvent = async (eventId: string): Promise<LeaveEventResponse> => {
  try {
    console.log('Leaving event:', eventId);
    const response = await api.post(`/events/${eventId}/leave`);
    console.log('Event left successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error leaving event:', error);
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export const saveEvent = async (eventId: string): Promise<JoinEventResponse> => {
  try {
    const response = await api.post(`/events/${eventId}/save`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const unsaveEvent = async (eventId: string): Promise<LeaveEventResponse> => {
  try {
    const response = await api.delete(`/events/${eventId}/save`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
