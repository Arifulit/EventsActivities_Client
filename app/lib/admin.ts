import api from './api';

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
}

export interface AdminStatsResponse {
  success: boolean;
  message: string;
  data: AdminStats;
  timestamp: string;
}

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'user' | 'host' | 'admin';
  profileImage: string;
  bio: string;
  interests: string[];
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  stripeAccountId: string;
  hostedEvents: string[];
  joinedEvents: string[];
  savedEvents: string[];
  location: {
    city: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  timestamp: string;
}

export const getAdminStats = async (): Promise<AdminStatsResponse> => {
  try {
    const response = await api.get('/admin/stats');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getAdminUsers = async (): Promise<AdminUsersResponse> => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
