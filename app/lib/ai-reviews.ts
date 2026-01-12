import api from './api';

export interface AIReviewRequest {
  eventId: string;
  rating: number;
  userComment?: string;
  eventDetails?: {
    title: string;
    category: string;
    description: string;
    location: string;
    date: string;
  };
}

export interface AIReviewResponse {
  success: boolean;
  message: string;
  data: {
    enhancedComment: string;
    suggestions: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    keyPoints: string[];
    improvedVersion?: string;
  };
  timestamp: string;
}

export const generateAIReview = async (data: AIReviewRequest): Promise<AIReviewResponse> => {
  try {
    const response = await api.post('/reviews/ai-generate', {
      action: 'generate',
      ...data
    });
    return response.data;
  } catch (error: any) {
    console.error('Error generating AI review:', error);
    
    if (error.response) {
      const errorDetails = error.response;
      if (errorDetails.status >= 500) {
        console.error('Server Error - Backend issue');
      } else if (errorDetails.status >= 400) {
        console.error('Client Error - Request issue');
      }
      
      const errorMessage = errorDetails.data?.message || 'Failed to generate AI review';
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

export const analyzeReviewSentiment = async (comment: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyPoints: string[];
  suggestions: string[];
}> => {
  try {
    const response = await api.post('/reviews/ai-analyze', {
      action: 'analyze',
      comment
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error analyzing review sentiment:', error);
    throw new Error('Failed to analyze review sentiment');
  }
};

export const enhanceReviewWithAI = async (comment: string, rating: number, eventContext?: any): Promise<{
  enhancedComment: string;
  improvements: string[];
  tone: 'professional' | 'casual' | 'enthusiastic';
  suggestions: string[];
}> => {
  try {
    const response = await api.post('/reviews/ai-enhance', { 
      action: 'enhance',
      comment, 
      rating, 
      eventContext 
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error enhancing review with AI:', error);
    throw new Error('Failed to enhance review');
  }
};
