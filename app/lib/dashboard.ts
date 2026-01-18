/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { getUserEvents, getMyBookings } from './api';

export interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalParticipants: number;
  totalRevenue: number;
  averageRating: number;
  monthlyGrowth: number;
  completionRate: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
  timestamp: string;
}

export interface UserEventsResponse {
  success: boolean;
  message: string;
  data: {
    hosted: any[];
    joined?: any[];
    saved?: any[];
  };
  timestamp: string;
}

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to load dashboard statistics');
  }
};

export const fetchUserJoinedEvents = async (userId: string, params?: any): Promise<UserEventsResponse> => {
  try {
    const response = await getUserEvents(userId, params);
    return response;
  } catch (error: any) {
    console.error('Failed to fetch user events:', error);
    throw new Error(error.message || 'Failed to load user events');
  }
};

export const fetchUserBookings = async (params?: any): Promise<any> => {
  try {
    const response = await getMyBookings(params);
    return response;
  } catch (error: any) {
    console.error('Failed to fetch user bookings:', error);
    throw new Error(error.message || 'Failed to load user bookings');
  }
};
