'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  Receipt,
  FileText
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

interface Booking {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    time: string;
    duration: number;
    location: {
      venue: string;
      address: string;
      city: string;
    };
    price: number;
    image: string;
  };
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    profileImage?: string;
  };
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentMethod: string;
  transactionId?: string;
  bookingDate: string;
  attendanceStatus: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      
      if (response.data.success) {
        setBooking(response.data.data);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch booking detail:', error);
      const errorMessage = (error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } }).response?.data?.message) || 'Failed to load booking details';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await api.patch(`/bookings/${bookingId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setBooking(response.data.data);
        toast.success(`Booking ${newStatus} successfully`);
      }
    } catch (error: unknown) {
      console.error('Failed to update booking status:', error);
      const errorMessage = (error instanceof Error ? error.message : (error as { response?: { data?: { message?: string } } }).response?.data?.message) || 'Failed to update booking status';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800"><Receipt className="w-3 h-3 mr-1" />Refunded</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading booking details...</span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
            <p className="text-gray-600 mt-1">Booking ID: {booking._id}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(booking.status)}
            {getPaymentStatusBadge(booking.paymentStatus)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.eventId.image && (
                <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={booking.eventId.image} 
                    alt={booking.eventId.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-semibold mb-2">{booking.eventId.title}</h3>
                <p className="text-gray-600">{booking.eventId.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-medium">
                      {format(parseISO(booking.eventId.date), 'MMM d, yyyy')} at {booking.eventId.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">{booking.eventId.duration} minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{booking.eventId.location.venue}</p>
                    <p className="text-sm text-gray-500">{booking.eventId.location.address}, {booking.eventId.location.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Badge className="mt-0.5">{booking.eventId.category}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Participant Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {booking.userId.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={booking.userId.profileImage} 
                    alt={booking.userId.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{booking.userId.fullName}</h3>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{booking.userId.email}</span>
                    </div>
                    
                    {booking.userId.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{booking.userId.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{booking.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount</span>
                  <span className="text-xl font-bold text-green-600">${booking.paymentAmount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium capitalize">{booking.paymentMethod || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  {getPaymentStatusBadge(booking.paymentStatus)}
                </div>

                {booking.transactionId && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Transaction ID</p>
                    <p className="text-sm font-mono">{booking.transactionId}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Booked On</p>
                <p className="font-medium">
                  {format(parseISO(booking.bookingDate || booking.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Attendance Status</p>
                <p className="font-medium capitalize">{booking.attendanceStatus || 'Not marked'}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {format(parseISO(booking.updatedAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {booking.status === 'pending' && (
                <>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => updateBookingStatus('confirmed')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Confirm Booking
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    className="w-full"
                    onClick={() => updateBookingStatus('cancelled')}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Cancel Booking
                  </Button>
                </>
              )}
              
              {booking.status === 'confirmed' && (
                <Button 
                  className="w-full"
                  onClick={() => updateBookingStatus('completed')}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Mark as Completed
                </Button>
              )}
              
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/host/events/${booking.eventId._id}`)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Event Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
