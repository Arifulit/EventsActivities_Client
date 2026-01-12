// AI Service for Review Enhancement

export interface ReviewGenerationParams {
  rating: number;
  eventTitle: string;
  category: string;
  userComment?: string;
  location?: string;
  date?: string;
}

export interface ReviewEnhancementParams {
  originalComment: string;
  rating: number;
  eventTitle: string;
  category: string;
}

export async function generateAIReviewContent(params: ReviewGenerationParams): Promise<string> {
  const { rating, eventTitle, category, userComment, location, date } = params;
  
  // Simulate AI generation with templates based on rating
  const templates = {
    5: [
      `Absolutely amazing ${category.toLowerCase()}! ${eventTitle} exceeded all my expectations. The organization was flawless, the atmosphere was incredible, and I could not have asked for a better experience. ${location ? `The venue at ${location} was perfect.` : ""} Highly recommend to everyone!`,
      `Outstanding experience at ${eventTitle}! Everything from start to finish was professionally handled. The ${category.toLowerCase()} was engaging, well-structured, and delivered real value. ${userComment ? `I especially loved ${userComment.toLowerCase()}.` : ""} Will definitely attend future events!`,
      `Five stars do not do this justice! ${eventTitle} was an exceptional ${category.toLowerCase()} that created lasting memories. The attention to detail, quality of content, and overall experience were superb. ${location ? `Great choice of venue at ${location}.` : ""} Do not miss out on this!`
    ],
    4: [
      `Really enjoyed ${eventTitle}! It was a well-organized ${category.toLowerCase()} with great content and good energy. ${userComment ? `I particularly appreciated ${userComment.toLowerCase()}.` : ""} ${location ? `The location at ${location} worked well.` : ""} Would recommend with minor improvements possible.`,
      `Good experience at ${eventTitle}. The ${category.toLowerCase()} was solid and delivered on its promises. ${userComment ? `Found ${userComment.toLowerCase()} particularly helpful.` : ""} ${location ? `Venue at ${location} was appropriate.` : ""} Room for small improvements but overall worthwhile.`,
      `Solid ${category.toLowerCase()} experience at ${eventTitle}. Well planned and executed with good content. ${userComment ? `The ${userComment.toLowerCase()} was a highlight.` : ""} ${location ? `${location} was a decent venue choice.` : ""} Would attend again and recommend to others.`
    ],
    3: [
      `${eventTitle} was an average ${category.toLowerCase()} experience. Some parts were good while others needed improvement. ${userComment ? `Noticed ${userComment.toLowerCase()} during the event.` : ""} ${location ? `The venue at ${location} was okay.` : ""} Has potential but needs refinement.`,
      `Mixed feelings about ${eventTitle}. The ${category.toLowerCase()} had its moments but also some shortcomings. ${userComment ? `The ${userComment.toLowerCase()} aspect could be better.` : ""} ${location ? `Location at ${location} was functional.` : ""} With some improvements, could be much better.`,
      `Decent ${category.toLowerCase()} but nothing exceptional. ${eventTitle} delivered basic expectations. ${userComment ? `${userComment.charAt(0).toUpperCase() + userComment.slice(1)} was just okay.` : ""} ${location ? `The ${location} venue was adequate.` : ""} Potential for improvement exists.`
    ],
    2: [
      `Disappointed with ${eventTitle}. The ${category.toLowerCase()} did not meet expectations. ${userComment ? `Issues with ${userComment.toLowerCase()} were problematic.` : ""} ${location ? `The venue at ${location} was not ideal.` : ""} Significant improvements needed.`,
      `Below average experience at ${eventTitle}. The ${category.toLowerCase()} lacked organization and quality. ${userComment ? `The ${userComment.toLowerCase()} aspect was particularly poor.` : ""} ${location ? `Location at ${location} had issues.` : ""} Would not recommend in current state.`,
      `Unfortunately, ${eventTitle} fell short. The ${category.toLowerCase()} was poorly executed. ${userComment ? `Problems with ${userComment.toLowerCase()} affected the experience.` : ""} ${location ? `The venue at ${location} was not suitable.` : ""} Major improvements required.`
    ],
    1: [
      `Terrible experience at ${eventTitle}. The ${category.toLowerCase()} was a complete disappointment. ${userComment ? `The ${userComment.toLowerCase()} was unacceptable.` : ""} ${location ? `The venue at ${location} was problematic.` : ""} Would not recommend under any circumstances.`,
      `Avoid ${eventTitle} at all costs. The ${category.toLowerCase()} was poorly organized and executed. ${userComment ? `The ${userComment.toLowerCase()} aspect was a disaster.` : ""} ${location ? `The ${location} location was terrible.` : ""} Complete waste of time and money.`,
      `Worst ${category.toLowerCase()} experience ever at ${eventTitle}. Nothing went right from start to finish. ${userComment ? `The ${userComment.toLowerCase()} was a nightmare.` : ""} ${location ? `The venue at ${location} was completely inadequate.` : ""} Strongly advise against attending.`
    ]
  };

  const ratingTemplates = templates[rating as keyof typeof templates] || templates[3];
  const randomIndex = Math.floor(Math.random() * ratingTemplates.length);
  
  return ratingTemplates[randomIndex];
}

