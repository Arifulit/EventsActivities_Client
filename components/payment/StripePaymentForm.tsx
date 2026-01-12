/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { toast } from 'react-hot-toast';
import { Loader2, CreditCard } from 'lucide-react';

// Initialize Stripe with publishable key (safe to use in frontend)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

interface StripePaymentFormProps {
  clientSecret: string;
  bookingId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const CheckoutForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  bookingId,
  onSuccess,
  onError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete?booking_id=${bookingId}`,
        },
      });

      if (error) {
        const errorMessage = error.message || 'Payment failed';
        toast.error(errorMessage);
        onError?.(errorMessage);
      } else {
        toast.success('Payment successful!');
        onSuccess?.();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          Your payment information is encrypted and secure. We never store your card details.
        </p>
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading || !stripe || !elements}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>
    </form>
  );
};

const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CheckoutForm {...props} />
        </CardContent>
      </Card>
    </Elements>
  );
};

export default StripePaymentForm;
