'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Calendar, MapPin, Users, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { fetchUserJoinedEvents } from '@/lib/api';
import { getUserData } from '@/app/lib/auth';

interface JoinedEvent {
  _id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  location: {
    city: string;
  };
  price: number;
  image: string;
  date?: string;
  time?: string;
  status?: 'upcoming' | 'completed' | 'cancelled';
  bookingDate?: string;
  ticketNumber?: string;
  attendees?: number;
  organizer?: string;
}

export default function JoinedEventsPage() {
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    // Get userId from auth utilities
    const userData = getUserData();
    console.log('User data from auth:', userData);
    
    if (userData) {
      setUserId(userData._id);
      console.log('Set userId:', userData._id);
    } else {
      console.log('No user data found, user may not be logged in');
    }
  }, []);

  useEffect(() => {
    const fetchJoinedEventsData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch events based on active tab
        const params = activeTab === 'all' ? {} : { status: activeTab };
        const data = await fetchUserJoinedEvents(userId, params);
        
        // Handle empty data response
        const events = data.data || [];
        setJoinedEvents(events);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch joined events');
        console.error('Error fetching joined events:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchJoinedEventsData();
    }
  }, [userId, activeTab]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'past':
        return <Badge className="bg-gray-100 text-gray-800">Past</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'past':
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading joined events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Joined Events</h2>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {joinedEvents.length} events
          </Badge>
        </div>
      </div>

      {/* Tabs for filtering */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Past Events
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Events
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {joinedEvents.map((event) => (
          <Card key={event._id} className="hover:shadow-md transition-all duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(event.status || 'upcoming')}
                    <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                    {getStatusBadge(event.status || 'upcoming')}
                  </div>
                  <p className="text-gray-600 mb-2">{event.description}</p>
                  <p className="text-gray-600">Category: {event.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">${event.price}</p>
                  <p className="text-sm text-gray-500">ID: {event._id}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}</p>
                      <p className="text-sm text-gray-600">{event.time || 'Time TBD'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{event.location.city}</p>
                      <p className="text-sm text-gray-600">{event.type} • {event.category}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium">Event Type</p>
                      <p className="text-sm text-gray-600">{event.type}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {(event.status === 'upcoming' || !event.status) && (
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

      {joinedEvents.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'upcoming' && 'No upcoming events'}
              {activeTab === 'past' && 'No past events'}
              {activeTab === 'all' && 'No events joined yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' && 'You don\'t have any upcoming events scheduled.'}
              {activeTab === 'past' && 'You haven\'t attended any past events yet.'}
              {activeTab === 'all' && 'Start exploring events and join the ones you\'re interested in.'}
            </p>
            {activeTab === 'all' && (
              <Button className="bg-green-600 hover:bg-green-700">
                Explore Events
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}