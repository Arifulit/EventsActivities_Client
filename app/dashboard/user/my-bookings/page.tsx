'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, DollarSign, MapPin, Users, Loader2, CreditCard, Info, Clock, ArrowUpRight, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { getMyBookings, confirmPayment } from '@/app/lib/api';

interface Booking {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
  };
  eventId: {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    date: string;
    time: string;
    duration: number;
    price: number;
    image: string;
    images: string[];
    location: {
      venue: string;
      address: string;
      city: string;
    };
    requirements: string[];
    tags: string[];
    status: string;
    maxParticipants: number;
    currentParticipants: number;
  };
  hostId: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
  quantity: number;
  currency: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string; // Stripe Payment Intent ID
}

interface BookingStats {
  totalBookings: number;
  totalSpent: number;
  eventsAttended: number;
  upcomingEvents: number;
  monthlySpent: number;
}

export default function UserMyBookingsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingsData = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings();
        
        const bookingsData = data.data || [];
        setBookings(bookingsData);
        
        // Calculate stats from booking data
        const totalBookings = bookingsData.length;
        const totalSpent = bookingsData.reduce((sum: number, booking: Booking) => sum + booking.amount, 0);
        const confirmedBookings = bookingsData.filter((b: Booking) => b.status === 'confirmed');
        const eventsAttended = bookingsData.filter((b: Booking) => b.status === 'completed').length;
        const upcomingEvents = confirmedBookings.filter((b: Booking) => new Date(b.eventId.date) > new Date()).length;
        
        // Calculate monthly spent (current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlySpent = bookingsData
          .filter((b: Booking) => {
            const bookingDate = new Date(b.bookingDate);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          })
          .reduce((sum: number, booking: Booking) => sum + booking.amount, 0);
        
        setStats({
          totalBookings,
          totalSpent,
          eventsAttended,
          upcomingEvents,
          monthlySpent
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings');
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingsData();
  }, []);

  const handlePaymentCompletion = async (bookingId: string, paymentIntentId?: string) => {
    try {
      setProcessingPayment(bookingId);
      
      // For testing: use the provided Payment Intent ID if no paymentIntentId in booking
      const testPaymentIntentId = paymentIntentId || 'pi_3SlpnMK0TTEY76871Rit4P49';
      
      console.log('Attempting payment completion with:', {
        bookingId,
        paymentIntentId: testPaymentIntentId
      });
      
      // Use Payment Intent ID if available, otherwise try with just bookingId
      const result = await confirmPayment(bookingId, testPaymentIntentId);
      
      if (result.success) {
        // Refresh bookings to get updated status
        const data = await getMyBookings();
        setBookings(data.data || []);
        alert('Payment completed successfully!');
      } else {
        alert(result.message || 'Payment completion failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment completion error:', error);
      
      // Provide specific guidance based on the error
      if (error.message.includes('Payment incomplete') || error.message.includes('paymentMethodId')) {
        alert('Payment requires additional information. Please complete the payment process using our secure payment form. This feature will be available soon.');
      } else if (error.message.includes('client secret')) {
        alert('Payment requires secure authentication. Please complete the payment on our secure payment page. This feature will be available soon.');
      } else {
        alert(error.message || 'Payment completion failed. Please contact support if the issue persists.');
      }
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    router.push(`/dashboard/user/my-bookings/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No booking data available</p>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h2>
            <p className="text-gray-600 text-lg">Manage your event bookings and payments</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">{stats.totalBookings} Total Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900">Total Bookings</CardTitle>
            <div className="bg-blue-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 mb-1">{stats.totalBookings}</div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>{stats.upcomingEvents} upcoming events</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-900">Total Spent</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900 mb-1">${stats.totalSpent}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="w-3 h-3" />
              <span>This month: ${stats.monthlySpent}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-purple-900">Events Attended</CardTitle>
            <div className="bg-purple-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 mb-1">{stats.eventsAttended}</div>
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <CheckCircle className="w-3 h-3" />
              <span>Great attendance!</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            All Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => {
                const eventDate = new Date(booking.eventId.date);
                const isUpcoming = eventDate > new Date();
                
                return (
                  <div key={booking._id} className={`group border rounded-xl transition-all duration-300 ${!isUpcoming ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:shadow-md hover:border-blue-300'}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 ${isUpcoming ? 'bg-gradient-to-br from-blue-100 to-indigo-100' : 'bg-gray-100'} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <Calendar className={`w-6 h-6 ${isUpcoming ? 'text-blue-600' : 'text-gray-600'}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{booking.eventId.title}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                {eventDate.toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                {booking.eventId.time}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                                {booking.eventId.location.city}, {booking.eventId.location.venue}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2 text-blue-500" />
                                {booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge 
                                variant={booking.status === 'confirmed' ? 'default' : 
                                       booking.status === 'pending' ? 'secondary' : 'destructive'}
                                className="text-xs font-medium"
                              >
                                {booking.status === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {booking.status === 'pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                              <Badge 
                                variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                                className="text-xs font-medium"
                              >
                                {booking.paymentStatus === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                                Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                              </Badge>
                              {isUpcoming && (
                                <Badge variant="outline" className="text-xs font-medium text-blue-600 border-blue-200">
                                  Upcoming
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mb-3">
                            <p className="text-2xl font-bold text-gray-900">${booking.amount}</p>
                            <p className="text-sm text-gray-500">{booking.quantity} ticket{booking.quantity > 1 ? 's' : ''}</p>
                          </div>
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(booking._id)}
                              className="w-full group hover:bg-blue-50 hover:border-blue-300 transition-colors"
                            >
                              <Info className="w-4 h-4 mr-2" />
                              View Details
                              <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Button>
                            {booking.paymentStatus === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handlePaymentCompletion(booking._id, booking.paymentIntentId)}
                                disabled={processingPayment === booking._id}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 w-full transition-all duration-300"
                              >
                                {processingPayment === booking._id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Complete Payment
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          {booking.paymentIntentId && (
                            <p className="text-xs text-gray-400 mt-2">Payment ID: {booking.paymentIntentId}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-4">You haven't booked any events yet</p>
                <Button 
                  onClick={() => router.push('/events')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Explore Events
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
