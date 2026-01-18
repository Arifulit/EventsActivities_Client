'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { CheckCircle, ArrowLeft, Calendar, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentCompletePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);

  const bookingId = searchParams.get('booking_id');
  const paymentIntentId = searchParams.get('payment_intent');
  const paymentStatus = searchParams.get('payment_status');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    // Log all URL parameters for debugging
    console.log('Payment Complete Page - URL Parameters:', {
      bookingId,
      paymentIntentId,
      paymentStatus,
      redirectStatus,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (bookingId && paymentIntentId) {
      // Payment was successful
      setPaymentData({
        bookingId,
        paymentIntentId,
        status: 'succeeded'
      });
    } else if (paymentStatus === 'failed' || redirectStatus === 'failed') {
      // Payment failed
      setPaymentData({
        status: 'failed',
        error: 'Payment was cancelled or failed'
      });
    } else {
      // Unknown status
      setPaymentData({
        status: 'unknown',
        error: 'Payment status could not be determined'
      });
    }

    setIsLoading(false);
  }, [bookingId, paymentIntentId, paymentStatus, redirectStatus, searchParams]);

  const handleViewBookings = () => {
    router.push('/dashboard/user/my-bookings');
  };

  const handleBackToEvents = () => {
    router.push('/events');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing payment status...</p>
        </div>
      </div>
    );
  }

  // Payment success
  if (paymentData?.status === 'succeeded') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-gray-700">
                  Your payment has been processed successfully and you have been registered for the event.
                </p>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Payment ID: {paymentIntentId}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Booking ID: {bookingId}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleViewBookings}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View My Bookings
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToEvents}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                A confirmation email has been sent to your registered email address.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Payment failed
  if (paymentData?.status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">Payment Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-gray-700">
                  {paymentData?.error || 'Your payment could not be processed. Please try again.'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.back()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBackToEvents}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Events
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                If you continue to experience issues, please contact support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Unknown status
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-yellow-800">Payment Status Unknown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-2">
              <p className="text-gray-700">
                We couldn't determine the status of your payment. Please check your bookings or contact support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleViewBookings}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                View My Bookings
              </Button>
              <Button
                variant="outline"
                onClick={handleBackToEvents}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
