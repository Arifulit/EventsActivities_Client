'use client';

import { useState } from 'react';
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
  CheckCircle
} from 'lucide-react';

export default function HostEventsPage() {
  const [events] = useState([
    {
      id: 1,
      title: 'Summer Music Festival 2024',
      date: '2024-07-15',
      time: '6:00 PM',
      location: 'Central Park, New York',
      price: 45,
      capacity: 2000,
      registered: 1250,
      status: 'published',
      category: 'Music',
      revenue: 56250,
      rating: 4.8,
      image: '/api/placeholder/400/250'
    },
    {
      id: 2,
      title: 'Tech Innovation Workshop',
      date: '2024-02-20',
      time: '2:00 PM',
      location: 'Tech Hub, San Francisco',
      price: 25,
      capacity: 100,
      registered: 85,
      status: 'published',
      category: 'Workshop',
      revenue: 2125,
      rating: 4.6,
      image: '/api/placeholder/400/250'
    },
    {
      id: 3,
      title: 'Food & Wine Festival',
      date: '2024-03-10',
      time: '12:00 PM',
      location: 'Downtown Plaza, Chicago',
      price: 65,
      capacity: 500,
      registered: 450,
      status: 'draft',
      category: 'Food & Dining',
      revenue: 0,
      rating: 0,
      image: '/api/placeholder/400/250'
    },
    {
      id: 4,
      title: 'Art Exhibition: Modern Visions',
      date: '2024-04-05',
      time: '10:00 AM',
      location: 'Art Gallery, Los Angeles',
      price: 15,
      capacity: 200,
      registered: 180,
      status: 'published',
      category: 'Art & Culture',
      revenue: 2700,
      rating: 4.7,
      image: '/api/placeholder/400/250'
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
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

  const publishedEvents = events.filter(event => event.status === 'published');
  const draftEvents = events.filter(event => event.status === 'draft');
  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0);
  const totalAttendees = events.reduce((sum, event) => sum + event.registered, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/host/events/create">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedEvents.length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAttendees}</div>
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
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From published events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7</div>
            <p className="text-xs text-muted-foreground">
              Excellent feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Tabs defaultValue="published" className="space-y-4">
        <TabsList>
          <TabsTrigger value="published">Published ({publishedEvents.length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({draftEvents.length})</TabsTrigger>
          <TabsTrigger value="all">All Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {publishedEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-200">
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
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${event.price}</p>
                        <Badge variant="outline" className="text-xs">
                          ⭐ {event.rating}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.registered}/{event.capacity}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${event.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {draftEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-200 opacity-75">
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
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-600">${event.price}</p>
                        <p className="text-xs text-gray-500">Draft</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.registered}/{event.capacity}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-200">
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
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${event.price}</p>
                        {event.rating > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {event.rating}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.registered}/{event.capacity}</span>
                        </div>
                        {event.revenue > 0 && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>${event.revenue.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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