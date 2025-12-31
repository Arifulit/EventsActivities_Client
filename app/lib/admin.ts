import api from './api';
import { getAuthToken, getUserData } from './auth';

// Debug function to check authentication
export const debugAuth = () => {
  const token = getAuthToken();
  const user = getUserData();
  
  console.log('=== Auth Debug Info ===');
  console.log('Token exists:', !!token);
  console.log('Token value:', token?.substring(0, 20) + '...');
  console.log('User exists:', !!user);
  console.log('User role:', user?.role);
  console.log('User email:', user?.email);
  console.log('======================');
  
  return { token, user };
};

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
    console.error('Admin API Error:', error);
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. You must be an admin to access this resource.');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please login again.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to fetch admin users');
    }
  }
};

export const verifyUser = async (userId: string): Promise<any> => {
  try {
    const response = await api.patch(`/admin/users/${userId}/verify`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const banUser = async (userId: string): Promise<any> => {
  try {
    const response = await api.patch(`/admin/users/${userId}/ban`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const unbanUser = async (userId: string): Promise<any> => {
  try {
    const response = await api.patch(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const changeUserRole = async (userId: string, role: string): Promise<any> => {
  try {
    // Try different formats based on backend expectations
    const response = await api.patch(`/admin/users/${userId}/role`, { 
      newRole: role,
      // Alternative formats:
      // role: role,
      // userRole: role,
      // targetRole: role
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
