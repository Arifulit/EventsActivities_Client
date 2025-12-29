'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { getMyBookings, BookingResponse } from '@/app/lib/payments';
import { getEventById, Event } from '@/app/lib/events';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Download,
  Share2,
  ExternalLink,
  Loader2,
  Ticket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  QrCode
} from 'lucide-react';

interface BookingWithEvent extends BookingResponse {
  event: Event;
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyBookings();
  }, [user, router]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMyBookings();
      
      // Fetch event details for each booking
      const bookingsWithEvents = await Promise.all(
        response.data.map(async (booking: BookingResponse) => {
          try {
            const event = await getEventById(booking.data.eventId);
            return { ...booking, event };
          } catch (err) {
            console.error('Error fetching event for booking:', booking.data.eventId);
            return null;
          }
        })
      );

      const validBookings = bookingsWithEvents.filter(booking => booking !== null);
      setBookings(validBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load your bookings');
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDownloadTicket = (booking: BookingWithEvent) => {
    toast('Ticket download feature coming soon!');
  };

  const handleShareBooking = (booking: BookingWithEvent) => {
    if (navigator.share) {
      navigator.share({
        title: `My Booking: ${booking.event.title}`,
        text: `I'm attending ${booking.event.title} on ${formatDate(booking.event.date)}!`,
        url: window.location.origin + `/bookings/${booking.data.bookingId}/confirm`,
      });
    } else {
      navigator.clipboard.writeText(
        window.location.origin + `/bookings/${booking.data.bookingId}/confirm`
      );
      toast.success('Booking link copied to clipboard!');
    }
  };

  const filterBookings = (status: string) => {
    const now = new Date();
    return bookings.filter(booking => {
      const eventDate = new Date(booking.event.date);
      
      switch (status) {
        case 'upcoming':
          return eventDate >= now && booking.data.status === 'confirmed';
        case 'past':
          return eventDate < now;
        case 'pending':
          return booking.data.status === 'pending';
        case 'cancelled':
          return booking.data.status === 'cancelled';
        default:
          return true;
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading your bookings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          <h3 className="font-medium">Error loading bookings</h3>
          <p className="text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchMyBookings}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const upcomingBookings = filterBookings('upcoming');
  const pastBookings = filterBookings('past');
  const pendingBookings = filterBookings('pending');
  const cancelledBookings = filterBookings('cancelled');

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">Manage your event bookings and tickets</p>
          </div>
          <Link href="/events">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">{filterBookings('upcoming').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-2xl font-bold">{pastBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
              <p className="text-gray-600 mb-4">You don't have any confirmed bookings for upcoming events</p>
              <Link href="/events">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Events
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(booking.data.status)}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1">{booking.data.status}</span>
                          </Badge>
                          {booking.event.price > 0 && (
                            <Badge variant="outline" className="text-green-600">
                              <DollarSign className="w-3 h-3 mr-1" />
                              ${booking.event.price}
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{booking.event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{booking.event.location.city}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-sm text-gray-500">
                          <p>Booking ID: <span className="font-mono">{booking.data.bookingId}</span></p>
                          <p>Booked on: {formatDate(booking.data.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link href={`/bookings/${booking.data.bookingId}/confirm`}>
                          <Button size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadTicket(booking)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Ticket
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShareBooking(booking)}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No past events</h3>
              <p className="text-gray-600">You haven't attended any events yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(booking.data.status)}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1">{booking.data.status}</span>
                          </Badge>
                          <Badge variant="outline">Completed</Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4">{booking.event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{booking.event.location.city}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link href={`/bookings/${booking.data.bookingId}/confirm`}>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending bookings</h3>
              <p className="text-gray-600">All your bookings are confirmed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="border-yellow-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(booking.data.status)}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1">{booking.data.status}</span>
                          </Badge>
                          <Badge variant="outline">Action Required</Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4">{booking.event.description}</p>
                        
                        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-yellow-800">
                            This booking is pending confirmation. Please complete the payment to confirm your spot.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{booking.event.location.city}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link href={`/bookings/${booking.data.bookingId}/confirm`}>
                          <Button size="sm">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Complete Payment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          {cancelledBookings.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cancelled bookings</h3>
              <p className="text-gray-600">You haven't cancelled any bookings</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cancelledBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="opacity-50">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(booking.data.status)}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1">{booking.data.status}</span>
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold mb-2">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4">{booking.event.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{booking.event.location.city}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
