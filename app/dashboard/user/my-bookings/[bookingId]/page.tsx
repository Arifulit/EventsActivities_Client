'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Loader2, CreditCard, DollarSign, Star, MessageSquare } from 'lucide-react';
import { fetchBookingDetails, confirmPayment, createReview } from '@/lib/api';

interface BookingDetails {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
  };
  eventId: {
    _id: string;
    title: string;
    description: string;
    type: string;
    category: string;
    date: string;
    time: string;
    duration: number;
    price: number;
    image: string;
    images: string[];
    location: {
      venue: string;
      address: string;
      city: string;
    };
    requirements: string[];
    tags: string[];
    status: string;
    maxParticipants: number;
    currentParticipants: number;
  };
  hostId: {
    _id: string;
    fullName: string;
    email: string;
    profileImage: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
  quantity: number;
  currency: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
  paymentIntentId?: string;
}

interface ReviewData {
  rating: number;
  comment: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewData>({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        const response = await fetchBookingDetails(bookingId);
        setBookingDetails(response.data);
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        setError(error.message || 'Failed to fetch booking details');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingData();
    }
  }, [bookingId]);

  const handlePaymentCompletion = async () => {
    if (!bookingDetails) return;

    try {
      setProcessingPayment(true);
      
      // For testing: use the provided Payment Intent ID if no paymentIntentId in booking
      const testPaymentIntentId = bookingDetails.paymentIntentId || 'pi_3SlpnMK0TTEY76871Rit4P49';
      
      console.log('Attempting payment completion with:', {
        bookingId: bookingDetails._id,
        paymentIntentId: testPaymentIntentId
      });
      
      // Use Payment Intent ID if available, otherwise try with just bookingId
      const result = await confirmPayment(bookingDetails._id, testPaymentIntentId);
      
      if (result.success) {
        // Refresh booking details
        const response = await fetchBookingDetails(bookingId);
        setBookingDetails(response.data);
        alert('Payment completed successfully!');
      } else {
        alert(result.message || 'Payment completion failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Payment completion error:', error);
      
      // Provide specific guidance based on the error
      if (error.message.includes('Payment incomplete') || error.message.includes('paymentMethodId')) {
        alert('Payment requires additional information. Please complete the payment process using our secure payment form. This feature will be available soon.');
      } else if (error.message.includes('client secret')) {
        alert('Payment requires secure authentication. Please complete the payment on our secure payment page. This feature will be available soon.');
      } else {
        alert(error.message || 'Payment completion failed. Please contact support if the issue persists.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingDetails) return;
    
    try {
      setSubmittingReview(true);
      
      const result = await createReview(
        bookingDetails.eventId._id,
        reviewData.rating,
        reviewData.comment
      );
      
      if (result.success) {
        alert('Review submitted successfully!');
        setReviewData({ rating: 5, comment: '' });
        setShowReviewForm(false);
      } else {
        alert(result.message || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Review submission error:', error);
      alert(error.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading booking details...</span>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The booking you are looking for could not be found.'}</p>
          <Button onClick={() => router.push('/dashboard/user/my-bookings')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/user/my-bookings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Bookings
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Event Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{bookingDetails.eventId.title}</h2>
                <p className="text-gray-600 mt-2">{bookingDetails.eventId.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {new Date(bookingDetails.eventId.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{bookingDetails.eventId.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{bookingDetails.eventId.location.venue}</p>
                    <p className="text-sm text-gray-500">{bookingDetails.eventId.location.city}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Badge variant="outline">{bookingDetails.eventId.type}</Badge>
                <Badge variant="outline">{bookingDetails.eventId.category}</Badge>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="h-4 w-4" />
                  <span>{bookingDetails.eventId.currentParticipants}/{bookingDetails.eventId.maxParticipants}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Requirements */}
          {bookingDetails.eventId.requirements && bookingDetails.eventId.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {bookingDetails.eventId.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-gray-600">{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {bookingDetails.eventId.tags && bookingDetails.eventId.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {bookingDetails.eventId.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking ID</p>
                  <p className="font-medium text-sm">{bookingDetails._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="font-medium">
                    {new Date(bookingDetails.bookingDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{bookingDetails.quantity} tickets</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="font-medium">${bookingDetails.eventId.price}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-green-600">${bookingDetails.amount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge variant={bookingDetails.status === 'confirmed' ? 'default' : 
                                 bookingDetails.status === 'pending' ? 'secondary' : 'destructive'}>
                    {bookingDetails.status.charAt(0).toUpperCase() + bookingDetails.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Payment Status</span>
                  <Badge variant={bookingDetails.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                    {bookingDetails.paymentStatus.charAt(0).toUpperCase() + bookingDetails.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>

              {bookingDetails.paymentStatus === 'pending' && (
                <div className="space-y-2">
                  <Button
                    onClick={handlePaymentCompletion}
                    disabled={processingPayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Payment
                      </>
                    )}
                  </Button>
                  {bookingDetails.paymentIntentId && (
                    <p className="text-xs text-gray-500 text-center">
                      Payment ID: {bookingDetails.paymentIntentId}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host Information */}
          <Card>
            <CardHeader>
              <CardTitle>Host Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">{bookingDetails.hostId.fullName}</p>
                  <p className="text-sm text-gray-500">{bookingDetails.hostId.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Section - Only for completed events */}
          {bookingDetails.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Rate This Event</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showReviewForm ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      How was your experience at this event?
                    </p>
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Rating</label>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= reviewData.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="comment" className="block text-sm font-medium mb-2">
                        Comment
                      </label>
                      <textarea
                        id="comment"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Share your experience..."
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1"
                      >
                        {submittingReview ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Submit Review
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewData({ rating: 5, comment: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
