import api from './api';

export interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
  hostId: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
  eventId: {
    _id: string;
    title: string;
    date: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostReview {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    profileImage: string;
  };
  hostId: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  eventId: string;
  rating: number;
  comment: string;
}

export interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: Review;
  timestamp: string;
}

export interface GetReviewsResponse {
  success: boolean;
  message: string;
  data: Review[];
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

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const createReview = async (data: CreateReviewRequest): Promise<CreateReviewResponse> => {
  try {
    const response = await api.post('/reviews', data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getEventReviews = async (eventId: string, page: number = 1): Promise<GetReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/event/${eventId}?page=${page}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const getEventReviewStats = async (eventId: string): Promise<ReviewStats> => {
  try {
    const response = await api.get(`/reviews/event/${eventId}/stats`);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};

export const updateReview = async (reviewId: string, data: Partial<CreateReviewRequest>): Promise<CreateReviewResponse> => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/reviews/${reviewId}`);
  } catch (error: any) {
    throw error;
  }
};

export const getUserReviews = async (userId: string): Promise<GetReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export interface GetHostReviewsResponse {
  success: boolean;
  message: string;
  data: HostReview[];
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

export const getHostReviews = async (hostId: string, page: number = 1): Promise<GetHostReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/host/${hostId}?page=${page}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export interface HostReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export const getHostReviewStats = async (hostId: string): Promise<HostReviewStats> => {
  try {
    const response = await api.get(`/reviews/host/${hostId}/stats`);
    return response.data.data;
  } catch (error: any) {
    throw error;
  }
};
