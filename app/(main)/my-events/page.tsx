'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { getMyEvents, Event, MyEventsResponse } from '@/app/lib/events';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CalendarIcon,
  UsersIcon,
  Settings,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';

export default function MyEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [eventsData, setEventsData] = useState<MyEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hosting');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyEvents();
  }, [user, router]);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyEvents();
      setEventsData(data);
    } catch (err: any) {
      console.error('Error fetching my events:', err);
      setError(err.response?.data?.message || 'Failed to load your events');
      toast.error('Failed to load your events');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      technology: 'bg-blue-100 text-blue-800',
      music: 'bg-purple-100 text-purple-800',
      gaming: 'bg-indigo-100 text-indigo-800',
      sports: 'bg-green-100 text-green-800',
      education: 'bg-yellow-100 text-yellow-800',
      food: 'bg-orange-100 text-orange-800',
      photography: 'bg-pink-100 text-pink-800',
      travel: 'bg-teal-100 text-teal-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      open: 'bg-green-100 text-green-800',
      upcoming: 'bg-blue-100 text-blue-800',
      past: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading your events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg inline-block">
          <h3 className="font-medium">Error loading events</h3>
          <p className="text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchMyEvents}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const hostedEvents = eventsData?.data.filter(event => 
    typeof event.hostId === 'object' ? event.hostId._id === user?._id : event.hostId === user?._id
  ) || [];

  const joinedEvents = eventsData?.data.filter(event => 
    event.participants.includes(user?._id || '') && 
    !(typeof event.hostId === 'object' ? event.hostId._id === user?._id : event.hostId === user?._id)
  ) || [];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Manage events you're hosting and attending</p>
          </div>
          {user?.role === 'host' && (
            <Link href="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{eventsData?.data.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hosting</p>
                <p className="text-2xl font-bold">{hostedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attending</p>
                <p className="text-2xl font-bold">{joinedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hosting" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hosting ({hostedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="attending" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Attending ({joinedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hosting" className="mt-6">
          {hostedEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events hosted yet</h3>
              <p className="text-gray-600 mb-4">Create your first event to get started</p>
              {user?.role === 'host' && (
                <Link href="/events/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostedEvents.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {event.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <div>{event.location.venue}</div>
                        <div className="text-gray-500">{event.location.city}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.currentParticipants}/{event.maxParticipants}</span>
                      </div>
                      {event.price > 0 && (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span>${event.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/events/${event._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/events/edit/${event._id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attending" className="mt-6">
          {joinedEvents.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events joined yet</h3>
              <p className="text-gray-600 mb-4">Browse and join events that interest you</p>
              <Link href="/events">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Browse Events
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedEvents.map((event) => (
                <Card key={event._id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getCategoryColor(event.category)}>
                            {event.category}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {event.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.time)}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <div>{event.location.venue}</div>
                        <div className="text-gray-500">{event.location.city}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.currentParticipants}/{event.maxParticipants}</span>
                      </div>
                      {event.price > 0 && (
                        <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span>${event.price}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Link href={`/events/${event._id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
