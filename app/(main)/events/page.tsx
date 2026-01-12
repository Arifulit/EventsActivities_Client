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
import { Loader2, Search, Calendar as CalendarIcon, MapPin, Users as UsersIcon, DollarSign, Star, Filter, Sparkles, TrendingUp, Clock, Heart, Leaf, ArrowUpRight, Globe, Zap, Target, Award, Compass } from 'lucide-react';
import EventCard from '@/app/components/events/EventCard';
import { getEvents, type Event } from '@/app/lib/events';
import ProfessionalSearch from '@/components/search/ProfessionalSearch';

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
  const [hasSearched, setHasSearched] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    type: (searchParams.get('type') as EventType) || 'all',
    location: searchParams.get('location') || '',
    status: (searchParams.get('status') as EventStatus) || 'open',
    search: searchParams.get('search') || ''
  });

  // Initial load only
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load initial events without filters
        const eventsData = await getEvents();
        setEvents(eventsData || []);
        setHasSearched(true);
      } catch (err) {
        console.error('Error loading events:', err);
        setError(err instanceof Error ? err.message : 'Failed to load events');
        setEvents([]); // Ensure events is always an array
      } finally {
        setLoading(false);
      }
    };

    initialLoad();
  }, []); // Only run once on mount

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Build filter parameters
      const params: any = {};
      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.location) params.location = filters.location;
      if (filters.status && filters.status !== 'open') params.status = filters.status;
      if (filters.search) params.search = filters.search;
      
      // Call API with filters
      const eventsData = await getEvents(params);
      setEvents(eventsData || []);
      
      // Update URL
      const urlParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) urlParams.set(key, value);
      });
      
      router.replace(`/events?${urlParams.toString()}`, { scroll: false });
    } catch (err) {
      console.error('Error searching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to search events');
      setEvents([]); // Ensure events is always an array
    } finally {
      setLoading(false);
    }
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

  // Sort events by date (upcoming first)
  const sortedEvents = (events || []).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  // Get stats for the page
  const totalEvents = events?.length || 0;
  const upcomingEvents = (events || []).filter(e => new Date(e.date) > new Date()).length;
  const todayEvents = (events || []).filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length;
  const popularEvents = (events || []).filter(e => e.currentParticipants >= e.maxParticipants * 0.8).length;

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Professional Header */}
     

        {/* Search and Filters Section */}
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-xl bg-white rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <Search className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Find Your Perfect Event</h2>
                    <p className="text-gray-600">Search and filter events that match your interests</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2">
                  {events.length} events found
                </Badge>
              </div>
            
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <ProfessionalSearch
                    value={filters.search}
                    onChange={(value) => handleFilterChange('search', value)}
                    onSearch={(query) => {
                      handleFilterChange('search', query);
                      handleSearch(new Event('submit') as any);
                    }}
                    placeholder="Search events, venues, tags..."
                    className="w-full"
                  />
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
              
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Events
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetFilters} 
                  className="px-8 py-3 border-gray-300 hover:bg-gray-50 font-medium transition-all duration-300"
                >
                  Reset Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Events Grid Section */}
        <div className="container mx-auto px-4 py-8">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-24">
              <div className="max-w-lg mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400" />
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
                    className="px-8 py-3 border-gray-300 hover:bg-gray-50 font-medium"
                  >
                    Clear Filters
                  </Button>
                  <Link href="/events/create">
                    <Button className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Clock className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Happening Today</h2>
                      <p className="text-gray-600">Events scheduled for today</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 border-red-200 px-4 py-2">
                    {sortedEvents.filter(e => new Date(e.date).toDateString() === new Date().toDateString()).length} events
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Popular Events</h2>
                      <p className="text-gray-600">Trending events with high attendance</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 px-4 py-2">
                    {sortedEvents.filter(e => e.currentParticipants >= e.maxParticipants * 0.8).length} events
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <CalendarIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">All Events</h2>
                    <p className="text-gray-600">Browse all available events</p>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-2">
                  {sortedEvents.length} events
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}