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
    <div className="container mx-auto py-6 sm:py-8 px-4">
      {/* Header Section */}
      <div className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              My Bookings
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage your event bookings and tickets</p>
          </div>
          <Link href="/events">
            <Button variant="outline" className="w-full sm:w-auto border-green-200 hover:bg-green-50 hover:border-green-300">
              <Calendar className="w-4 h-4 mr-2" />
              Browse Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-xl">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-xl">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{filterBookings('upcoming').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-xl">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{pendingBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-gray-100 rounded-xl">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Past Events</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{pastBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-gray-100 rounded-xl">
          <TabsTrigger 
            value="upcoming" 
            className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span className="hidden sm:inline">Upcoming</span>
            <span className="sm:hidden">Up</span>
            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {upcomingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Past</span>
            <span className="sm:hidden">Past</span>
            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {pastBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700"
          >
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Pending</span>
            <span className="sm:hidden">Pen</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {pendingBookings.length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="cancelled" 
            className="flex items-center justify-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-green-700"
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Cancelled</span>
            <span className="sm:hidden">Can</span>
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {cancelledBookings.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No upcoming bookings</h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
                You don't have any confirmed bookings for upcoming events
              </p>
              <Link href="/events">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Events
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {upcomingBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`${getStatusColor(booking.data.status)} px-3 py-1 rounded-full`}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1 text-xs font-medium">{booking.data.status}</span>
                          </Badge>
                          {booking.event.price > 0 && (
                            <Badge variant="outline" className="text-green-600 border-green-200 px-3 py-1 rounded-full">
                              <DollarSign className="w-3 h-3 mr-1" />
                              <span className="text-xs font-medium">${booking.event.price}</span>
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{booking.event.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-xs sm:text-sm">{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span className="text-xs sm:text-sm">{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span className="text-xs sm:text-sm">{booking.event.location.city}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 text-xs sm:text-sm text-gray-500 space-y-1">
                          <p>Booking ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{booking.data.bookingId}</span></p>
                          <p>Booked on: {formatDate(booking.data.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                        <Link href={`/bookings/${booking.data.bookingId}/confirm`} className="flex-1 lg:flex-initial">
                          <Button size="sm" className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </Link>
                        <div className="flex gap-2 flex-1 lg:flex-initial">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDownloadTicket(booking)}
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Ticket</span>
                            <span className="sm:hidden">Tkt</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShareBooking(booking)}
                            className="flex-1"
                          >
                            <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Share</span>
                            <span className="sm:hidden">Shr</span>
                          </Button>
                        </div>
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
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No past events</h3>
              <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                You haven't attended any events yet
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {pastBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="opacity-75 hover:opacity-90 transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`${getStatusColor(booking.data.status)} px-3 py-1 rounded-full`}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1 text-xs font-medium">{booking.data.status}</span>
                          </Badge>
                          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium">Completed</span>
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{booking.event.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm">{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm">{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm">{booking.event.location.city}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                        <Link href={`/bookings/${booking.data.bookingId}/confirm`} className="flex-1 lg:flex-initial">
                          <Button size="sm" variant="outline" className="w-full lg:w-auto">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
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
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No pending bookings</h3>
              <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                All your bookings are confirmed
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {pendingBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="border-yellow-200 border-2 hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`${getStatusColor(booking.data.status)} px-3 py-1 rounded-full`}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1 text-xs font-medium">{booking.data.status}</span>
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium">Action Required</span>
                          </Badge>
                          {booking.event.price > 0 && (
                            <Badge variant="outline" className="text-green-600 border-green-200 px-3 py-1 rounded-full">
                              <DollarSign className="w-3 h-3 mr-1" />
                              <span className="text-xs font-medium">${booking.event.price}</span>
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{booking.event.description}</p>
                        
                        <div className="bg-yellow-50 border border-yellow-200 p-3 sm:p-4 rounded-xl mb-4">
                          <p className="text-sm text-yellow-800 font-medium">
                            This booking is pending confirmation. Please complete the payment to confirm your spot.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs sm:text-sm">{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs sm:text-sm">{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs sm:text-sm">{booking.event.location.city}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                        <Link href={`/bookings/${booking.data.bookingId}/confirm`} className="flex-1 lg:flex-initial">
                          <Button size="sm" className="w-full lg:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Complete Payment</span>
                            <span className="sm:hidden">Pay</span>
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
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No cancelled bookings</h3>
              <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
                You haven't cancelled any bookings
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {cancelledBookings.map((booking) => (
                <Card key={booking.data.bookingId} className="opacity-50 hover:opacity-75 transition-all duration-300 border-0 shadow-md bg-white/90 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <Badge className={`${getStatusColor(booking.data.status)} px-3 py-1 rounded-full`}>
                            {getStatusIcon(booking.data.status)}
                            <span className="ml-1 text-xs font-medium">{booking.data.status}</span>
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">{booking.event.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{booking.event.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-red-500" />
                            <span className="text-xs sm:text-sm">{formatDate(booking.event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-red-500" />
                            <span className="text-xs sm:text-sm">{formatTime(booking.event.time)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className="text-xs sm:text-sm">{booking.event.location.city}</span>
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
