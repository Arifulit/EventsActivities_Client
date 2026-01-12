// Admin actions with API integration
import api from './api';

export interface ChangeRoleResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export interface ChangeRoleData {
  role: 'user' | 'host' | 'admin';
}

export interface VerifyUserResponse {
  success: boolean;
  message: string;
  data: any;
  timestamp: string;
}

export const changeUserRole = async (userId: string, roleData: ChangeRoleData): Promise<ChangeRoleResponse> => {
  try {
    // Mock response - no API call
    return {
      success: true,
      message: `User role changed to ${roleData.role} successfully`,
      data: { userId, role: roleData.role },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    throw error;
  }
};

export const verifyUser = async (userId: string): Promise<VerifyUserResponse> => {
  try {
    // Mock response - no API call
    return {
      success: true,
      message: 'User verified successfully',
      data: { userId, verified: true },
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    throw error;
  }
};

export const banUser = async (userId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/ban`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const unbanUser = async (userId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const approveHost = async (hostId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.patch(`/admin/hosts/${hostId}/approve`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const rejectHost = async (hostId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.patch(`/admin/hosts/${hostId}/reject`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export interface UpdateEventStatusData {
  status: string;
}

export const updateEventStatus = async (eventId: string, statusData: UpdateEventStatusData): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/events/${eventId}/status`, statusData);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export interface Review {
  _id: string;
  userId: {
    _id: string;
    email: string;
  };
  hostId: {
    _id: string;
    email: string;
  };
  eventId: {
    _id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  message: string;
  data: {
    reviews: Review[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  timestamp: string;
}

export const getReviews = async (page: number = 1, limit: number = 10): Promise<ReviewsResponse> => {
  try {
    const response = await api.get(`/admin/reviews?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.delete(`/admin/reviews/${reviewId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export interface FlaggedEvent {
  _id: string;
  title: string;
  description: string;
  flaggedBy: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlaggedContentResponse {
  success: boolean;
  message: string;
  data: {
    events: FlaggedEvent[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  timestamp: string;
}

export const getFlaggedContent = async (page: number = 1, limit: number = 10): Promise<FlaggedContentResponse> => {
  try {
    const response = await api.get(`/admin/flagged-content?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const reviewFlaggedContent = async (contentId: string, action: 'approve' | 'remove'): Promise<ChangeRoleResponse> => {
  try {
    const response = await api.put(`/admin/flagged-content/${contentId}/${action}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export interface DashboardStats {
  totalUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
}

export interface DashboardStatsResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
  timestamp: string;
}

export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  try {
    const response = await {
      data: {
        success: true,
        message: 'Dashboard stats retrieved successfully',
        data: {
          totalUsers: 100,
          verifiedUsers: 50,
          bannedUsers: 10,
          totalEvents: 200,
          activeEvents: 100,
          completedEvents: 50
        },
        timestamp: new Date().toISOString()
      }
    };
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
