'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/app/components/ui/dropdown-menu';
import {
  Star,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Calendar,
  User,
  Crown,
  CalendarDays,
  Eye,
  AlertTriangle,
  Flag,
  CheckCircle,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Download
} from 'lucide-react';

interface UserInfo {
  _id: string;
  email: string;
}

interface EventInfo {
  _id: string;
  title: string;
}

interface Review {
  _id: string;
  userId: UserInfo;
  hostId: UserInfo;
  eventId: EventInfo;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    pages: 0
  });

  const fetchReviews = async (page: number = 1, showRefreshLoading = false) => {
    try {
      if (showRefreshLoading) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(ratingFilter !== 'all' && { rating: ratingFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      
      const response = await api.get(`/admin/reviews?${params}`);
      const data = response.data?.data as ReviewsResponse;
      setReviews(data?.reviews || []);
      setPagination(data?.pagination || pagination);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to manage reviews');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required: Please log in again');
      } else {
        toast.error('Failed to load reviews: Server error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [currentPage, searchTerm, ratingFilter, statusFilter]);

  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      setActionLoading(reviewId);
      
      switch (action) {
        case 'view':
          const review = reviews.find(r => r._id === reviewId);
          if (review) {
            toast.info(`Viewing review for event: ${review.eventId.title}`);
          }
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            const deleteResponse = await api.delete(`/admin/reviews/${reviewId}`);
            if (deleteResponse.data?.success) {
              toast.success('Review deleted successfully');
              setReviews(prev => prev.filter(r => r._id !== reviewId));
            } else {
              toast.error('Failed to delete review');
            }
          }
          break;
        case 'flag':
          const flagResponse = await api.patch(`/admin/reviews/${reviewId}/flag`);
          if (flagResponse.data?.success) {
            toast.success('Review flagged for review');
          } else {
            toast.error('Failed to flag review');
          }
          break;
        case 'approve':
          const approveResponse = await api.patch(`/admin/reviews/${reviewId}/approve`);
          if (approveResponse.data?.success) {
            toast.success('Review approved');
          } else {
            toast.error('Failed to approve review');
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on review ${reviewId}:`, error);
      toast.error(`Failed to perform action: ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  const handleRefresh = () => {
    fetchReviews(currentPage, true);
  };

  const containsFlaggedContent = (comment: string) => {
    const flaggedWords = ['spam', 'fake', 'inappropriate', 'offensive', 'abuse'];
    return flaggedWords.some(word => comment.toLowerCase().includes(word));
  };

  const filteredReviews = useMemo(() => {
    if (!Array.isArray(reviews)) return [];
    
    return reviews.filter((review) => {
      if (!review || !review.comment || !review.eventId?.title) return false;
      
      const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.eventId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.hostId.email.toLowerCase().includes(searchTerm.toLowerCase());
    
      const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, ratingFilter]);

  const getReviewStats = () => {
    if (!Array.isArray(reviews)) return { 
      total: 0, 
      average: 0, 
      fiveStar: 0, 
      oneStar: 0, 
      flagged: 0 
    };
    
    const total = reviews.length;
    const average = total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;
    const fiveStar = reviews.filter(r => r.rating === 5).length;
    const oneStar = reviews.filter(r => r.rating === 1).length;
    const flagged = reviews.filter(r => containsFlaggedContent(r.comment)).length;

    return { total, average, fiveStar, oneStar, flagged };
  };

  const stats = getReviewStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
      
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Reviews & Content Moderation</h1>
                    <p className="text-sm sm:text-base text-gray-600">Moderate and manage user reviews and content</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
                        <p className="text-xs text-gray-500 mt-1">All reviews</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.average.toFixed(1)}</div>
                        <p className="text-xs text-gray-500 mt-1">Out of 5.0</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">5-Star Reviews</CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.fiveStar}</div>
                        <p className="text-xs text-gray-500 mt-1">Excellent</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">1-Star Reviews</CardTitle>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.oneStar}</div>
                        <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Flagged Content</CardTitle>
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Flag className="h-4 w-4 text-orange-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-2xl font-bold animate-pulse text-gray-300">...</div>
                    ) : (
                      <>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.flagged}</div>
                        <p className="text-xs text-gray-500 mt-1">Needs review</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Management */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-semibold text-gray-900">Reviews ({filteredReviews.length})</span>
                      <div className="text-sm font-normal text-gray-600 mt-1">
                        Manage user reviews and content moderation
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Filters */}
                  <div className="p-4 border-b">
                    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <Input
                            placeholder="Search reviews, events, users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 lg:h-11"
                          />
                        </div>
                      </div>
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger className="w-full lg:w-40 h-10 lg:h-11">
                          <SelectValue placeholder="Filter by rating" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">5 Stars</SelectItem>
                          <SelectItem value="4">4 Stars</SelectItem>
                          <SelectItem value="3">3 Stars</SelectItem>
                          <SelectItem value="2">2 Stars</SelectItem>
                          <SelectItem value="1">1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full lg:w-40 h-10 lg:h-11">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="flagged">Flagged</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {loading ? (
                    <div className="text-center py-16">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm lg:text-base">Loading reviews...</p>
                    </div>
                  ) : filteredReviews.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                      <p className="text-gray-600">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-gray-50 border-b">
                          <TableRow>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Review</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">User</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Host</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Event</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Rating</TableHead>
                            <TableHead className="font-semibold text-gray-900 py-4 px-6">Date</TableHead>
                            <TableHead className="font-semibold text-gray-900 text-right py-4 px-6">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredReviews.map((review) => (
                            <TableRow key={review._id} className="hover:bg-gray-50 transition-colors border-b">
                              <TableCell className="py-4 px-6">
                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    {renderStars(review.rating)}
                                    {containsFlaggedContent(review.comment) && (
                                      <Badge variant="destructive" className="text-xs">
                                        <Flag className="h-3 w-3 mr-1" />
                                        Flagged
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700 line-clamp-3">
                                    {review.comment}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="text-sm">{review.userId.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <Crown className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm">{review.hostId.email}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="flex items-center space-x-2">
                                  <CalendarDays className="h-4 w-4 text-green-600" />
                                  <span className="text-sm">{review.eventId.title}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                {renderStars(review.rating)}
                              </TableCell>
                              <TableCell className="py-4 px-6">
                                <div className="text-sm text-gray-600">
                                  {formatDate(review.createdAt)}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-6 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="hover:bg-gray-100 p-2">
                                      {actionLoading === review._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <MoreHorizontal className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 border shadow-lg z-50">
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewAction(review._id, 'view')}
                                      className="hover:bg-gray-50 cursor-pointer"
                                    >
                                      <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                      <span>View Details</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewAction(review._id, 'approve')}
                                      className="hover:bg-gray-50 cursor-pointer"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      <span>Approve Review</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewAction(review._id, 'flag')}
                                      className="hover:bg-gray-50 cursor-pointer"
                                    >
                                      <Flag className="h-4 w-4 mr-2 text-orange-600" />
                                      <span>Flag Content</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => handleReviewAction(review._id, 'delete')} 
                                      className="text-red-600 hover:bg-red-50 cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      <span>Delete Review</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
