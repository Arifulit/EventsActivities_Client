'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function JoinedEventsPage() {
  const [joinedEvents] = useState([
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      date: '2024-07-15',
      time: '6:00 PM',
      location: 'Central Park, New York',
      price: '$45',
      status: 'upcoming',
      bookingDate: '2024-01-10',
      ticketNumber: 'TKT-2024-001',
      attendees: 1250,
      organizer: 'NYC Events'
    },
    {
      id: 2,
      title: 'Tech Innovation Workshop',
      date: '2024-02-20',
      time: '2:00 PM',
      location: 'Tech Hub, San Francisco',
      price: '$25',
      status: 'completed',
      bookingDate: '2024-01-08',
      ticketNumber: 'TKT-2024-002',
      attendees: 85,
      organizer: 'TechLearn'
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      date: '2024-03-10',
      time: '12:00 PM',
      location: 'Downtown Plaza, Chicago',
      price: '$65',
      status: 'upcoming',
      bookingDate: '2024-01-05',
      ticketNumber: 'TKT-2024-003',
      attendees: 500,
      organizer: 'Chicago Food Events'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Joined Events</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {joinedEvents.length} events joined
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {joinedEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(event.status)}
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <p className="text-gray-600">by {event.organizer}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{event.price}</p>
                  <p className="text-sm text-gray-500">Ticket #{event.ticketNumber}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{event.date}</p>
                      <p className="text-sm text-gray-600">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{event.location}</p>
                      <p className="text-sm text-gray-600">{event.attendees} attending</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Booking Date</p>
                      <p className="text-sm text-gray-600">{event.bookingDate}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {event.status === 'upcoming' && (
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {joinedEvents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events joined yet</h3>
            <p className="text-gray-600 mb-6">
              Start exploring events and join the ones you're interested in.
            </p>
            <Button className="bg-green-600 hover:bg-green-700">
              Explore Events
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}