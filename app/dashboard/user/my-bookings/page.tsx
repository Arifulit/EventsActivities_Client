'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, DollarSign, MapPin, Users, Loader2, CreditCard, Info } from 'lucide-react';
import { fetchUserBookings, confirmPayment } from '@/lib/api';

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
        const data = await fetchUserBookings();
        
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
        const data = await fetchUserBookings();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              This month: ${stats.monthlySpent}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.eventsAttended}</div>
            <p className="text-xs text-muted-foreground">
              Great attendance!
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bookings.length > 0 ? (
              bookings.map((booking) => {
                const eventDate = new Date(booking.eventId.date);
                const isUpcoming = eventDate > new Date();
                
                return (
                  <div key={booking._id} className={`flex items-center justify-between p-4 border rounded-lg ${!isUpcoming ? 'opacity-75' : ''}`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 ${isUpcoming ? 'bg-blue-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                        <Calendar className={`w-5 h-5 ${isUpcoming ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{booking.eventId.title}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {eventDate.toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.eventId.location.city}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={booking.status === 'confirmed' ? 'default' : 
                                   booking.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <Badge 
                            variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${booking.amount}</p>
                      <p className="text-sm text-gray-500">Qty: {booking.quantity}</p>
                      <p className="text-xs text-gray-400">Booking ID: {booking._id}</p>
                      <div className="mt-2 space-y-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(booking._id)}
                          className="w-full"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        {booking.paymentStatus === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handlePaymentCompletion(booking._id, booking.paymentIntentId)}
                            disabled={processingPayment === booking._id}
                            className="bg-green-600 hover:bg-green-700 w-full"
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
                        {booking.paymentIntentId && (
                          <p className="text-xs text-gray-500">
                            Payment ID: {booking.paymentIntentId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bookings found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
