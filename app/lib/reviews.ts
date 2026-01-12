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
    console.error('Error creating review:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to create review';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
};

export const getEventReviews = async (eventId: string, page: number = 1): Promise<GetReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/event/${eventId}?page=${page}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching event reviews:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to fetch event reviews';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
};

export const getEventReviewStats = async (eventId: string): Promise<ReviewStats> => {
  try {
    const response = await api.get(`/reviews/event/${eventId}/stats`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching event review stats:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      // Server responded with error status
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to fetch event review stats';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
};

export const updateReview = async (reviewId: string, data: Partial<CreateReviewRequest>): Promise<CreateReviewResponse> => {
  try {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating review:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to update review';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await api.delete(`/reviews/${reviewId}`);
  } catch (error: any) {
    console.error('Error deleting review:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to delete review';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
};

export const getUserReviews = async (userId: string): Promise<GetReviewsResponse> => {
  try {
    const response = await api.get(`/reviews/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user reviews:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to fetch user reviews';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
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
    console.error('Error fetching host reviews:', error);
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to fetch host reviews';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
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

export const getHostReviewStats = async (hostId: string, params?: {
  startDate?: string;
  endDate?: string;
}): Promise<HostReviewStats> => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get(`/reviews/host/${hostId}/stats?${queryParams}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching host review stats:', error);
    
    // If route not found, return default stats
    if (error.response?.status === 404) {
      console.warn('Host review stats route not found, returning default values');
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0
        }
      };
    }
    
    // Handle different types of errors properly
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to fetch host review stats';
      throw new Error(errorMessage);
    } else if (error.request) {
      console.error('Network Error - No response received');
      throw new Error('Network error. Please check your connection.');
    } else {
      console.error('Unknown Error:', error.message);
      throw new Error('An unexpected error occurred');
    }
  }
};
