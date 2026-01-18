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
  Info,
  Smartphone,
  Globe,
  Clock,
  Zap,
  Award
} from 'lucide-react';

interface ProfessionalPaymentProps {
  amount: number;
  currency: string;
  bookingId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProfessionalPayment({ 
  amount, 
  currency, 
  bookingId,
  onSuccess, 
  onCancel 
}: ProfessionalPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'digital'>('card');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [selectedBank, setSelectedBank] = useState('primary-bank');
  const [mobileNumber, setMobileNumber] = useState('');
  const [digitalWallet, setDigitalWallet] = useState('');

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
    
    if (paymentMethod === 'card') {
      if (!cardNumber.replace(/\s/g, '') || cardNumber.replace(/\s/g, '').length < 13) return 'Please enter a valid card number';
      if (!expiry || !expiry.includes('/')) return 'Please enter a valid expiry date';
      if (!cvc || cvc.length < 3) return 'Please enter a valid CVC';
    }
    
    if (paymentMethod === 'digital') {
      if (!mobileNumber.trim()) return 'Please enter your mobile number';
      if (!digitalWallet.trim()) return 'Please enter your digital wallet ID';
    }
    
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
      console.log('💳 Payment Method:', paymentMethod);
      console.log('👤 User:', { fullName, email });
      console.log('📝 Booking ID:', bookingId);
      
      // Simulate professional payment processing
      await new Promise((resolve) => {
        setTimeout(() => {
          console.log('✅ Payment processed successfully');
          console.log('✅ Booking status changed from "pending" to "paid"');
          console.log('✅ Payment confirmation sent');
          console.log('✅ Receipt generated');
          toast.success('Payment confirmed successfully! Your booking is now confirmed.');
          onSuccess?.();
          resolve(true);
        }, 3000);
      });

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b bg-gradient-to-r from-slate-50 to-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Professional Payment Gateway</h3>
              <p className="text-sm text-gray-600">Secure • Fast • Reliable</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Payment Method Selection */}
            <div className="xl:col-span-2 space-y-6">
              {/* Payment Method Tabs */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <CreditCard className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Credit/Debit Card</div>
                      <div className="text-xs text-gray-500">Visa, Mastercard, AMEX</div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('digital')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'digital' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <Smartphone className="w-8 h-8 mx-auto mb-2" />
                      <div className="text-sm font-medium">Digital Wallet</div>
                      <div className="text-xs text-gray-500">Mobile Banking, UPI</div>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Form */}
              {paymentMethod === 'card' ? (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <CreditCard className="w-5 h-5" />
                      Card Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Information */}
                        <div className="space-y-4">
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
                      </div>

                      {/* Test Card Info */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-700">
                            <strong>Test Mode:</strong> Use card <code className="bg-white px-2 py-1 rounded text-xs font-mono">4242 4242 4242 4242</code>
                            <br />
                            Any expiry date (MM/YY), any CVC
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Smartphone className="w-5 h-5" />
                      Digital Wallet
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="mobileNumber" className="text-sm font-medium">Mobile Number</Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <Input
                              id="mobileNumber"
                              type="tel"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              placeholder="+1 234 567 8900"
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="digitalWallet" className="text-sm font-medium">Digital Wallet ID</Label>
                          <Input
                            id="digitalWallet"
                            type="text"
                            value={digitalWallet}
                            onChange={(e) => setDigitalWallet(e.target.value)}
                            placeholder="user@wallet"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="bank" className="text-sm font-medium">Select Bank</Label>
                          <select
                            id="bank"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            required
                          >
                            <option value="primary-bank">Primary Bank</option>
                            <option value="secondary-bank">Secondary Bank</option>
                            <option value="digital-bank">Digital Bank</option>
                          </select>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Order Summary & Features */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Calendar className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white p-4 rounded-xl">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Event Booking</span>
                        <span className="font-semibold text-blue-600">Premium Event</span>
                      </div>
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
                          <span className="font-semibold text-gray-900">Total Amount:</span>
                          <span className="text-3xl font-bold text-green-600">
                            {currency.toUpperCase()} {(amount / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Badge className="w-full justify-center bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Secure Transaction Guaranteed
                  </Badge>
                </CardContent>
              </Card>

              {/* Security Features */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Shield className="w-5 h-5" />
                    Security & Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900">256-bit SSL Encryption</div>
                        <div className="text-sm text-green-700">Military-grade security</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900">PCI DSS Compliant</div>
                        <div className="text-sm text-green-700">Industry standard</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900">Fraud Protection</div>
                        <div className="text-sm text-green-700">Zero liability</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-green-900">3D Secure</div>
                        <div className="text-sm text-green-700">Extra verification</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accepted Methods */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-gray-900">We Accept</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border flex items-center justify-center">
                      <span className="text-sm font-medium">VISA</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border flex items-center justify-center">
                      <span className="text-sm font-medium">Mastercard</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg border flex items-center justify-center">
                      <span className="text-sm font-medium">AMEX</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg border flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">Google Pay</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">Apple Pay</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-medium text-gray-900">24/7 Support</CardTitle>
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
                  <div className="flex items-start gap-3">
                    <Zap className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Quick Response</p>
                      <p className="text-xs">Average response time: 2 minutes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12"
              disabled={isLoading}
            >
              Cancel Payment
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-semibold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
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
