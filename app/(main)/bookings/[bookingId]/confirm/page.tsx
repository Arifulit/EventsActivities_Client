'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { confirmBooking, getBookingDetails, BookingResponse } from '@/app/lib/payments';
import { getEventById, Event } from '@/app/lib/events';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  ArrowLeft,
  ExternalLink,
  Download,
  Share2
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingId = params.bookingId as string;
  const paymentIntentId = searchParams.get('payment_intent');

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, user, router]);

  const fetchBookingDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First try to get booking details
      const bookingData = await getBookingDetails(bookingId);
      setBooking(bookingData);

      // Get event details
      const eventData = await getEventById(bookingData.data.eventId);
      setEvent(eventData);

      // If booking is not confirmed and we have payment intent, confirm it
      if (bookingData.data.status === 'pending' && paymentIntentId) {
        await handleConfirmBooking();
      }
    } catch (err: any) {
      console.error('Error fetching booking details:', err);
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setIsConfirming(true);
    try {
      const response = await confirmBooking({
        bookingId,
        paymentIntentId: paymentIntentId || undefined,
      });

      setBooking(response);
      toast.success('Booking confirmed successfully!');
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      const errorMessage = error.response?.data?.message || 'Failed to confirm booking';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Booking Confirmed: ${event?.title}`,
        text: `I've registered for ${event?.title} on ${event?.date}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Booking link copied to clipboard!');
    }
  };

  const handleDownloadTicket = () => {
    // Generate ticket download
    toast('Ticket download feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
          <Button asChild>
            <Link href="/my-events">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Events
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const isConfirmed = booking.data.status === 'confirmed';
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Success Message */}
        <div className="mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isConfirmed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {isConfirmed ? (
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  ) : (
                    <Loader2 className="h-8 w-8 text-yellow-600 animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isConfirmed ? 'Booking Confirmed!' : 'Confirming Your Booking...'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isConfirmed 
                      ? `You're all set for ${event.title}`
                      : 'Please wait while we confirm your booking...'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600">{event.description}</p>
                </div>

                <div className="grid gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{formattedDate}</p>
                      <p className="text-sm text-gray-600">{event.time} • {event.duration} minutes</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{event.location.venue}</p>
                      <p className="text-sm text-gray-600">
                        {event.location.address}, {event.location.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Participants</p>
                      <p className="text-sm text-gray-600">
                        {event.currentParticipants} / {event.maxParticipants} spots filled
                      </p>
                    </div>
                  </div>

                  {event.price > 0 && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Price Paid</p>
                        <p className="text-sm text-gray-600">${event.price}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Booking ID</p>
                    <p className="font-medium font-mono">{booking.data.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge 
                      variant={isConfirmed ? 'default' : 'secondary'}
                      className={isConfirmed ? 'bg-green-100 text-green-800' : ''}
                    >
                      {booking.data.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-medium font-mono text-sm">{booking.data.paymentId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booked On</p>
                    <p className="font-medium">
                      {new Date(booking.data.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/events/${event._id}`}>
                  <Button className="w-full" variant="outline">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Event
                  </Button>
                </Link>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Booking
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleDownloadTicket}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Ticket
                </Button>

                {!isConfirmed && (
                  <Button 
                    className="w-full"
                    onClick={handleConfirmBooking}
                    disabled={isConfirming}
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/my-events" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    My Events
                  </Button>
                </Link>
                <Link href="/events" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Browse Events
                  </Button>
                </Link>
                <Link href="/support" className="block">
                  <Button variant="ghost" className="w-full justify-start">
                    Need Help?
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
