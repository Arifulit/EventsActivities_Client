'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { ArrowLeft, Star, Award, MessageSquare, Loader2, Calendar, MapPin } from 'lucide-react';
import { getHostReviews, getHostReviewStats, HostReview, HostReviewStats } from '@/app/lib/reviews';
import { format, parseISO } from 'date-fns';
import Link from 'next/link';

export default function HostReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const hostId = params.id as string;

  const [reviews, setReviews] = useState<HostReview[]>([]);
  const [stats, setStats] = useState<HostReviewStats | null>(null);
  const [hostName, setHostName] = useState<string>('Host');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (hostId) {
      fetchReviews();
      fetchStats();
    }
  }, [hostId]);

  const fetchReviews = async (page: number = 1) => {
    try {
      setIsLoading(page === 1);
      const response = await getHostReviews(hostId, page);
      
      if (page === 1) {
        setReviews(response.data);
        // Extract host name from first review if available
        if (response.data.length > 0) {
          const firstReview = response.data[0];
          // You might want to fetch host details separately for the name
          setHostName('Event Host'); // Placeholder - you can fetch actual host name
        }
      } else {
        setReviews(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.pagination.hasNextPage);
      setCurrentPage(page);
    } catch (error: any) {
      console.error('Failed to fetch host reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const reviewStats = await getHostReviewStats(hostId);
      setStats(reviewStats);
    } catch (error: any) {
      console.error('Failed to fetch host review stats:', error);
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
    if (!isLoading && hasMore) {
      fetchReviews(currentPage + 1);
    }
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <div className="text-lg">Loading host reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                H
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {hostName} - Reviews
              </h1>
              {stats && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {renderStars(Math.round(stats.averageRating), 'md')}
                    <span className="ml-2 text-lg font-semibold">
                      {stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Reviews List */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    All Reviews ({reviews.length})
                  </h2>
                  
                  {reviews.map((review) => (
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
                          
                          {/* Event Reference */}
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Reviewed event: </span>
                              <Link href={`/events/${review.eventId._id}`}>
                                <Button variant="outline" size="sm" className="h-auto px-2 py-1 text-xs">
                                  {review.eventId.title}
                                </Button>
                              </Link>
                              <span className="text-gray-500">
                                ({formatEventDate(review.eventId.date)})
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={loadMoreReviews}
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600">
                    This host hasn't received any reviews yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Rating Summary */}
          <div className="space-y-6">
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Rating Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stats.averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {renderStars(Math.round(stats.averageRating))}
                    </div>
                    <p className="text-gray-600">
                      Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                      const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                      
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
            )}

            {/* Quick Stats */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-medium">{stats.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-medium">{stats.averageRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">5-Star Reviews</span>
                    <span className="font-medium">{stats.ratingDistribution[5]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Positive Reviews</span>
                    <span className="font-medium">
                      {stats.ratingDistribution[5] + stats.ratingDistribution[4]}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
