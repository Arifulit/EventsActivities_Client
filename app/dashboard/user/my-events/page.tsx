'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Calendar, MapPin, Users, Clock, DollarSign, Loader2, Edit, Trash2, Eye, TrendingUp, Brain, Target, Lightbulb, ArrowUpRight, CheckCircle, Sparkles, Crown } from 'lucide-react';
import { getUserEvents } from '@/app/lib/api';
import { getAuthToken, getUserData } from '@/app/lib/auth';
import Link from 'next/link';
import AIEventInsights from '@/app/components/ai/AIEventInsights';

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
  hostId?: string | {
    _id: string;
    fullName: string;
    profileImage: string;
  };
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
  const [eventView, setEventView] = useState<'all' | 'hosted' | 'joined'>('all');
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

        const data: EventsResponse = await getUserEvents(user._id, activeTab === 'all' ? {} : { status: activeTab as any });
        console.log('API Response:', data);
        console.log('Data content:', data.data);
        
        // Extract events based on the selected view
        let eventsData: Event[] = [];
        if (eventView === 'hosted') {
          eventsData = data.data?.hosted || [];
        } else if (eventView === 'joined') {
          eventsData = data.data?.joined || [];
        } else {
          // Show all events (hosted + joined)
          const hostedEvents = data.data?.hosted || [];
          const joinedEvents = data.data?.joined || [];
          eventsData = [...hostedEvents, ...joinedEvents];
        }
        
        console.log('Events array:', eventsData);
        setEvents(eventsData);
        
        // Calculate stats - only fetch all events once when on 'all' tab
        if (activeTab === 'all' && data.data) {
          const hostedEvents = data.data?.hosted || [];
          const joinedEvents = data.data?.joined || [];
          const allEventsData = [...hostedEvents, ...joinedEvents];
          
          const upcoming = allEventsData.filter((event: Event) => event.date && new Date(event.date) > new Date());
          const past = allEventsData.filter((event: Event) => event.date && new Date(event.date) <= new Date());
          const totalParticipants = allEventsData.reduce((sum: number, event: Event) => {
            const participants = typeof event.currentParticipants === 'number' ? event.currentParticipants : 0;
            return sum + participants;
          }, 0);
          
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
  }, [activeTab, eventView]);

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

  const getEventRole = (event: Event) => {
    const user = getUserData();
    if (!user) return null;
    
    // Check if user is the host
    const isHost = (typeof event.hostId === 'object' && event.hostId._id === user._id) ||
                   (typeof event.hostId === 'string' && event.hostId === user._id);
    
    return isHost ? 'host' : 'participant';
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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
            <p className="text-gray-600 text-lg">Manage and track events you've created and joined</p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-100">
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">{stats.totalEvents} Total Events</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-900">{stats.totalEvents}</p>
              <p className="text-sm text-blue-600 font-medium">Total Events</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-900">{stats.upcomingEvents}</p>
              <p className="text-sm text-emerald-600 font-medium">Upcoming</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-slate-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <CheckCircle className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.pastEvents}</p>
              <p className="text-sm text-gray-600 font-medium">Past Events</p>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <Crown className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-900">{stats.totalParticipants || 0}</p>
              <p className="text-sm text-purple-600 font-medium">Total Participants</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Event View Selector */}
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => setEventView('all')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  eventView === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                All Events
              </button>
              <button
                onClick={() => setEventView('hosted')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  eventView === 'hosted'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Hosted by Me
              </button>
              <button
                onClick={() => setEventView('joined')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  eventView === 'joined'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Joined by Me
              </button>
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="lg:w-80">
          <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'past'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Past
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {events.length > 0 ? (
          events.map((event) => {
            const eventRole = getEventRole(event);
            const isUpcoming = new Date(event.date) > new Date();
            return (
              <Card key={event._id} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Left Gradient Border */}
                    <div className={`w-2 ${isUpcoming ? 'bg-gradient-to-b from-blue-500 to-purple-600' : 'bg-gradient-to-b from-gray-400 to-gray-600'}`} />
                    
                    <div className="flex-1 p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Event Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                  {event.title || 'Untitled Event'}
                                </h3>
                                {isUpcoming && (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs font-medium">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Upcoming
                                  </Badge>
                                )}
                              </div>
                              <p className="text-gray-600 line-clamp-2 mb-3">{event.description || 'No description available'}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge 
                                  variant={event.status === 'published' ? 'default' : 'secondary'}
                                  className="text-xs font-medium"
                                >
                                  {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
                                </Badge>
                                {eventRole === 'host' && (
                                  <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-xs font-medium">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Host
                                  </Badge>
                                )}
                                {eventRole === 'participant' && (
                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs font-medium">
                                    <Users className="w-3 h-3 mr-1" />
                                    Joined
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">{event.type || 'General'}</Badge>
                                <Badge variant="outline" className="text-xs">{event.category || 'Other'}</Badge>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Date</p>
                                <p className="text-sm font-medium text-gray-900">{formatDate(event.date) || 'No date'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Time</p>
                                <p className="text-sm font-medium text-gray-900">{formatTime(event.time) || 'No time'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <MapPin className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{event.location?.venue || 'No location'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <Users className="h-4 w-4 text-blue-500" />
                              <div>
                                <p className="text-xs text-gray-500">Participants</p>
                                <p className="text-sm font-medium text-gray-900">{event.currentParticipants || 0}/{event.maxParticipants || 0}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 lg:ml-6">
                          {(event.price || 0) > 0 && (
                            <div className="text-right p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <p className="text-2xl font-bold text-amber-900">${event.price || 0}</p>
                              <p className="text-xs text-amber-600">per ticket</p>
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <Link href={`/events/${event._id}`}>
                              <Button variant="outline" size="sm" className="w-full group hover:bg-purple-50 hover:border-purple-300 transition-all duration-200">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                                <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Button>
                            </Link>
                            {eventRole === 'host' && (
                              <Link href={`/dashboard/host/events/${event._id}/edit`}>
                                <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Event
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No events found</h3>
              <p className="text-gray-600 mb-8 text-lg">
                {activeTab === 'upcoming' 
                  ? "You don't have any upcoming events."
                  : activeTab === 'past'
                  ? "You don't have any past events."
                  : eventView === 'hosted'
                  ? "You haven't created any events yet."
                  : eventView === 'joined'
                  ? "You haven't joined any events yet."
                  : "You don't have any events yet."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {eventView === 'hosted' ? (
                  <Link href="/dashboard/host/events/create">
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Create Your First Event
                    </Button>
                  </Link>
                ) : (
                  <Link href="/events">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Target className="h-4 w-4 mr-2" />
                      Explore Events
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      {events.length > 0 && (
        <AIEventInsights 
          events={events}
          onOptimizeEvents={(optimizedEvents) => {
            console.log('AI Optimized Events:', optimizedEvents);
            // Handle optimized events - could update state or show notification
          }}
          onGenerateContent={(eventId, content) => {
            console.log('AI Generated Content for event:', eventId, content);
            // Handle AI-generated content - could show in modal or update event
          }}
        />
      )}
    </div>
  );
}
