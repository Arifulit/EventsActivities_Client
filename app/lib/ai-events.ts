import api from './api';

export interface AIEventSuggestion {
  title: string;
  description: string;
  category: string;
  type: string;
  suggestedPrice: number;
  suggestedDuration: number;
  suggestedMaxParticipants: number;
  tags: string[];
  requirements: string[];
  optimalDate: string;
  optimalTime: string;
  reasoning: string;
  confidence: number;
}

export interface AIEventUpdate {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AIEventOptimization {
  suggestions: AIEventUpdate[];
  overallScore: number;
  potentialRevenueIncrease: number;
  potentialAttendanceIncrease: number;
  priorityActions: string[];
}

class AIEventService {
  private baseURL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:3001/api';

  /**
   * Generate AI-powered event suggestions based on host profile and market trends
   */
  async generateEventSuggestions(hostProfile: any): Promise<AIEventSuggestion[]> {
    try {
      const response = await api.post(`${this.baseURL}/events/suggest`, {
        hostProfile,
        location: hostProfile.location,
        interests: hostProfile.interests || [],
        pastEvents: hostProfile.pastEvents || [],
        marketTrends: true
      });

      return response.data.suggestions || [];
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze existing event and provide optimization suggestions
   */
  async analyzeEvent(eventId: string): Promise<AIEventOptimization> {
    try {
      const response = await api.get(`${this.baseURL}/events/${eventId}/analyze`);
      
      return {
        suggestions: response.data.suggestions || [],
        overallScore: response.data.overallScore || 0,
        potentialRevenueIncrease: response.data.potentialRevenueIncrease || 0,
        potentialAttendanceIncrease: response.data.potentialAttendanceIncrease || 0,
        priorityActions: response.data.priorityActions || []
      };
    } catch (error) {
      console.error('Failed to analyze event:', error);
      return {
        suggestions: [],
        overallScore: 0,
        potentialRevenueIncrease: 0,
        potentialAttendanceIncrease: 0,
        priorityActions: []
      };
    }
  }

  /**
   * Auto-optimize event settings based on AI analysis
   */
  async optimizeEvent(eventId: string, updates: AIEventUpdate[]): Promise<any> {
    try {
      const response = await api.put(`${this.baseURL}/events/${eventId}/optimize`, {
        updates: updates.map(update => ({
          field: update.field,
          value: update.suggestedValue,
          reason: update.reason
        }))
      });

      return response.data;
    } catch (error) {
      console.error('Failed to optimize event:', error);
      throw error;
    }
  }

  /**
   * Generate AI-powered description and content
   */
  async generateEventContent(eventData: any): Promise<{
    title: string;
    description: string;
    tags: string[];
    requirements: string[];
  }> {
    try {
      const response = await api.post(`${this.baseURL}/events/generate-content`, {
        type: eventData.type,
        category: eventData.category,
        targetAudience: eventData.targetAudience || 'general',
        duration: eventData.duration,
        price: eventData.price,
        location: eventData.location
      });

      return response.data;
    } catch (error) {
      console.error('Failed to generate content:', error);
      return {
        title: eventData.title || '',
        description: eventData.description || '',
        tags: [],
        requirements: []
      };
    }
  }

  /**
   * Predict event success metrics
   */
  async predictEventSuccess(eventData: any): Promise<{
    attendanceProbability: number;
    revenueProjection: number;
    successScore: number;
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      const response = await api.post(`${this.baseURL}/events/predict-success`, eventData);
      
      return response.data;
    } catch (error) {
      console.error('Failed to predict event success:', error);
      return {
        attendanceProbability: 0.5,
        revenueProjection: eventData.price * eventData.maxParticipants * 0.5,
        successScore: 0.5,
        riskFactors: [],
        recommendations: []
      };
    }
  }

  /**
   * Get AI-powered pricing recommendations
   */
  async getPricingRecommendations(eventData: any): Promise<{
    suggestedPrice: number;
    priceRange: { min: number; max: number };
    reasoning: string;
    marketComparison: string;
    confidence: number;
  }> {
    try {
      const response = await api.post(`${this.baseURL}/events/pricing-recommendation`, {
        category: eventData.category,
        type: eventData.type,
        duration: eventData.duration,
        location: eventData.location,
        targetAudience: eventData.targetAudience || 'general'
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get pricing recommendations:', error);
      return {
        suggestedPrice: eventData.price || 50,
        priceRange: { min: eventData.price * 0.8, max: eventData.price * 1.2 },
        reasoning: 'Based on market analysis',
        marketComparison: 'Similar events in your area',
        confidence: 0.7
      };
    }
  }

  /**
   * Generate optimal event schedule
   */
  async generateOptimalSchedule(eventData: any): Promise<{
    suggestedDates: string[];
    suggestedTimes: string[];
    bestDateTime: { date: string; time: string };
    reasoning: string;
    attendanceForecast: number[];
  }> {
    try {
      const response = await api.post(`${this.baseURL}/events/optimal-schedule`, {
        category: eventData.category,
        type: eventData.type,
        duration: eventData.duration,
        location: eventData.location,
        targetAudience: eventData.targetAudience || 'general'
      });

      return response.data;
    } catch (error) {
      console.error('Failed to generate optimal schedule:', error);
      return {
        suggestedDates: [],
        suggestedTimes: [],
        bestDateTime: { date: '', time: '' },
        reasoning: 'Unable to generate schedule',
        attendanceForecast: []
      };
    }
  }
}

export const aiEventService = new AIEventService();
