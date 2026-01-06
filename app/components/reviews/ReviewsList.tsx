'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { getEventReviews, getEventReviewStats, Review, ReviewStats, GetReviewsResponse, updateReview, deleteReview } from '@/app/lib/reviews';
import { format, parseISO } from 'date-fns';
import { Star, MessageSquare, ThumbsUp, Loader2, User, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'react-hot-toast';

interface ReviewsListProps {
  eventId: string;
  eventTitle: string;
  showWriteReview?: boolean;
  onWriteReview?: () => void;
}

export default function ReviewsList({ eventId, eventTitle, showWriteReview = false, onWriteReview }: ReviewsListProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [eventId]);

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(page === 1);
      const response: GetReviewsResponse = await getEventReviews(eventId, page);
      
      if (page === 1) {
        setReviews(response.data);
      } else {
        setReviews(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const reviewStats = await getEventReviewStats(eventId);
      setStats(reviewStats);
    } catch (err: any) {
      console.error('Error fetching review stats:', err);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const starSizes = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSizes[size]} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const loadMoreReviews = () => {
    if (!loading && hasMore) {
      fetchReviews(currentPage + 1);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review._id);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const handleUpdateReview = async (reviewId: string) => {
    try {
      const response = await updateReview(reviewId, editForm);
      
      // Update the review in the local state
      setReviews(prev => prev.map(review => 
        review._id === reviewId 
          ? { ...review, rating: editForm.rating, comment: editForm.comment }
          : review
      ));
      
      toast.success('Review updated successfully!');
      handleCancelEdit();
      
      // Refresh stats
      fetchStats();
    } catch (error: any) {
      console.error('Failed to update review:', error);
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      await deleteReview(reviewId);
      
      // Remove the review from local state
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      
      toast.success('Review deleted successfully!');
      
      // Refresh stats
      fetchStats();
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load reviews</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => fetchReviews()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Reviews & Ratings
            </CardTitle>
            <CardDescription>
              What people are saying about {eventTitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Average Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(Math.round(stats.averageRating), 'lg')}
                <p className="text-gray-600 mt-2">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {showWriteReview && onWriteReview && (
              <div className="mt-6 pt-6 border-t">
                <Button onClick={onWriteReview} className="w-full">
                  <Star className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
          
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                {editingReview === review._id ? (
                  // Edit Form
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, rating: star })}
                            className="cursor-pointer hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= editForm.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        value={editForm.comment}
                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        maxLength={500}
                        placeholder="Share your experience with this event..."
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {editForm.comment.length}/500 characters
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateReview(review._id)}
                        disabled={!editForm.comment.trim() || editForm.comment.trim().length < 10}
                      >
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Normal Review Display
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      {review.userId.profileImage ? (
                        <AvatarImage src={review.userId.profileImage} alt={review.userId.fullName} />
                      ) : (
                        <AvatarFallback>
                          {review.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.userId.fullName}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Edit/Delete Menu */}
                        {user && user._id === review.userId._id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditReview(review)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Review
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Review
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {review.comment}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-4">
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={loadMoreReviews}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More Reviews'
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience at {eventTitle}
            </p>
            {showWriteReview && onWriteReview && (
              <Button onClick={onWriteReview}>
                <Star className="w-4 h-4 mr-2" />
                Write First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
