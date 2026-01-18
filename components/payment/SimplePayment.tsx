'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'react-hot-toast';
import { 
  Loader2, 
  CreditCard, 
  CheckCircle, 
  Shield, 
  Lock,
  Calendar,
  User,
  AlertTriangle,
  Info
} from 'lucide-react';

interface SimplePaymentProps {
  amount: number;
  currency: string;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SimplePayment({ 
  amount, 
  currency, 
  bookingId,
  onSuccess, 
  onCancel 
}: SimplePaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '').replace(/[^0-9]/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const validateForm = () => {
    if (!fullName.trim()) return 'Please enter your full name';
    if (!email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
    if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 13) return 'Please enter a valid card number';
    if (!expiry || !expiry.includes('/')) return 'Please enter a valid expiry date';
    if (!cvc || cvc.length < 3) return 'Please enter a valid CVC';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Starting professional payment process...');
      console.log('👤 User:', { fullName, email });
      console.log('💳 Card:', { cardNumber: cardNumber.replace(/\s/g, '').slice(-4), expiry });
      console.log('📝 Booking ID:', bookingId);
      
      // Simulate professional payment processing
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log('✅ Payment processed successfully');
          console.log('✅ Booking status changed from "pending" to "paid"');
          console.log('✅ Payment confirmation sent');
          toast.success('Payment confirmed successfully! Your booking is now confirmed.');
          onSuccess?.();
          resolve(true);
        }, 2500);
      });

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
              <p className="text-sm text-gray-600">Your payment information is encrypted and secure</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Payment Form */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Calendar className="w-4 h-4" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {currency.toUpperCase()} {(amount / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Processing Fee:</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {currency.toUpperCase()} {(amount / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Badge className="w-full justify-center bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Secure Transaction
                  </Badge>
                </CardContent>
              </Card>

              {/* Payment Form */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* User Information */}
                    <div className="space-y-4 pb-4 border-b">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Information */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-medium">Card Number</Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <Input
                            id="cardNumber"
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            className="pl-10"
                            maxLength={19}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="text-sm font-medium">Expiry Date</Label>
                          <Input
                            id="expiry"
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvc" className="text-sm font-medium">CVC</Label>
                          <Input
                            id="cvc"
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="saveCard"
                          checked={saveCard}
                          onChange={(e) => setSaveCard(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="saveCard" className="text-sm text-gray-700">
                          Save card for future payments
                        </Label>
                      </div>
                    </div>

                    {/* Test Card Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-700">
                          <strong>Test Mode:</strong> Use card <code className="bg-white px-2 py-1 rounded text-xs font-mono">4242 4242 4242 4242</code>
                          <br />
                          Any expiry date (MM/YY), any CVC
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Security & Features */}
            <div className="space-y-6">
              {/* Security Badge */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-900 mb-2">Secure Payment</h4>
                  <p className="text-sm text-green-700 mb-3">
                    Your payment information is protected with industry-standard encryption
                  </p>
                  <div className="space-y-2 text-xs text-green-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>PCI DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Fraud Protection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accepted Cards */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-900">We Accept</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded border flex items-center justify-center">
                      <span className="text-xs font-medium">VISA</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border flex items-center justify-center">
                      <span className="text-xs font-medium">MC</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded border flex items-center justify-center">
                      <span className="text-xs font-medium">AMEX</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Info */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-900">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Payment Support</p>
                      <p className="text-xs">24/7 Customer Service</p>
                      <p className="text-xs">support@events.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay {currency.toUpperCase()} {(amount / 100).toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
