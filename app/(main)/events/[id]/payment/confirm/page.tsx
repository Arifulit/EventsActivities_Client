'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Download,
  Share2,
  ArrowRight,
  Home,
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';

interface BookingConfirmation {
  bookingId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  price: number;
  status: string;
  confirmedAt: string;
}

export default function PaymentConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const eventId = params.id as string;
  const paymentId = searchParams.get('paymentId');

  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    void confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, paymentId, user]);

  const confirmPayment = async () => {
    try {
      setIsLoading(true);

      // If paymentId provided, confirm the payment first
      if (paymentId) {
        await api.post(`/payments/confirm/${paymentId}`);
      }

      // Fetch booking confirmation
      const response = await api.get(`/bookings/confirm/${eventId}`);

      if (response.data.success) {
        setConfirmation(response.data.data);
        toast.success('Payment confirmed! Your booking is complete.');
      }
    } catch (error: unknown) {
      console.error('Confirmation error:', error);
      const apiError = error as { response?: { data?: { message?: string } } } | undefined;
      toast.error(
        apiError?.response?.data?.message || 'Failed to confirm payment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <p className="text-red-600 font-bold text-xl">!</p>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Payment Confirmation Failed
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t confirm your booking. Please try again or contact support.
            </p>
            <Button onClick={() => router.back()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600 text-lg">
            Your spot has been reserved for {confirmation.eventTitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Your Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {confirmation.eventTitle}
                    </h2>
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Confirmed
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Date</div>
                          <div>
                            {new Date(confirmation.eventDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Time</div>
                          <div>{confirmation.eventTime}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Location</div>
                          <div>{confirmation.eventLocation}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Attendee</div>
                          <div>{user?.fullName}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600">Booking ID</div>
                        <div className="font-mono text-sm font-semibold">
                          {confirmation.bookingId}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Amount Paid</div>
                        <div className="font-bold text-lg text-green-600">
                          ${confirmation.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Ticket
                  </Button>
                  <Button variant="outline">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Check Your Email</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      We&apos;ve sent a confirmation email with your ticket and event details
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Prepare for the Event</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Review the requirements and arrive 15 minutes early
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 font-semibold flex items-center justify-center shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Enjoy the Event</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Have a great time and leave a review after!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => router.push('/my-bookings')} className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  View My Bookings
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
                <Button
                  onClick={() => router.push('/events')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Browse More Events
                </Button>
              </CardContent>
            </Card>

            {/* Cancellation Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>Free Cancellation:</strong> Up to 24 hours before
                    the event
                  </p>
                  <p>
                    <strong>Refund Policy:</strong> Full refund if cancelled
                    within 24 hours
                  </p>
                  <p>
                    <strong>No-Show Policy:</strong> Non-refundable if you
                    don&apos;t attend
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
