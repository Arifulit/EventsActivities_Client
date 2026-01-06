import api from './api';

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

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to load dashboard statistics');
  }
};
