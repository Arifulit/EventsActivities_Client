'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Star, Sparkles, Loader2, Lightbulb, ThumbsUp, MessageSquare, Wand2, RefreshCw } from 'lucide-react';
import { generateAIReview, enhanceReviewWithAI, analyzeReviewSentiment } from '@/app/lib/ai-reviews';
import { Event } from '@/app/lib/events';
import { toast } from 'react-hot-toast';

interface AIReviewFormProps {
  event: Event;
  onSubmit: (reviewData: { rating: number; comment: string }) => void;
  isSubmitting?: boolean;
  initialRating?: number;
  initialComment?: string;
}

export default function AIReviewForm({ 
  event, 
  onSubmit, 
  isSubmitting = false,
  initialRating = 5,
  initialComment = ''
}: AIReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [enhancedComment, setEnhancedComment] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'neutral' | 'negative'>('neutral');
  const [showAIHelper, setShowAIHelper] = useState(false);

  const renderStars = (interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-6 h-6 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const generateAIReview = async () => {
    if (!event) return;

    setIsGeneratingAI(true);
    try {
      const response = await generateAIReview({
        eventId: event._id,
        rating,
        userComment: comment,
        eventDetails: {
          title: event.title,
          category: event.category,
          description: event.description,
          location: event.location.venue,
          date: event.date
        }
      });

      setAiSuggestions(response.suggestions);
      setEnhancedComment(response.enhancedComment);
      setSentiment(response.sentiment);
      setShowAIHelper(true);
      
      toast.success('AI review generated successfully!');
    } catch (error: any) {
      console.error('Error generating AI review:', error);
      toast.error(error.message || 'Failed to generate AI review');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const enhanceCurrentReview = async () => {
    if (!comment.trim()) {
      toast.error('Please write a comment first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await enhanceReviewWithAI(comment, rating, {
        title: event.title,
        category: event.category
      });

      setEnhancedComment(response.enhancedComment);
      setAiSuggestions(response.improvements);
      setShowAIHelper(true);
      
      toast.success('Review enhanced with AI!');
    } catch (error: any) {
      console.error('Error enhancing review:', error);
      toast.error(error.message || 'Failed to enhance review');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const analyzeSentiment = async () => {
    if (!comment.trim()) {
      toast.error('Please write a comment first');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await analyzeReviewSentiment(comment);
      setSentiment(response.sentiment);
      setAiSuggestions(response.suggestions);
      setShowAIHelper(true);
      
      toast.success('Sentiment analysis complete!');
    } catch (error: any) {
      console.error('Error analyzing sentiment:', error);
      toast.error(error.message || 'Failed to analyze sentiment');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const applyEnhancedComment = () => {
    setComment(enhancedComment);
    setShowAIHelper(false);
    toast.success('Enhanced comment applied!');
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI-Enhanced Review
          </CardTitle>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAIHelper(!showAIHelper)}
              className="border-purple-200 hover:bg-purple-50"
            >
              <Wand2 className="w-4 h-4 mr-1" />
              AI Helper
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Your Rating
            </Label>
            {renderStars(true)}
            <div className="mt-2 flex items-center gap-2">
              {showAIHelper && (
                <Badge className={getSentimentColor(sentiment)}>
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} sentiment
                </Badge>
              )}
            </div>
          </div>

          {/* Comment Section */}
          <div>
            <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this event..."
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {comment.length}/500 characters
              </span>
              {comment.trim().length > 0 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={analyzeSentiment}
                    disabled={isGeneratingAI}
                    className="text-xs"
                  >
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Analyze
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={enhanceCurrentReview}
                    disabled={isGeneratingAI}
                    className="text-xs"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Enhance
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* AI Helper Section */}
          {showAIHelper && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-purple-900 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  AI Suggestions
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateAIReview}
                  disabled={isGeneratingAI}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {/* Enhanced Comment */}
              {enhancedComment && enhancedComment !== comment && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium text-purple-900">
                      Enhanced Version
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applyEnhancedComment}
                      className="text-xs border-purple-200 hover:bg-purple-100"
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                  <div className="bg-white p-3 rounded border border-purple-200 text-sm">
                    {enhancedComment}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-purple-900 mb-2 block">
                    Suggestions
                  </Label>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-purple-700">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate AI Review Button */}
              {!enhancedComment && aiSuggestions.length === 0 && (
                <div className="text-center py-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateAIReview}
                    disabled={isGeneratingAI}
                    className="border-purple-200 hover:bg-purple-100"
                  >
                    {isGeneratingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI Review
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !comment.trim() || comment.trim().length < 10}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Submit AI-Enhanced Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
