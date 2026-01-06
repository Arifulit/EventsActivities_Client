'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Star, ArrowLeft, MessageSquare, ThumbsUp, ThumbsDown, User, Loader2, Edit, Trash2, MoreVertical } from 'lucide-react';
import { getEventById, Event } from '@/app/lib/events';
import { getEventReviews, getEventReviewStats, createReview, updateReview, deleteReview, Review, ReviewStats } from '@/app/lib/reviews';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';

export default function EventReviewsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchEventAndReviews();
  }, [eventId, user]);

  const fetchEventAndReviews = async () => {
    try {
      setIsLoading(true);
      
      // Fetch event details
      const eventData = await getEventById(eventId);
      setEvent(eventData);
      
      // Fetch reviews
      const reviewsResponse = await getEventReviews(eventId);
      setReviews(reviewsResponse.data);
      
      // Fetch review stats
      const reviewStats = await getEventReviewStats(eventId);
      setStats(reviewStats);
      
      // Check if current user has already reviewed
      if (user) {
        const existingReview = reviewsResponse.data.find(r => r.userId._id === user._id);
        setUserReview(existingReview || null);
      }
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
      toast.error(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast.error('Review must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        eventId,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
      };

      const response = await createReview(reviewData);
      
      toast.success('Review submitted successfully!');
      setReviews([response.data, ...reviews]);
      setUserReview(response.data);
      setNewReview({ rating: 5, comment: '' });
      
      // Refresh stats
      const reviewStats = await getEventReviewStats(eventId);
      setStats(reviewStats);
    } catch (error: any) {
      console.error('Failed to submit review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
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
      
      // Update userReview if it's the one being edited
      if (userReview && userReview._id === reviewId) {
        setUserReview({ ...userReview, rating: editForm.rating, comment: editForm.comment });
      }
      
      toast.success('Review updated successfully!');
      handleCancelEdit();
      
      // Refresh stats
      const reviewStats = await getEventReviewStats(eventId);
      setStats(reviewStats);
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
      
      // Clear userReview if it's the one being deleted
      if (userReview && userReview._id === reviewId) {
        setUserReview(null);
      }
      
      toast.success('Review deleted successfully!');
      
      // Refresh stats
      const reviewStats = await getEventReviewStats(eventId);
      setStats(reviewStats);
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
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

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <div className="text-lg">Loading reviews...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Event not found</div>
      </div>
    );
  }

  const averageRating = stats?.averageRating || 0;
  const totalReviews = stats?.totalReviews || 0;
  const ratingDistribution = stats?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {event.title} - Reviews
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Review Form */}
            {user && !userReview && (
              <Card>
                <CardHeader>
                  <CardTitle>Write a Review</CardTitle>
                  <CardDescription>Share your experience with this event</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </Label>
                      {renderStars(newReview.rating, true, (rating) => 
                        setNewReview({ ...newReview, rating })
                      )}
                    </div>

                    <div>
                      <Label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </Label>
                      <Textarea
                        id="comment"
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        placeholder="Share your experience with this event..."
                        rows={4}
                        maxLength={500}
                        required
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {newReview.comment.length}/500 characters
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || !newReview.comment.trim() || newReview.comment.trim().length < 10}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Review'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* User's Existing Review */}
            {userReview && !editingReview && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Review</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditReview(userReview)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Review
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteReview(userReview._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        {userReview.userId.profileImage ? (
                          <AvatarImage src={userReview.userId.profileImage} alt={userReview.userId.fullName} />
                        ) : (
                          <AvatarFallback>
                            {userReview.userId.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{userReview.userId.fullName}</h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(userReview.createdAt)}
                        </p>
                      </div>
                    </div>

                    {renderStars(userReview.rating)}

                    <p className="text-gray-700">{userReview.comment}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Review Form */}
            {userReview && editingReview && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Your Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateReview(userReview._id); }} className="space-y-4">
                    <div>
                      <Label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </Label>
                      {renderStars(editForm.rating, true, (rating) => 
                        setEditForm({ ...editForm, rating })
                      )}
                    </div>

                    <div>
                      <Label htmlFor="edit-comment" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </Label>
                      <Textarea
                        id="edit-comment"
                        value={editForm.comment}
                        onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                        placeholder="Share your experience with this event..."
                        rows={4}
                        maxLength={500}
                        required
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {editForm.comment.length}/500 characters
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={!editForm.comment.trim() || editForm.comment.trim().length < 10}
                      >
                        Save Changes
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                All Reviews ({reviews.length})
              </h2>

              {reviews.filter(review => !userReview || review._id !== userReview._id).map((review) => (
                <Card key={review._id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          {review.userId.profileImage ? (
                            <AvatarImage src={review.userId.profileImage} alt={review.userId.fullName} />
                          ) : (
                            <AvatarFallback>
                              {review.userId.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{review.userId.fullName}</h4>
                          <p className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>

                      {renderStars(review.rating)}

                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {reviews.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">
                    Be the first to share your experience with this event!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Rating Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <p className="text-gray-600">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>

                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 w-3">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-medium">{totalReviews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">5-Star Reviews</span>
                  <span className="font-medium">{ratingDistribution[5]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Positive Reviews</span>
                  <span className="font-medium">
                    {ratingDistribution[5] + ratingDistribution[4]}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
