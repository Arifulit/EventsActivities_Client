'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Loader2, Search, Calendar as CalendarIcon, MapPin, Users as UsersIcon, DollarSign, Star, Filter, Sparkles, TrendingUp, Clock, Heart, Leaf } from 'lucide-react';
import EventCard from '@/app/components/events/EventCard';
import { getEvents, Event } from '@/app/lib/events';

type EventStatus = 'open' | 'upcoming' | 'past' | 'cancelled';
type EventType = 'workshop' | 'meetup' | 'conference' | 'social' | 'party' | 'competition' | 'webinar' | 'all';

interface Filters {
  type: EventType;
  location: string;
  status: EventStatus;
  search: string;
}

export default function EventsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    type: (searchParams.get('type') as EventType) || 'all',
    location: searchParams.get('location') || '',
    status: (searchParams.get('status') as EventStatus) || 'open',
    search: searchParams.get('search') || ''
  });

  // Fetch events when filters change
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use our API service
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    // Update URL with current filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    
    // Only update URL if it's different to prevent infinite loops
    if (params.toString() !== searchParams.toString()) {
      router.replace(`/events?${params.toString()}`, { scroll: false });
    }
    
    fetchEvents();
  }, [filters, router, searchParams]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will trigger a refetch with the new filters
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      location: '',
      status: 'open',
      search: ''
    });
  };
  
  const getEventStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'past':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    if (filters.type && filters.type !== 'all' && event.type !== filters.type) return false;
    if (filters.location && event.location.city.toLowerCase() !== filters.location.toLowerCase()) return false;
    if (filters.status && event.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.venue.toLowerCase().includes(searchLower) ||
        event.location.city.toLowerCase().includes(searchLower) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Sort events by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Get stats for the page
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  const todayEvents = events.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length;
  const popularEvents = events.filter(e => e.currentParticipants >= e.maxParticipants * 0.8).length;

  if (loading) {
    return (
      <div className="container mx-auto py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading events...</span>
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
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
     
      <div className="container mx-auto py-12 px-4">
        {/* Search and Filters Section */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <Filter className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Search & Filter Events</h2>
            </div>
            
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search events, venues, tags..."
                      className="pl-12 h-14 text-base border-gray-200 focus:border-green-500 focus:ring-green-500"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => handleFilterChange('type', value as EventType)}
                  >
                    <SelectTrigger className="h-14 text-base border-gray-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="meetup">Meetup</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Input
                    placeholder="City"
                    className="h-14 text-base border-gray-200 focus:border-green-500 focus:ring-green-500"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                  />
                </div>
                
                <div>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value as EventStatus)}
                  >
                    <SelectTrigger className="h-14 text-base border-gray-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="past">Past</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetFilters} 
                  className="px-6 py-3 border-gray-200 hover:bg-gray-50"
                >
                  Reset Filters
                </Button>
                <div className="flex items-center gap-2 text-base text-gray-500 ml-auto">
                  <span>{sortedEvents.length} events found</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Events Grid Section */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-lg mx-auto">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CalendarIcon className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No events found</h3>
              <p className="text-lg text-gray-600 mb-8">
                {filters.search || filters.type !== 'all' || filters.location || filters.status !== 'open'
                  ? 'Try adjusting your filters to find more events.'
                  : 'There are no events available at the moment. Check back later!'}
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="px-8 py-3 border-gray-200 hover:bg-gray-50"
                >
                  Clear Filters
                </Button>
                <Link href="/events/create">
                  <Button className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    Create Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Events - Happening Today */}
            {sortedEvents.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900">Happening Today</h2>
                    <p className="text-gray-600 mt-1">Events scheduled for today</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 px-4 py-2 text-base font-medium">
                    {sortedEvents.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length} events
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedEvents.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onUpdate={(updatedEvent) => {
                        setEvents(prev => prev.map(e => e._id === updatedEvent._id ? updatedEvent : e));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Events Section */}
            {sortedEvents.filter(e => e.currentParticipants >= e.maxParticipants * 0.8).length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900">Popular Events</h2>
                    <p className="text-gray-600 mt-1">Trending events with high attendance</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 px-4 py-2 text-base font-medium">
                    {sortedEvents.filter(e => e.currentParticipants >= e.maxParticipants * 0.8).length} events
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedEvents.filter(e => e.currentParticipants >= e.maxParticipants * 0.8).slice(0, 6).map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      onUpdate={(updatedEvent) => {
                        setEvents(prev => prev.map(e => e._id === updatedEvent._id ? updatedEvent : e));
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Events Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-900">All Events</h2>
                  <p className="text-gray-600 mt-1">Browse all available events</p>
                </div>
                <Badge className="bg-green-100 text-green-700 px-4 py-2 text-base font-medium">
                  {sortedEvents.length} events
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedEvents.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onUpdate={(updatedEvent) => {
                      setEvents(prev => prev.map(e => e._id === updatedEvent._id ? updatedEvent : e));
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}