/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, PaymentIntent } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'react-hot-toast';
import { Loader2, CreditCard, AlertCircle, Check } from 'lucide-react';
import { createPaymentIntent, confirmPayment, PaymentIntentResponse } from '@/app/lib/payments';
import { Event } from '@/app/lib/events';
import { useAuth } from '@/app/context/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  event: Event;
  quantity?: number;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

function CheckoutFormContent({ 
  event, 
  quantity = 1,
  onSuccess, 
  onCancel 
}: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentData, setPaymentIntentData] = useState<PaymentIntentResponse['data'] | null>(null);

  // Initialize payment intent
  useEffect(() => {
    if (event.price <= 0) return;

    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🚀 Initializing payment intent for:', {
          eventId: event._id,
          eventName: event.title,
          price: event.price,
          quantity
        });

        const response = await createPaymentIntent(event._id, quantity);

        console.log('✅ Payment intent response:', response);

        if (response.success) {
          setPaymentIntentData(response.data);
          console.log('✅ Payment intent data set:', {
            clientSecret: response.data.clientSecret?.substring(0, 20) + '...',
            bookingId: response.data.bookingId,
            amount: response.data.amount
          });
        } else {
          console.error('❌ Payment intent creation failed:', response);
          setError(response.message || 'Failed to initialize payment');
          toast.error(response.message || 'Failed to initialize payment');
        }
      } catch (err: any) {
        console.error('❌ Payment initialization error:', err);
        let errorMessage = err.message || 'Failed to initialize payment';
        
        // Handle specific error cases
        if (errorMessage.includes('already booked') || errorMessage.includes('already joined')) {
          errorMessage = 'You have already booked this event';
          setError(errorMessage);
          // Don't show toast for already booked - just show in modal
        } else if (errorMessage.includes('event is full')) {
          errorMessage = 'This event is already full';
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (errorMessage.includes('Event not found')) {
          errorMessage = 'This event is no longer available';
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [event._id, quantity, event.price, event.title]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !paymentIntentData) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete?booking_id=${paymentIntentData.bookingId}`,
          payment_method_data: {
            billing_details: {
              name: user?.fullName || 'Test User',
              email: user?.email || 'test@example.com',
            },
          },
        },
        redirect: 'if_required',
      });

      console.log('Stripe Payment Response:', { stripeError, paymentIntent });

      if (stripeError) {
        console.error('Stripe Error:', stripeError);
        setError(stripeError.message || 'Payment failed');
        toast.error(stripeError.message || 'Payment failed');
        setIsLoading(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        console.log('Payment succeeded, confirming with backend...');
        console.log('📝 Payment Details:', {
          paymentIntentId: paymentIntent.id,
          bookingId: paymentIntentData.bookingId,
          paymentMethod: paymentIntent.payment_method,
          amount: paymentIntent.amount,
          status: paymentIntent.status
        });
        
        // Confirm payment with backend
        try {
          const confirmResponse = await confirmPayment(
            paymentIntentData.bookingId,
            paymentIntent.id,
            paymentIntent.payment_method as string,
            `${window.location.origin}/payment-complete`
          );

          console.log('✅ Backend confirmation response:', confirmResponse);
          console.log('📊 Response details:', {
            success: confirmResponse.success,
            message: confirmResponse.message,
            data: confirmResponse.data,
            bookingId: confirmResponse.data?.bookingId,
            paymentStatus: confirmResponse.data?.paymentStatus
          });

          if (confirmResponse.success) {
            toast.success('💳 Payment confirmed! Booking created successfully.');
            onSuccess?.(confirmResponse.data);

            // Redirect to payment complete page with proper parameters
            setTimeout(() => {
              const params = new URLSearchParams({
                booking_id: paymentIntentData.bookingId,
                payment_intent: paymentIntent.id,
                status: 'success',
                timestamp: new Date().toISOString()
              });
              window.location.href = `/payment-complete?${params.toString()}`;
            }, 1500);
          } else {
            console.error('❌ Backend confirmation failed:', confirmResponse);
            setError(confirmResponse.message || 'Failed to confirm payment');
            toast.error(confirmResponse.message || 'Payment confirmation failed');
          }
        } catch (err: any) {
          console.error('❌ Payment confirmation error:', err);
          console.error('❌ Error details:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          const errorMessage = err.message || 'Failed to confirm payment';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = (event.price || 0) * quantity;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{event.title}</span>
            <span className="font-medium">${event.price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity:</span>
            <span className="font-medium">{quantity}</span>
          </div>
          <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
            <span>Total:</span>
            <span className="text-lg text-blue-600">${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Payment Element */}
      {paymentIntentData ? (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Card Information
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <PaymentElement
              options={{
                layout: 'tabs',
                fields: {
                  billingDetails: {
                    name: 'auto',
                    email: 'auto',
                  }
                }
              }}
            />
          </div>
          <p className="text-xs text-gray-500">
            <Check className="inline h-3 w-3 mr-1" />
            Your payment information is encrypted and secure
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Initializing payment...</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !stripe || !elements || !paymentIntentData}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${totalAmount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

interface PaymentModalElements {
  clientSecret: string;
}

const PaymentModal: React.FC<PaymentModalProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (props.event.price <= 0) {
      setLoading(false);
      return;
    }

    const initializePayment = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Initializing payment for event:', {
          eventId: props.event._id,
          eventName: props.event.title,
          price: props.event.price,
          quantity: props.quantity || 1
        });
        
        const response = await createPaymentIntent(props.event._id, props.quantity || 1);
        
        console.log('✅ Payment intent created:', response);
        
        if (response.success) {
          setClientSecret(response.data.clientSecret);
          console.log('✅ Client secret set successfully');
        } else {
          console.error('❌ Payment intent creation failed:', response);
          setError(response.message || 'Failed to create payment intent');
          toast.error(response.message || 'Failed to initialize payment');
        }
      } catch (err: any) {
        console.error('❌ Failed to initialize payment:', err);
        let errorMessage = err.message || 'Failed to initialize payment';
        
        // Handle specific error cases
        if (errorMessage.includes('already booked') || errorMessage.includes('already joined')) {
          errorMessage = 'You have already booked this event';
          setError(errorMessage);
          // Don't show toast for already booked - just show in modal
        } else if (errorMessage.includes('event is full')) {
          errorMessage = 'This event is already full';
          setError(errorMessage);
          toast.error(errorMessage);
        } else if (errorMessage.includes('Event not found')) {
          errorMessage = 'This event is no longer available';
          setError(errorMessage);
          toast.error(errorMessage);
        } else {
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [props.event._id, props.quantity, props.event.price, props.event.title]);

  if (props.event.price <= 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-600">This event is free to join</p>
        <Button
          onClick={() => props.onSuccess?.(null)}
          className="mt-4"
        >
          Proceed
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading payment...</span>
      </div>
    );
  }

  if (error) {
    const isAlreadyBooked = error.includes('already booked') || error.includes('already joined');
    const isEventFull = error.includes('event is full');
    const isEventNotFound = error.includes('no longer available') || error.includes('not found');
    
    return (
      <div className="text-center py-6">
        <AlertCircle className={`h-8 w-8 mx-auto mb-2 ${
          isAlreadyBooked ? 'text-yellow-500' : 
          isEventFull ? 'text-orange-500' : 
          isEventNotFound ? 'text-gray-500' : 'text-red-500'
        }`} />
        
        <h3 className={`text-lg font-semibold mb-2 ${
          isAlreadyBooked ? 'text-yellow-700' : 
          isEventFull ? 'text-orange-700' : 
          isEventNotFound ? 'text-gray-700' : 'text-red-700'
        }`}>
          {isAlreadyBooked ? 'Already Booked' : 
           isEventFull ? 'Event Full' : 
           isEventNotFound ? 'Event Unavailable' : 'Payment Error'}
        </h3>
        
        <p className={`mb-4 ${
          isAlreadyBooked ? 'text-yellow-600' : 
          isEventFull ? 'text-orange-600' : 
          isEventNotFound ? 'text-gray-600' : 'text-red-600'
        }`}>
          {error}
        </p>
        
        <div className="space-y-3">
          {isAlreadyBooked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">📅 Your Booking</h4>
              <p className="text-yellow-700 text-sm mb-3">
                You are already registered for this event. You can view your booking details in your dashboard.
              </p>
              <Button
                onClick={() => window.location.href = '/dashboard/user/my-bookings'}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                View My Bookings
              </Button>
            </div>
          )}
          
          <div className="flex gap-2 justify-center">
            {!isAlreadyBooked && (
              <Button
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => props.onCancel?.()}
              className="mt-2"
            >
              {isAlreadyBooked ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-6">
        <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <p className="text-yellow-600 mb-2">Unable to initialize payment</p>
        <p className="text-sm text-gray-500 mb-4">
          Payment could not be initialized. Please try again later.
        </p>
        <Button
          variant="outline"
          onClick={() => props.onCancel?.()}
          className="mt-4"
        >
          Close
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutFormContent {...props} />
    </Elements>
  );
};

export default PaymentModal;
