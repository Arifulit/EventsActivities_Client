'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { getHostReviews, getHostReviewStats, HostReview, HostReviewStats, GetHostReviewsResponse } from '@/app/lib/reviews';
import { format, parseISO } from 'date-fns';
import { Star, MessageSquare, Calendar, MapPin, Loader2, Award, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface HostReviewsListProps {
  hostId: string;
  hostName: string;
  showWriteReview?: boolean;
  onWriteReview?: () => void;
}

export default function HostReviewsList({ hostId, hostName, showWriteReview = false, onWriteReview }: HostReviewsListProps) {
  const [reviews, setReviews] = useState<HostReview[]>([]);
  const [stats, setStats] = useState<HostReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [hostId]);

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(page === 1);
      const response: GetHostReviewsResponse = await getHostReviews(hostId, page);
      
      if (page === 1) {
        setReviews(response.data);
      } else {
        setReviews(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Error fetching host reviews:', err);
      setError(err.response?.data?.message || 'Failed to load host reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const reviewStats = await getHostReviewStats(hostId);
      setStats(reviewStats);
    } catch (err: any) {
      console.error('Error fetching host review stats:', err);
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

  const formatEventDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const loadMoreReviews = () => {
    if (!loading && hasMore) {
      fetchReviews(currentPage + 1);
    }
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading host reviews...</p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load host reviews</h3>
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
      {/* Host Rating Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Host Rating
            </CardTitle>
            <CardDescription>
              How attendees rate {hostName}'s events
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
                {stats.averageRating >= 4.5 && (
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Top Rated Host
                    </Badge>
                  </div>
                )}
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
                  Review This Host
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Host Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Host Reviews ({reviews.length})</h3>
          
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
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
                    </div>
                    
                    <p className="text-gray-700 mt-3 leading-relaxed">
                      {review.comment}
                    </p>
                    
                    {/* Event Reference */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Reviewed event: </span>
                        <Link href={`/events/${review.eventId._id}`}>
                          <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">
                            {review.eventId.title}
                          </Badge>
                        </Link>
                        <span className="text-gray-500">
                          ({formatEventDate(review.eventId.date)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
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
              {hostName} hasn't received any reviews yet. Be the first to share your experience!
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
