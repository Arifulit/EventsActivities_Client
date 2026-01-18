'use client';

import React, { useMemo, useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';

interface CardPaymentFormProps {
  clientSecret: string;
  bookingId: string;
  amount: number; // amount in the smallest currency unit (e.g., cents)
  currency: string;
  onSuccess: (paymentIntentId: string, paymentMethodId: string) => void;
  onError?: (message: string) => void;
}

export default function CardPaymentForm({
  clientSecret,
  bookingId,
  amount,
  currency,
  onSuccess,
  onError,
}: CardPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const displayAmount = useMemo(() => (amount || 0) / 100, [amount]);
  const currencyUpper = useMemo(() => currency?.toUpperCase() || 'USD', [currency]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-complete?booking_id=${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        const message = error.message || 'Payment failed';
        setErrorMessage(message);
        onError?.(message);
        toast.error(message);
        return;
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        onSuccess(paymentIntent.id, (paymentIntent.payment_method as string) || '');
        toast.success('Payment confirmed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      setErrorMessage(message);
      onError?.(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Payment unavailable</p>
            <p className="text-sm">Missing client secret. Please retry.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center gap-2 text-gray-700">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <p className="text-sm">Your payment is securely processed by Stripe.</p>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total</span>
          <span className="text-lg font-semibold text-gray-900">
            {currencyUpper} {displayAmount.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              },
            },
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-red-50 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
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
              Pay {currencyUpper} {displayAmount.toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
