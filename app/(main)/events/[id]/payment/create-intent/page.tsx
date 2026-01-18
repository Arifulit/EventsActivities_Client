'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import {
  Loader2,
  CreditCard,
  Lock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/context/AuthContext';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardPaymentForm from '@/components/payment/CardPaymentForm';

// Initialize Stripe with proper logging
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
console.log('🔐 Stripe Initialization:');
console.log('   Key exists:', !!stripeKey);
console.log('   Key length:', stripeKey?.length || 0);
console.log('   Key prefix:', stripeKey?.substring(0, 20) || 'UNDEFINED');
console.log('   Key suffix:', stripeKey?.substring(-10) || 'UNDEFINED');
console.log('   Is test key:', stripeKey?.startsWith('pk_test_') ? '✅' : '❌');
console.log('   Is live key:', stripeKey?.startsWith('pk_live_') ? '⚠️ DANGER' : '✅ OK');

if (!stripeKey) {
  console.error('❌ CRITICAL: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined!');
  console.error('   Fix: Add to .env.local or .env file');
}

const stripePromise = loadStripe(stripeKey || 'pk_test_invalid_key_placeholder');

export default function CreatePaymentIntentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState<{ price: number; title: string; date: string; time: string } | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{ _id: string; eventId: string } | null>(null);
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string; id: string } | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    void fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]);

  const fetchDetails = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      
      console.log('📋 Fetching payment details...');
      console.log('📋 Event ID from URL:', eventId);
      
      // Fetch event details
      console.log('🔄 Fetching event details from /events/' + eventId);
      const eventRes = await api.get(`/events/${eventId}`);
      console.log('✅ Event details received:', eventRes.data.data);
      setEventDetails(eventRes.data.data);
      
      // Try to fetch existing booking (optional)
      console.log('🔄 Checking for existing booking...');
      try {
        const bookingRes = await api.get(`/bookings/my-bookings`);
        console.log('✅ All bookings received:', bookingRes.data.data);
        
        const currentBooking = bookingRes.data.data.find(
          (b: { eventId: { _id: string } | string }) => {
            const bookingEventId = typeof b.eventId === 'object' ? b.eventId._id : b.eventId;
            return bookingEventId === eventId;
          }
        );
        
        if (currentBooking) {
          console.log('✅ Found existing booking for this event:', currentBooking);
          setBookingDetails(currentBooking);
        } else {
          console.log('ℹ️ No existing booking found. Will create one with payment intent.');
        }
      } catch (bookingError) {
        console.log('ℹ️ No existing bookings found. Will create one with payment intent.');
      }
      
    } catch (error: unknown) {
      console.error('❌ Error fetching details:', error);
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      console.error('❌ Error response:', err?.response?.data);
      console.error('❌ Error status:', err?.response?.status);
      console.error('❌ Error message:', err?.message);
      
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || err?.message || 'Failed to load payment details';
      setFetchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePaymentIntent = async () => {
    console.log('🔍 Checking payment details...');
    console.log('🔍 eventDetails:', eventDetails);
    console.log('🔍 API Base URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🔍 User logged in:', !!user);
    console.log('🔍 User ID:', user?._id);
    
    if (!user) {
      console.error('❌ User not logged in');
      toast.error('Please login to continue');
      router.push('/login');
      return;
    }
    
    if (!eventDetails) {
      console.error('❌ Missing: eventDetails');
      toast.error('Event details not found. Please try again.');
      return;
    }

    setIsCreatingIntent(true);
    try {
      console.log('💳 Creating payment intent...');
      console.log('💳 Event ID:', eventId);
      console.log('💳 Event Price:', eventDetails.price);
      console.log('💳 Quantity: 1');
      console.log('💳 User ID:', user._id);
      console.log('💳 Request payload:', JSON.stringify({ eventId, quantity: 1 }, null, 2));

      // Create payment intent with correct parameters
      const response = await api.post('/payments/create-intent', {
        eventId: eventId,
        quantity: 1
      });

      console.log('✅ Payment intent created:', response.data);
      console.log('✅ Full response:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        // Update booking details with the returned bookingId
        if (response.data.data.bookingId) {
          setBookingDetails({
            _id: response.data.data.bookingId,
            eventId: eventId
          });
        }
        
        setPaymentIntent({
          clientSecret: response.data.data.clientSecret,
          id: response.data.data.paymentIntentId,
        });
        toast.success('Payment form ready');
      }
    } catch (error: unknown) {
      console.error('❌ Payment intent creation error:', error);
      
      const apiError = error as { 
        response?: { 
          data?: any;
          status?: number;
          statusText?: string;
        };
        message?: string;
      };
      
      console.error('❌ Error details:', {
        status: apiError?.response?.status,
        statusText: apiError?.response?.statusText,
        data: apiError?.response?.data,
        message: apiError?.message
      });
      
      // Show detailed error message
      let errorMessage = 'Failed to create payment';
      const status = apiError?.response?.status;
      const rawData = apiError?.response?.data;
      
      if (rawData) {
        if (typeof rawData === 'string') {
          // Detect backend returning HTML (likely server not running or wrong URL)
          if (rawData.trim().startsWith('<!DOCTYPE')) {
            errorMessage = 'Backend returned HTML instead of JSON. Is the backend running on the correct URL?';
          } else {
            errorMessage = rawData;
          }
        } else if (rawData.message) {
          errorMessage = rawData.message;
        } else if (rawData.error) {
          errorMessage = rawData.error;
        }
      } else if (apiError?.message) {
        errorMessage = apiError.message;
      }
      
      const finalMessage = `${status ? status + ' - ' : ''}${errorMessage}`;
      toast.error(finalMessage);
      setFetchError(finalMessage);
    } finally {
      setIsCreatingIntent(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string, paymentMethodId: string) => {
    try {
      console.log('✅ Payment successful, confirming with backend...');
      console.log('✅ Payment Intent ID:', paymentIntentId);
      console.log('✅ Payment Method ID:', paymentMethodId);

      // Redirect to payment complete page with details
      router.push(
        `/payment-complete?booking_id=${bookingDetails?._id}&payment_intent=${paymentIntentId}&payment_method_id=${paymentMethodId}`
      );
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process payment');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!eventDetails && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {fetchError ? 'Cannot Load Event' : 'Event Not Found'}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              {fetchError || 'The event details could not be loaded. Please try again.'}
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => router.push(`/events/${eventId}`)}
              >
                Back to Event
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => router.push('/events')}
              >
                View All Events
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFreeEvent = eventDetails?.price === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {eventDetails?.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {eventDetails?.date && new Date(eventDetails.date).toLocaleDateString()} at {eventDetails?.time}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Ticket</span>
                  <span className="font-semibold text-gray-900">
                    {isFreeEvent ? 'Free' : `$${eventDetails?.price}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity</span>
                  <span className="font-semibold text-gray-900">1</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">
                    {isFreeEvent ? 'Free' : `$${eventDetails?.price}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          {!isFreeEvent && (
            <>
              {!paymentIntent ? (
                // Show button to create payment intent
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Payment Method
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                      <Lock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Secure Payment</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreatePaymentIntent}
                      disabled={isCreatingIntent}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      {isCreatingIntent ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Setting up payment...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Proceed to Card Payment
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                // Show card payment form
                <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
                  <CardPaymentForm
                    clientSecret={paymentIntent.clientSecret}
                    bookingId={bookingDetails?._id || ''}
                    amount={Math.round((eventDetails?.price || 0) * 100)}
                    currency="usd"
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => {
                      toast.error(error);
                      setPaymentIntent(null);
                    }}
                  />
                </Elements>
              )}
            </>
          )}

          {/* Action Buttons */}
          {!paymentIntent && (
            <div className="space-y-3">
              {fetchError && (
                <Card className="bg-red-50 border-red-200 mb-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      Issue Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-sm text-red-600 font-semibold mb-2">
                        {fetchError}
                      </p>
                      <p className="text-xs text-red-500">
                        You must book this event first before proceeding to payment.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-red-700 font-semibold">How to fix:</p>
                      <ol className="text-xs text-red-600 space-y-1 ml-4 list-decimal">
                        <li>Click &ldquo;Go Back to Event&rdquo; button below</li>
                        <li>Click &ldquo;Book Event&rdquo; button on the event page</li>
                        <li>Wait for success confirmation</li>
                        <li>You&apos;ll be redirected back to payment</li>
                        <li>If not redirected, click &ldquo;Retry Here&rdquo; below</li>
                      </ol>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log('🔄 User clicked retry');
                          fetchDetails();
                        }}
                        className="border-red-300 text-red-600 hover:bg-red-100"
                      >
                        🔄 Retry Here
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFetchError(null);
                          setEventDetails(null);
                          setBookingDetails(null);
                        }}
                        className="border-gray-300"
                      >
                        Reset & Reload
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Button
                variant="default"
                onClick={() => router.back()}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
              >
                ← Go Back to Event
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/events')}
                className="w-full h-12"
              >
                View All Events
              </Button>
            </div>
          )}

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2 text-sm text-blue-900">
                <p>
                  ✓ You will receive a confirmation email after booking
                </p>
                <p>
                  ✓ Your ticket will be available in your bookings
                </p>
                <p>
                  ✓ You can cancel up to 24 hours before the event
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
