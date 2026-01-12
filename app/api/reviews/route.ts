import { NextRequest, NextResponse } from 'next/server';
import { isTokenValid } from '@/app/lib/auth';
import { generateAIReviewContent, analyzeReviewSentiment, enhanceReviewContent } from '@/app/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated using custom auth
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!isTokenValid(token)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'generate':
        return await handleGenerateReview(data);
      case 'analyze':
        return await handleAnalyzeSentiment(data);
      case 'enhance':
        return await handleEnhanceReview(data);
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('AI Review API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleGenerateReview(data: {
  eventId: string;
  rating: number;
  userComment?: string;
  eventDetails?: any;
}) {
  try {
    const { eventId, rating, userComment, eventDetails } = data;

    // Generate AI review based on rating and event details
    const aiContent = await generateAIReviewContent({
      rating,
      eventTitle: eventDetails?.title || 'Event',
      category: eventDetails?.category || 'general',
      userComment: userComment || '',
      location: eventDetails?.location || '',
      date: eventDetails?.date || ''
    });

    // Generate suggestions based on rating
    const suggestions = generateSuggestions(rating, userComment);

    // Analyze sentiment
    const sentiment = analyzeSentimentFromRating(rating, userComment);

    // Extract key points
    const keyPoints = extractKeyPoints(aiContent, rating);

    return NextResponse.json({
      success: true,
      message: 'AI review generated successfully',
      data: {
        enhancedComment: aiContent,
        suggestions,
        sentiment,
        keyPoints
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error generating AI review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate AI review' },
      { status: 500 }
    );
  }
}

async function handleAnalyzeSentiment(data: { comment: string }) {
  try {
    const { comment } = data;
    
    const analysis = await analyzeReviewSentiment(comment);

    return NextResponse.json({
      success: true,
      message: 'Sentiment analysis completed',
      data: analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to analyze sentiment' },
      { status: 500 }
    );
  }
}

async function handleEnhanceReview(data: {
  comment: string;
  rating: number;
  eventContext?: any;
}) {
  try {
    const { comment, rating, eventContext } = data;
    
    const enhanced = await enhanceReviewContent({
      originalComment: comment,
      rating,
      eventTitle: eventContext?.title || 'Event',
      category: eventContext?.category || 'general'
    });

    return NextResponse.json({
      success: true,
      message: 'Review enhanced successfully',
      data: enhanced,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error enhancing review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to enhance review' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateSuggestions(rating: number, userComment?: string): string[] {
  const baseSuggestions = {
    5: [
      'Consider mentioning specific aspects you enjoyed',
      'Highlight what made the experience exceptional',
      'Share details about the atmosphere or organization'
    ],
    4: [
      'Mention what worked well',
      'Share constructive feedback for improvement',
      'Be specific about positive aspects'
    ],
    3: [
      'Provide balanced feedback',
      'Mention both positives and areas for improvement',
      'Be constructive in your criticism'
    ],
    2: [
      'Be specific about issues encountered',
          'Provide constructive feedback',
          'Mention what could be improved'
    ],
    1: [
      'Clearly explain the issues',
      'Provide specific examples',
      'Be constructive despite the low rating'
    ]
  };

  return baseSuggestions[rating as keyof typeof baseSuggestions] || [];
}

function analyzeSentimentFromRating(rating: number, comment?: string): 'positive' | 'neutral' | 'negative' {
  if (rating >= 4) return 'positive';
  if (rating === 3) return 'neutral';
  return 'negative';
}

function extractKeyPoints(content: string, rating: number): string[] {
  const keyPoints = [];
  
  if (rating >= 4) {
    keyPoints.push('Highly recommended');
    keyPoints.push('Excellent experience');
  } else if (rating === 3) {
    keyPoints.push('Average experience');
    keyPoints.push('Room for improvement');
  } else {
    keyPoints.push('Needs improvement');
    keyPoints.push('Issues encountered');
  }

  return keyPoints;
}
