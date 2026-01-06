'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import api from '@/app/lib/api';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  User,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';

interface BookingUser {
  _id: string;
  fullName: string;
  email: string;
  profileImage: string;
}

interface BookingEvent {
  _id: string;
  title: string;
  category: string;
  date: string;
  price: number;
}

interface Booking {
  _id: string;
  userId: BookingUser;
  eventId: BookingEvent;
  hostId: string;
  status: string;
  paymentStatus: string;
  amount: number;
  quantity: number;
  currency: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingStats {
  _id: string;
  count: number;
  totalAmount: number;
}

interface BookingsResponse {
  bookings: Booking[];
  stats: BookingStats[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function AdminBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
      return;
    }

    fetchBookings();
  }, [user, currentPage, searchTerm, statusFilter, paymentFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentFilter !== 'all' && { paymentStatus: paymentFilter })
      });
      
      const response = await api.get(`/admin/bookings?${params}`);
      const data: BookingsResponse = response.data.data;
      setBookings(data.bookings || []);
      setStats(data.stats || []);
      setTotalBookings(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied: You do not have permission to manage bookings');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required: Please log in again');
      } else {
        toast.error('Failed to load bookings: Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (action: string, bookingId: string) => {
    try {
      switch (action) {
        case 'view':
          router.push(`/dashboard/admin/bookings/${bookingId}`);
          break;
        case 'confirm':
          await api.put(`/admin/bookings/${bookingId}/confirm`);
          toast.success('Booking confirmed successfully');
          fetchBookings();
          break;
        case 'cancel':
          if (confirm('Are you sure you want to cancel this booking?')) {
            await api.put(`/admin/bookings/${bookingId}/cancel`);
            toast.success('Booking cancelled successfully');
            fetchBookings();
          }
          break;
        case 'refund':
          if (confirm('Are you sure you want to refund this booking?')) {
            await api.post(`/admin/bookings/${bookingId}/refund`);
            toast.success('Refund processed successfully');
            fetchBookings();
          }
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    } catch (error: any) {
      console.error(`Error performing ${action}:`, error);
      toast.error(error.response?.data?.message || `Failed to perform action: ${action}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technology':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'food':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'workshop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy \'at\' h:mm a');
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatsByStatus = (status: string) => {
    const stat = stats.find(s => s._id === status);
    return stat || { count: 0, totalAmount: 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 h-12 w-12 animate-ping bg-blue-100 rounded-full mx-auto"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading bookings...</div>
          <div className="text-sm text-gray-500 mt-1">Please wait while we fetch booking data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-gray-100">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Admin
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                      <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                      Bookings Management
                    </h1>
                    <p className="text-gray-600">Manage and monitor all platform bookings</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    {totalBookings} Total Bookings
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{getStatsByStatus('pending').count}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatPrice(getStatsByStatus('pending').totalAmount, 'USD')}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">{getStatsByStatus('confirmed').count}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatPrice(getStatsByStatus('confirmed').totalAmount, 'USD')}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cancelled</p>
                      <p className="text-2xl font-bold text-red-600">{getStatsByStatus('cancelled').count}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatPrice(getStatsByStatus('cancelled').totalAmount, 'USD')}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(stats.reduce((sum, stat) => sum + stat.totalAmount, 0), 'USD')}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">All bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Payment</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                  <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-500 text-lg font-medium">No bookings found</div>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking._id} className="bg-white shadow-sm border hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <Avatar className="h-12 w-12">
                                {booking.userId.profileImage ? (
                                  <AvatarImage src={booking.userId.profileImage} alt={booking.userId.fullName} />
                                ) : (
                                  <AvatarFallback className="text-sm">
                                    {booking.userId.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{booking.eventId.title}</h3>
                                <Badge className={`border ${getCategoryColor(booking.eventId.category)}`}>
                                  {booking.eventId.category}
                                </Badge>
                                <Badge className={`border ${getStatusColor(booking.status)}`}>
                                  {booking.status}
                                </Badge>
                                <Badge className={`border ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                  {booking.paymentStatus}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />
                                  {booking.userId.fullName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {formatDate(booking.eventId.date)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {formatDateTime(booking.bookingDate)}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  {formatPrice(booking.amount, booking.currency)}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {booking.quantity} tickets
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Event ID: {booking.eventId._id.slice(-8)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBookingAction('view', booking._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleBookingAction('view', booking._id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {booking.status === 'pending' && (
                                <DropdownMenuItem onClick={() => handleBookingAction('confirm', booking._id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Confirm Booking
                                </DropdownMenuItem>
                              )}
                              {booking.status === 'confirmed' && (
                                <DropdownMenuItem onClick={() => handleBookingAction('cancel', booking._id)}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel Booking
                                </DropdownMenuItem>
                              )}
                              {booking.paymentStatus === 'paid' && (
                                <DropdownMenuItem onClick={() => handleBookingAction('refund', booking._id)}>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Process Refund
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, totalBookings)} of {totalBookings} bookings
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="px-3 py-1 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
