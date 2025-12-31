import api from './api';

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  bio?: string;
  interests: string[];
  location?: {
    city: string;
  };
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  stripeAccountId?: string;
  hostedEvents: string[];
  joinedEvents: string[];
  savedEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  location?: {
    city: string;
  };
  interests?: string[];
  profileImage?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: UserProfile;
  timestamp: string;
}

export const getUserProfile = async (userId: string): Promise<UserResponse> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to view this profile');
    } else if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required: Please log in again');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
};

export const updateUserProfile = async (userId: string, userData: UpdateProfileData): Promise<UserResponse> => {
  try {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Access denied: You do not have permission to update this profile');
    } else if (error.response?.status === 404) {
      throw new Error('User not found');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required: Please log in again');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid data provided');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to update user profile');
    }
  }
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required: Please log in again');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied: Invalid session');
    } else {
      throw new Error(error.response?.data?.message || 'Failed to fetch current user');
    }
  }
};
