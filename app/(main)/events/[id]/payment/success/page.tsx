'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Users,
  Download,
  Share2,
  Mail,
  ArrowRight,
  Home,
  Calendar as CalendarIcon
} from 'lucide-react';
import { formatDate, formatTime, formatCurrency } from '@/app/lib/utils';

export default function PaymentSuccessPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setOrderId(`ORD-${Date.now()}`);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchEventDetails();
  }, [eventId, user, router]);

  const fetchEventDetails = async () => {
    try {
      // Mock data - replace with actual API call
      const mockEvent = {
        _id: eventId,
        name: 'Summer Music Festival',
        date: '2024-07-15',
        time: '18:00',
        location: 'Central Park, New York',
        joiningFee: 25,
        host: {
          fullName: 'Music Events Co.',
          email: 'info@musicevents.com'
        }
      };

      setEvent(mockEvent);
    } catch (error) {
      console.error('Failed to fetch event details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareEvent = () => {
    if (!isClient) return;
    
    if (navigator.share) {
      navigator.share({
        title: `I'm attending ${event?.name}!`,
        text: `Join me at ${event?.name} on ${formatDate(event?.date)} at ${event?.location}`,
        url: window.location.origin + `/events/${eventId}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/events/${eventId}`);
      alert('Event link copied to clipboard!');
    }
  };

  const handleDownloadTicket = () => {
    // Mock ticket download - replace with actual implementation
    const ticketData = {
      event: event?.name,
      date: formatDate(event?.date),
      time: formatTime(event?.time),
      location: event?.location,
      attendee: user?.fullName,
      orderId: orderId
    };

    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ticket-${event?.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 text-lg">
            You're all set! Your spot has been reserved for {event.name}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle>Your Ticket</CardTitle>
                <CardDescription>Event ticket and confirmation details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.name}</h2>
                    <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Confirmed
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Date</div>
                          <div>{formatDate(event.date)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Time</div>
                          <div>{formatTime(event.time)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Location</div>
                          <div>{event.location}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Attendee</div>
                          <div>{user?.fullName}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-600">Order ID</div>
                        <div className="font-mono text-sm">{orderId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Amount Paid</div>
                        <div className="font-bold text-lg">{formatCurrency(event.joiningFee)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button onClick={handleDownloadTicket} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Ticket
                  </Button>
                  <Button variant="outline" onClick={handleShareEvent}>
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card>
              <CardHeader>
                <CardTitle>Important Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Check-in</h4>
                      <p className="text-gray-600 text-sm">
                        Please arrive 15 minutes before the event start time. Bring a valid ID and your ticket confirmation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Cancellation Policy</h4>
                      <p className="text-gray-600 text-sm">
                        Free cancellation up to 24 hours before the event. After that, the fee is non-refundable.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-semibold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Contact Host</h4>
                      <p className="text-gray-600 text-sm">
                        If you have any questions, contact the host at {event.host.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={() => router.push('/events')} className="w-full">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Browse More Events
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>

            {/* Host Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Host Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium">{event.host.fullName}</h4>
                    <p className="text-sm text-gray-600">Event Organizer</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Host
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card>
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        Check your email for confirmation and ticket details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        Add the event to your calendar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700">
                        Invite friends to join the event
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready for more amazing events?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/events')} size="lg">
              Explore Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" size="lg">
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
