'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import {
  ArrowLeft,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  DollarSign
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/app/lib/utils';

export default function EventPaymentPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchEventDetails();
  }, [eventId, user, router]);

  const fetchEventDetails = async () => {
    try {
      // Fetch event details from API
      const response = await fetch(`/api/events/${eventId}`);
      
      if (!response.ok) {
        throw new Error('Event not found');
      }
      
      const eventData = await response.json();
      
      setEvent(eventData.data);
      setFormData(prev => ({
        ...prev,
        email: user?.email || ''
      }));
    } catch (error) {
      console.error('Failed to fetch event details:', error);
      // Set event to null to trigger error state
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } 
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    // Only allow numbers for CVV
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.cardNumber.replace(/\s/g, '')) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Invalid card number';
    }

    if (!formData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name is required';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format';
    }

    if (!formData.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment through actual payment gateway
      const paymentResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          amount: event.joiningFee,
          paymentMethod,
          paymentDetails: formData
        })
      });
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Payment failed');
      }
      
      const paymentResult = await paymentResponse.json();
      
      // Redirect to success page with payment details
      router.push(`/events/${eventId}/payment/success?paymentId=${paymentResult.paymentId}`);
    } catch (error: any) {
      console.error('Payment failed:', error);
      setErrors({ submit: error.message || 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading payment details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Event not found</div>
      </div>
    );
  }

  const processingFee = event.joiningFee * 0.03; // 3% processing fee
  const totalAmount = event.joiningFee + processingFee;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure payment for {event.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">{event.name}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)} at {formatTime(event.time)}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {event.currentParticipants}/{event.maxParticipants} participants
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Event fee: {formatCurrency(event.joiningFee)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                       onClick={() => setPaymentMethod('card')}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="w-4 h-4"
                    />
                    <CreditCard className="w-5 h-5" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>

                  {paymentMethod === 'card' && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                      {/* Card Details */}
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                            Card Number
                          </label>
                          <div className="relative">
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              placeholder="1234 5678 9012 3456"
                              maxLength={19}
                              className={`pl-12 ${errors.cardNumber ? 'border-red-500' : ''}`}
                            />
                            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          </div>
                          {errors.cardNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-2">
                            Cardholder Name
                          </label>
                          <Input
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className={errors.cardName ? 'border-red-500' : ''}
                          />
                          {errors.cardName && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                              Expiry Date
                            </label>
                            <Input
                              id="expiryDate"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              maxLength={5}
                              className={errors.expiryDate ? 'border-red-500' : ''}
                            />
                            {errors.expiryDate && (
                              <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                              CVV
                            </label>
                            <Input
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleChange}
                              placeholder="123"
                              maxLength={3}
                              className={errors.cvv ? 'border-red-500' : ''}
                            />
                            {errors.cvv && (
                              <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-medium">Contact Information</h4>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            className={errors.email ? 'border-red-500' : ''}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number (Optional)
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>

                      {errors.submit && (
                        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                          <span className="text-red-700">{errors.submit}</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing Payment...
                          </>
                        ) : (
                          `Pay ${formatCurrency(totalAmount)}`
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Secure Payment</h4>
                    <p className="text-sm text-gray-600">
                      Your payment information is encrypted and secure. We use industry-standard SSL encryption 
                      to protect your personal and financial data. Your card details are never stored on our servers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event Fee</span>
                  <span className="font-medium">{formatCurrency(event.joiningFee)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee (3%)</span>
                  <span className="font-medium">{formatCurrency(processingFee)}</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Instant confirmation</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card>
              <CardHeader>
                <CardTitle>Host Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-medium">{event.host.fullName}</h4>
                  <div className="text-sm text-gray-600">
                    <p>Rating: {event.host.rating}/5.0</p>
                    <p>Verified Host</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
