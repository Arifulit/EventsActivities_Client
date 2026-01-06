'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Brain
} from 'lucide-react';
import api from '@/app/lib/api';
import toast from 'react-hot-toast';
import AIEventManager from '@/app/components/ai/AIEventManager';
import { AIEventSuggestion } from '@/app/lib/ai-events';

export default function HostEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIManager, setShowAIManager] = useState(false);
  const [selectedEventForAI, setSelectedEventForAI] = useState<any>(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalParticipants: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    fetchHostedEvents();
  }, []);

  const fetchHostedEvents = async () => {
    try {
      const response = await api.get('/events/my-hosted');
      const eventsData = response.data.data;
      
      setEvents(eventsData);
      
      // Calculate stats
      const totalParticipants = eventsData.reduce((sum: number, event: any) => sum + event.currentParticipants, 0);
      const totalRevenue = eventsData.reduce((sum: number, event: any) => sum + (event.currentParticipants * event.price), 0);
      const upcomingEvents = eventsData.filter((event: any) => new Date(event.date) > new Date()).length;
      
      setStats({
        totalEvents: eventsData.length,
        totalParticipants,
        totalRevenue,
        upcomingEvents
      });
      
    } catch (error: any) {
      console.error('Failed to fetch hosted events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIEventUpdate = (updatedEventData: any) => {
    // Update the event in the local state
    setEvents(prev => prev.map(event => 
      event._id === updatedEventData._id ? updatedEventData : event
    ));
    
    // Update selected event for AI if it's the same
    if (selectedEventForAI && selectedEventForAI._id === updatedEventData._id) {
      setSelectedEventForAI(updatedEventData);
    }
    
    toast.success('Event updated with AI recommendations!');
  };

  const handleApplyAISuggestion = (suggestion: AIEventSuggestion) => {
    // Navigate to create event page with pre-filled data from AI suggestion
    const eventData = {
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      type: suggestion.type,
      date: suggestion.optimalDate,
      time: suggestion.optimalTime,
      duration: suggestion.suggestedDuration,
      price: suggestion.suggestedPrice,
      maxParticipants: suggestion.suggestedMaxParticipants,
      tags: suggestion.tags,
      requirements: suggestion.requirements
    };
    
    // Store in sessionStorage to pre-fill the create form
    sessionStorage.setItem('aiSuggestion', JSON.stringify(eventData));
    
    // Navigate to create event page
    window.location.href = '/dashboard/host/events/create';
  };

  const openAIManager = (event?: any) => {
    setSelectedEventForAI(event || null);
    setShowAIManager(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const publishedEvents = events.filter(event => event.status === 'open');
  const draftEvents = events.filter(event => event.status === 'draft');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Manage and track your hosted events</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => openAIManager()}
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            <Brain className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Link href="/dashboard/host/events/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Manager Modal/Section */}
      {showAIManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>AI Event Manager</span>
                </h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAIManager(false)}
                >
                  Close
                </Button>
              </div>
              
              <AIEventManager
                eventId={selectedEventForAI?._id}
                eventData={selectedEventForAI}
                onEventUpdate={handleAIEventUpdate}
                onApplySuggestion={handleApplyAISuggestion}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Events scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open ({publishedEvents.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftEvents.length})</TabsTrigger>
          <TabsTrigger value="all">All Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {publishedEvents.map((event) => (
              <Card key={event._id} className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="p-0">
                  <div className="relative">
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(event.status)}
                    </div>
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(event.status)}
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                            {event.title}
                          </h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${event.price}</p>
                        <Badge variant="outline" className="text-xs">
                          {event.currentParticipants}/{event.maxParticipants} joined
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.currentParticipants} joined</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${event.currentParticipants * event.price} revenue</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openAIManager(event)}
                          className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                        >
                          <Brain className="w-4 h-4 mr-1" />
                          AI Optimize
                        </Button>
                        <Link href={`/events/${event._id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/host/events/${event._id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No draft events</p>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {events.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first event to start hosting amazing experiences.
                </p>
                <Link href="/dashboard/host/events/create">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map((event) => (
                <Card key={event._id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="absolute top-2 right-2">
                        {getStatusBadge(event.status)}
                      </div>
                      <Badge className="absolute top-2 left-2" variant="secondary">
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(event.status)}
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                              {event.title}
                            </h3>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location.venue}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">${event.price}</p>
                          <Badge variant="outline" className="text-xs">
                            {event.currentParticipants}/{event.maxParticipants} joined
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{event.currentParticipants} joined</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${event.currentParticipants * event.price} revenue</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/events/${event._id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/dashboard/host/events/${event._id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {events.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first event to start hosting amazing experiences.
            </p>
            <Link href="/dashboard/host/events/create">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}