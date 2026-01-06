'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, MapPin, Users, Clock, DollarSign, Loader2, Edit, Trash2, Eye, TrendingUp } from 'lucide-react';
import { fetchUserJoinedEvents } from '@/lib/api';
import { getAuthToken, getUserData } from '@/app/lib/auth';
import Link from 'next/link';

interface Event {
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
  isPublic: boolean;
  participants: any[];
  waitingList: string[];
  createdAt: string;
  updatedAt: string;
}

interface EventsResponse {
  success: boolean;
  message: string;
  data: {
    hosted: Event[];
    joined?: Event[];
  };
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  timestamp: string;
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalParticipants: 0
  });

  useEffect(() => {
    const fetchUserEventsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = getUserData();
        if (!user?._id) {
          throw new Error('User not found');
        }

        const data: EventsResponse = await fetchUserJoinedEvents(user._id, activeTab === 'all' ? {} : { status: activeTab });
        console.log('API Response:', data);
        console.log('Data type:', typeof data.data);
        console.log('Is array?', Array.isArray(data.data));
        console.log('Data content:', data.data);
        
        // Extract events from the correct nested structure
        const eventsData = data.data?.hosted || [];
        console.log('Events array:', eventsData);
        console.log('Is events array?', Array.isArray(eventsData));
        
        setEvents(eventsData);
        
        // Calculate stats - only fetch all events once when on 'all' tab
        if (activeTab === 'all') {
          const allEventsData = data.data?.hosted || [];
          console.log('All events data:', allEventsData);
          console.log('Is array?', Array.isArray(allEventsData));
          
          if (!Array.isArray(allEventsData)) {
            console.error('allEventsData is not an array:', allEventsData);
            return;
          }
          
          const upcoming = allEventsData.filter((event: Event) => new Date(event.date) > new Date());
          const past = allEventsData.filter((event: Event) => new Date(event.date) <= new Date());
          const totalParticipants = allEventsData.reduce((sum: number, event: Event) => sum + event.currentParticipants, 0);
          
          setStats({
            totalEvents: allEventsData.length,
            upcomingEvents: upcoming.length,
            pastEvents: past.length,
            totalParticipants
          });
        }
      } catch (error: any) {
        console.error('Error fetching user events:', error);
        setError(error.message || 'Failed to fetch your events');
      } finally {
        setLoading(false);
      }
    };

    fetchUserEventsData();
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading your events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Events</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
        <p className="text-gray-600">Manage and track events you've created</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                <p className="text-sm text-gray-500">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pastEvents}</p>
                <p className="text-sm text-gray-500">Past Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                <p className="text-sm text-gray-500">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'past'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Events
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events.length > 0 ? (
          events.map((event) => (
            <Card key={event._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Event Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-600 line-clamp-2">{event.description}</p>
                      </div>
                      <Badge 
                        variant={event.status === 'published' ? 'default' : 'secondary'}
                        className="ml-4"
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{formatTime(event.time)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{event.location.venue}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{event.currentParticipants}/{event.maxParticipants}</span>
                      </div>
                      {event.price > 0 && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{event.price}</span>
                        </div>
                      )}
                      <Badge variant="outline">{event.type}</Badge>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:ml-6">
                    <Link href={`/events/${event._id}`}>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/host/events/${event._id}/edit`}>
                      <Button size="sm" className="w-full sm:w-auto">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming events."
                  : activeTab === 'past'
                  ? "You don't have any past events."
                  : "You haven't created any events yet."
                }
              </p>
              <Link href="/dashboard/host/events/create">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
