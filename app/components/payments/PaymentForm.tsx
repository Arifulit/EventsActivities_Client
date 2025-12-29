'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'react-hot-toast';
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { createPaymentIntent, confirmBooking, PaymentIntentResponse, BookingResponse } from '@/app/lib/payments';
import { Event } from '@/app/lib/events';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  event: Event;
  onSuccess?: (booking: BookingResponse) => void;
  onCancel?: () => void;
}

function PaymentFormContent({ event, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!event || event.price === 0) return;

    const createIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await createPaymentIntent({
          eventId: event._id,
          amount: event.price * 100, // Convert to cents
          currency: 'usd',
          metadata: {
            eventName: event.title,
            eventId: event._id,
          },
        });

        if (response.success) {
          setClientSecret(response.data.clientSecret);
        } else {
          setError(response.message);
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to initialize payment';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    createIntent();
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/events/${event._id}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
        toast.error(submitError.message || 'Payment failed');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Confirm booking after successful payment
        try {
          const bookingResponse = await confirmBooking({
            bookingId: paymentIntent.id, // Use paymentIntentId as bookingId for now
            paymentIntentId: paymentIntent.id,
          });

          if (bookingResponse.success) {
            toast.success('Payment successful! You are now registered for the event.');
            onSuccess?.(bookingResponse);
          } else {
            setError(bookingResponse.message);
            toast.error(bookingResponse.message);
          }
        } catch (bookingError: any) {
          const errorMessage = bookingError.response?.data?.message || 'Failed to confirm booking';
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Payment processing failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Initializing payment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Payment Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
            <Button onClick={onCancel} variant="ghost">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <p>Unable to initialize payment</p>
            <Button onClick={onCancel} variant="outline" className="mt-4">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>
          Complete your payment to register for {event.title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Event Registration</span>
            <Badge variant="secondary">${event.price}</Badge>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center font-medium">
              <span>Total Amount</span>
              <span className="text-lg">${event.price}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement 
            options={{
              layout: 'tabs',
            }}
          />
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={!stripe || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ${event.price}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </form>

        <div className="mt-6 text-xs text-gray-500">
          <p>Your payment information is encrypted and secure.</p>
          <p>By completing this payment, you agree to the event terms and conditions.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentForm({ event, onSuccess, onCancel }: PaymentFormProps) {
  if (!event || event.price === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-medium">Free Event</p>
              <p className="text-sm">No payment required for this event</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Payment System Unavailable</p>
              <p className="text-sm">Payment processing is currently unavailable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret: event._id, // This will be replaced with actual client secret
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '6px',
          },
        },
      }}
    >
      <PaymentFormContent event={event} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
