'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Constants
const EVENT_CATEGORY_COLORS: Record<string, string> = {
  technology: 'bg-blue-100 text-blue-800',
  music: 'bg-purple-100 text-purple-800',
  gaming: 'bg-indigo-100 text-indigo-800',
  sports: 'bg-green-100 text-green-800',
  education: 'bg-yellow-100 text-yellow-800',
  food: 'bg-orange-100 text-orange-800',
  photography: 'bg-pink-100 text-pink-800',
  travel: 'bg-teal-100 text-teal-800',
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  upcoming: 'bg-blue-100 text-blue-800',
  past: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Utility functions
const getCategoryColor = (category: string): string => 
  EVENT_CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-800';

const getStatusColor = (status: string): string => 
  EVENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

const formatDate = (dateString: string): string => 
  format(parseISO(dateString), 'MMM d, yyyy');

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

// Components
const LoadingState: React.FC = () => (
  <div className="container mx-auto py-12 flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    <span className="ml-2 text-gray-600">Loading your events...</span>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="container mx-auto py-12 text-center">
    <div className="bg-red-50 text-red-700 p-6 rounded-lg inline-block max-w-md">
      <h3 className="font-medium text-lg mb-2">Error loading events</h3>
      <p className="text-sm mb-4">{error}</p>
      <Button variant="outline" onClick={onRetry} className="mt-2">
        Retry
      </Button>
    </div>
  </div>
);

const StatsCard: React.FC<{ 
  title: string; 
  count: number; 
  icon: React.ReactNode; 
  color: string 
}> = ({ title, count, icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const EventCard: React.FC<{ event: Event; isHosted: boolean }> = ({ event, isHosted }) => (
  <Card className="hover:shadow-lg transition-all duration-300 group">
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
          <CardTitle className="text-xl line-clamp-2 group-hover:text-blue-600 transition-colors">
            {event.title}
          </CardTitle>
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
          <Button variant="outline" size="sm" className="w-full group-hover:bg-blue-50 transition-colors">
            <Eye className="w-4 h-4 mr-2" />
            {isHosted ? 'View' : 'View Details'}
          </Button>
        </Link>
        {isHosted && (
          <Link href={`/events/edit/${event._id}`} className="flex-1">
            <Button size="sm" className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        )}
      </div>
    </CardContent>
  </Card>
);

const EmptyState: React.FC<{ 
  type: 'hosting' | 'attending'; 
  userRole?: string; 
}> = ({ type, userRole }) => {
  const isHosting = type === 'hosting';
  const icon = isHosting ? CalendarIcon : UserCheck;
  const title = isHosting ? 'No events hosted yet' : 'No events joined yet';
  const description = isHosting 
    ? 'Create your first event to get started' 
    : 'Browse and join events that interest you';
  const action = isHosting && userRole === 'host' ? (
    <Link href="/events/create">
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Create Event
      </Button>
    </Link>
  ) : (
    <Link href="/events">
      <Button variant="outline">
        <Calendar className="w-4 h-4 mr-2" />
        Browse Events
      </Button>
    </Link>
  );

  return (
    <div className="text-center py-12">
      {React.createElement(icon, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" })}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action}
    </div>
  );
};

// Main Component
export default function MyEventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [eventsData, setEventsData] = useState<MyEventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('hosting');

  const fetchMyEvents = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getMyEvents();
      setEventsData(data);
    } catch (err: any) {
      console.error('Error fetching my events:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load your events';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMyEvents();
  }, [user, router, fetchMyEvents]);

  // Memoized calculations - completely safe approach
  const getHostedEvents = React.useCallback(() => {
    if (!eventsData?.data || !user?._id) return [];
    
    const userId = user._id;
    return eventsData.data.filter(event => {
      try {
        const hostId = typeof event.hostId === 'object' ? event.hostId?._id : event.hostId;
        return hostId === userId;
      } catch (error) {
        console.warn('Error processing event host:', error);
        return false;
      }
    });
  }, [eventsData, user]);

  const getJoinedEvents = React.useCallback(() => {
    if (!eventsData?.data || !user?._id) return [];
    
    const userId = user._id;
    return eventsData.data.filter(event => {
      try {
        const hostId = typeof event.hostId === 'object' ? event.hostId?._id : event.hostId;
        return event.participants?.includes(userId) && hostId !== userId;
      } catch (error) {
        console.warn('Error processing event participant:', error);
        return false;
      }
    });
  }, [eventsData, user]);

  // Only calculate when user exists
  const hostedEvents = user ? getHostedEvents() : [];
  const joinedEvents = user ? getJoinedEvents() : [];

  const stats = React.useMemo(() => {
    if (!eventsData?.data) return { total: 0, hosting: 0, attending: 0 };
    return {
      total: eventsData.data.length || 0,
      hosting: hostedEvents.length,
      attending: joinedEvents.length,
    };
  }, [eventsData, hostedEvents, joinedEvents]);

  // Render states
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <div className="text-lg font-medium text-gray-900">Loading user data...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={fetchMyEvents} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Manage events you're hosting and attending</p>
          </div>
          {user?.role === 'host' && (
            <Link href="/events/create">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Events"
          count={stats.total}
          icon={<Calendar className="w-6 h-6 text-blue-600" />}
          color="bg-blue-100"
        />
        <StatsCard
          title="Hosting"
          count={stats.hosting}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="bg-green-100"
        />
        <StatsCard
          title="Attending"
          count={stats.attending}
          icon={<UserCheck className="w-6 h-6 text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      {/* Events Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hosting" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Hosting ({stats.hosting})
          </TabsTrigger>
          <TabsTrigger value="attending" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Attending ({stats.attending})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hosting" className="mt-6">
          {hostedEvents.length === 0 ? (
            <EmptyState type="hosting" userRole={user?.role} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hostedEvents.map((event) => (
                <EventCard key={event._id} event={event} isHosted={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="attending" className="mt-6">
          {joinedEvents.length === 0 ? (
            <EmptyState type="attending" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedEvents.map((event) => (
                <EventCard key={event._id} event={event} isHosted={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