export async function analyzeReviewSentiment(comment: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  keyPoints: string[];
  suggestions: string[];
}> {
  // Simple sentiment analysis based on keywords
  const positiveWords = ['amazing', 'excellent', 'great', 'good', 'love', 'enjoyed', 'fantastic', 'outstanding', 'perfect', 'wonderful'];
  const negativeWords = ['terrible', 'awful', 'bad', 'disappointed', 'poor', 'worst', 'hate', 'dislike', 'horrible', 'unacceptable'];
  
  const words = comment.toLowerCase().split(' ');
  const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
  const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
  
  let sentiment: 'positive' | 'neutral' | 'negative';
  let confidence: number;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence = Math.min(0.9, 0.5 + (positiveCount - negativeCount) * 0.1);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence = Math.min(0.9, 0.5 + (negativeCount - positiveCount) * 0.1);
  } else {
    sentiment = 'neutral';
    confidence = 0.5;
  }

  const keyPoints = extractKeyPointsFromComment(comment);
  const suggestions = generateSuggestionsFromSentiment(sentiment, comment);

  return { sentiment, confidence, keyPoints, suggestions };
}

export async function enhanceReviewContent(params: ReviewEnhancementParams): Promise<{
  enhancedComment: string;
  improvements: string[];
  tone: 'professional' | 'casual' | 'enthusiastic';
  suggestions: string[];
}> {
  const { originalComment, rating, eventTitle, category } = params;
  
  // Determine tone based on rating
  let tone: 'professional' | 'casual' | 'enthusiastic';
  if (rating >= 4) {
    tone = 'enthusiastic';
  } else if (rating === 3) {
    tone = 'professional';
  } else {
    tone = 'professional';
  }

  // Enhance the comment
  let enhancedComment = originalComment;
  
  // Add more descriptive language
  if (rating >= 4 && !originalComment.includes('excellent') && !originalComment.includes('amazing')) {
    enhancedComment = enhancedComment.replace(/good/gi, 'excellent').replace(/nice/gi, 'wonderful');
  }
  
  // Add context about the event
  if (!originalComment.toLowerCase().includes(eventTitle.toLowerCase())) {
    enhancedComment = `${eventTitle} was ${enhancedComment}`;
  }
  
  // Add category context
  if (!originalComment.toLowerCase().includes(category.toLowerCase())) {
    enhancedComment = enhancedComment + ` This ${category.toLowerCase()} was well-organized and delivered real value.`;
  }

  const improvements = generateImprovements(originalComment, rating);
  const suggestions = generateSuggestionsFromSentiment(tone === 'enthusiastic' ? 'positive' : 'neutral', originalComment);

  return { enhancedComment, improvements, tone, suggestions };
}

// Helper functions
function extractKeyPointsFromComment(comment: string): string[] {
  const keyPoints: string[] = [];
  
  if (comment.length > 100) keyPoints.push('Detailed feedback provided');
  if (comment.includes('recommend')) keyPoints.push('Recommends to others');
  if (comment.includes('organiz')) keyPoints.push('Comments on organization');
  if (comment.includes('venue') || comment.includes('location')) keyPoints.push('Mentions venue/location');
  if (comment.includes('time') || comment.includes('schedule')) keyPoints.push('Comments on timing');
  
  return keyPoints;
}

function generateSuggestionsFromSentiment(sentiment: string, comment: string): string[] {
  const suggestions = {
    positive: [
      'Consider adding specific examples of what you enjoyed',
      'Mention the organizers or speakers by name if possible',
      'Share photos or moments from the event'
    ],
    neutral: [
      'Provide more specific details about your experience',
      'Mention both positives and areas for improvement',
      'Be more constructive in your feedback'
    ],
    negative: [
      'Be specific about issues encountered',
      'Provide constructive suggestions for improvement',
      'Focus on facts rather than emotions'
    ]
  };

  return suggestions[sentiment as keyof typeof suggestions] || suggestions.neutral;
}

function generateImprovements(originalComment: string, rating: number): string[] {
  const improvements: string[] = [];
  
  if (originalComment.length < 50) {
    improvements.push('Add more detail to your review');
  }
  
  if (!originalComment.includes('because') && !originalComment.includes('since')) {
    improvements.push('Explain the reasons behind your rating');
  }
  
  if (rating >= 4 && !originalComment.includes('recommend')) {
    improvements.push('Consider recommending to others');
  }
  
  if (rating <= 2 && !originalComment.includes('improve')) {
    improvements.push('Suggest specific improvements');
  }

  return improvements;
}
