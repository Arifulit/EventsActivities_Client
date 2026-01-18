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
    console.log('🔗 Joining Event (eventActions):');
    console.log('  - Event ID:', eventId);
    console.log('  - Type:', typeof eventId);
    console.log('  - Length:', eventId.length);
    console.log('  - Is 24-char hex:', /^[0-9a-fA-F]{24}$/.test(eventId));
    
    // Validate event ID format
    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      throw new Error('Event ID is required and must be a string');
    }
    
    const response = await api.post(`/events/${eventId}/join`);
    console.log('✅ Event joined successfully:', response.data);
    
    // Validate response data to ensure participant count is reasonable
    if (response.data && response.data.data && response.data.data.currentParticipants < 0) {
      console.warn('⚠️ Backend returned negative participant count after join, fixing on client side');
      response.data.data.currentParticipants = 1; // At least the current user
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error joining event (eventActions):', error);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Event ID that failed:', eventId);
    
    // Handle specific validation errors
    if (error.response?.data?.message?.includes('currentParticipants')) {
      throw new Error('Event participant count error. Please refresh the page and try again.');
    }
    
    // Handle 500 server errors with more user-friendly message
    if (error.response?.status === 500) {
      console.error('💥 Backend server error (500) - This is likely a backend issue');
      throw new Error('Server error occurred while joining event. Please try again later or contact support.');
    }
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
    throw error;
  }
};

export const leaveEvent = async (eventId: string): Promise<LeaveEventResponse> => {
  try {
    console.log('🚪 Leaving Event (eventActions):');
    console.log('  - Event ID:', eventId);
    console.log('  - Type:', typeof eventId);
    console.log('  - Length:', eventId.length);
    console.log('  - Is 24-char hex:', /^[0-9a-fA-F]{24}$/.test(eventId));
    
    // Validate event ID format
    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      throw new Error('Event ID is required and must be a string');
    }
    
    const response = await api.post(`/events/${eventId}/leave`);
    console.log('✅ Event left successfully:', response.data);
    
    // Validate response data to prevent negative participant counts
    if (response.data && response.data.data && response.data.data.currentParticipants < 0) {
      console.warn('⚠️ Backend returned negative participant count, fixing on client side');
      response.data.data.currentParticipants = 0;
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error leaving event (eventActions):', error);
    console.error('❌ Error response data:', error.response?.data);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Event ID that failed:', eventId);
    
    // Handle specific validation errors
    if (error.response?.data?.message?.includes('currentParticipants') && 
        error.response?.data?.message?.includes('less than minimum')) {
      throw new Error('Cannot leave event: Participant count would become negative. Please refresh the page.');
    }
    
    // Handle 500 server errors with more user-friendly message
    if (error.response?.status === 500) {
      console.error('💥 Backend server error (500) - This is likely a backend issue');
      throw new Error('Server error occurred while leaving event. Please try again later or contact support.');
    }
    
    // Handle network errors
    if (!error.response) {
      throw new Error('Network error. Please check your connection and try again.');
    }
    
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
