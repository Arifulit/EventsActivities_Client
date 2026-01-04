'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import api from '@/app/lib/api';
// import AdminSidebar from '../components/AdminSidebar';
import { toast } from 'react-hot-toast';
import { getReviews, deleteReview, Review } from '@/app/lib/adminActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Button } from '@/app/components/ui/button';
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
  AlertTriangle
} from 'lucide-react';

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await getReviews(page, 10);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId: string, action: string) => {
    try {
      switch (action) {
        case 'delete':
          await deleteReview(reviewId);
          setReviews(reviews.filter(r => r._id !== reviewId));
          toast.success('Review deleted successfully');
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error) {
      console.error(`Error performing ${action} on review ${reviewId}:`, error);
      toast.error(`Failed to perform action: ${action}`);
    }
  };

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
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Review Management</h1>
                <p className="text-sm sm:text-base text-gray-600">Moderate and manage user reviews</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Reviews</CardTitle>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{pagination.total}</div>
                    <p className="text-xs text-gray-500 mt-1">All reviews</p>
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
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {reviews.length > 0 
                        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                        : '0'
                      }
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Average score</p>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews Table */}
              <Card className="bg-white shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-semibold text-gray-900">Reviews ({reviews.length})</span>
                      <div className="text-sm font-normal text-gray-600 mt-1">
                        Manage user reviews and content
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="text-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading reviews...</p>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
                      <p className="text-gray-600">No reviews have been submitted yet</p>
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
                          {reviews.map((review) => (
                            <TableRow key={review._id} className="hover:bg-gray-50 transition-colors border-b">
                              <TableCell className="py-4 px-6">
                                <div className="max-w-xs">
                                  <p className="text-sm text-gray-900 line-clamp-2">{review.comment}</p>
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
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48 border shadow-lg z-50">
                                    <DropdownMenuItem className="hover:bg-gray-50 cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                      <span>View Details</span>
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
