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
    const response = await api.post(`/events/${eventId}/join`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const leaveEvent = async (eventId: string): Promise<LeaveEventResponse> => {
  try {
    const response = await api.post(`/events/${eventId}/leave`);
    return response.data;
  } catch (error: any) {
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
